import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  EffectRef,
  ElementRef,
  inject,
  NgZone,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActiveLanguage } from '../../../locale/active-language';
import { sectionIntersectsHeaderZone } from '../../../layout/header-zone-geometry';
import { HeaderZoneService } from '../../../layout/header-zone.service';
import { isSectionEnteringViewport, SCROLL_REVEAL_IO, TYPEWRITER_MS } from '../../scroll-reveal';

const LIFT_PX = 14;

/** `accent` en JSON como string: ngx-translate elimina booleanos en objetos anidados. */
type LeftBodyPart = { text: string; accent?: boolean | string };

@Component({
  selector: 'app-portfolio-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class PortfolioSectionComponent {
  private readonly translate = inject(TranslateService);
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly headerZone = inject(HeaderZoneService);

  protected readonly typingProgress = signal(0);
  protected readonly leftBodySegments = signal<{ text: string; accent: boolean }[]>([]);
  protected readonly rightBodyText = signal('');

  protected readonly leftLift = signal(LIFT_PX);
  protected readonly rightLift = signal(LIFT_PX);
  protected readonly leftOpacity = signal(0);
  protected readonly rightOpacity = signal(0);

  /** Solo el bloque del typewriter: la sección entera es muy alta; observarla disparaba mal o “perdía” el efecto */
  private readonly portfolioTypewriterRef = viewChild<ElementRef<HTMLElement>>('portfolioTypewriter');
  /** Toda la sección portfolio: para el color del header al entrar/salir */
  private readonly portfolioSectionRef = viewChild<ElementRef<HTMLElement>>('portfolioSection');
  private sectionIo: IntersectionObserver | null = null;
  private sectionFallbackScrollCleanup: (() => void) | null = null;
  private headerZoneFallbackCleanup: (() => void) | null = null;

  private langEffectRef: EffectRef | null = null;
  private playStarted = false;
  private typingRafId: ReturnType<typeof requestAnimationFrame> | null = null;

  /** Bloque estático (texto + collage): visible solo cuando el autoescrito terminó. */
  protected readonly staticContentVisible = computed(() => {
    this.typingProgress();
    this.activeLang.code();
    return this.typingProgress() >= 1;
  });

  protected readonly caretPhase = computed(() => {
    this.typingProgress();
    this.activeLang.code();
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'none' as const;
    }
    const lenL = this.getLeftBodyPlainLength();
    const rightBody = this.translate.instant('portfolio.rightBody') as string;
    const lenR = rightBody.length;
    const total = Math.max(1, lenL + lenR);
    const u = Math.max(0, Math.min(1, this.typingProgress())) * total;
    const nL = Math.min(lenL, Math.floor(u));
    const nR = Math.min(lenR, Math.max(0, Math.floor(u - lenL)));
    if (lenL > 0 && nL < lenL) {
      return 'left' as const;
    }
    if (lenR > 0 && nR < lenR) {
      return 'right' as const;
    }
    return 'none' as const;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectSectionObserver();
      this.disconnectPortfolioHeaderZoneObserver();
      this.headerZone.inPortfolioSection.set(false);
      this.cancelTypingAnimation();
      if (this.langEffectRef) {
        this.langEffectRef.destroy();
        this.langEffectRef = null;
      }
    });

    afterNextRender(() => {
      queueMicrotask(() => {
        this.setupSectionEntryObserver(0);
        this.setupPortfolioHeaderZoneObserver(0);
      });
      this.langEffectRef = effect(() => {
        this.activeLang.code();
        this.cancelTypingAnimation();
        this.playStarted = false;
        this.resetVisualState();
        this.ngZone.run(() =>
          queueMicrotask(() => {
            this.setupSectionEntryObserver(0);
            this.setupPortfolioHeaderZoneObserver(0);
          }),
        );
      });
    });
  }

  private disconnectPortfolioHeaderZoneObserver(): void {
    if (this.headerZoneFallbackCleanup) {
      this.headerZoneFallbackCleanup();
      this.headerZoneFallbackCleanup = null;
    }
  }

  private setupPortfolioHeaderZoneObserver(attempt: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const el = this.portfolioSectionRef()?.nativeElement;
    if (!el) {
      if (attempt < 24) {
        this.doc.defaultView?.requestAnimationFrame(() => this.setupPortfolioHeaderZoneObserver(attempt + 1));
      }
      return;
    }

    this.disconnectPortfolioHeaderZoneObserver();

    const apply = (intersecting: boolean): void => {
      this.headerZone.inPortfolioSection.set(intersecting);
    };
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }
    const onScroll = (): void => {
      const r = el.getBoundingClientRect();
      apply(sectionIntersectsHeaderZone(r));
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    this.headerZoneFallbackCleanup = () => {
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onScroll);
    };
  }

  private disconnectSectionObserver(): void {
    if (this.sectionIo) {
      this.sectionIo.disconnect();
      this.sectionIo = null;
    }
    if (this.sectionFallbackScrollCleanup) {
      this.sectionFallbackScrollCleanup();
      this.sectionFallbackScrollCleanup = null;
    }
  }

  private setupSectionEntryObserver(attempt: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const el = this.portfolioTypewriterRef()?.nativeElement;
    if (!el) {
      if (attempt < 24) {
        this.doc.defaultView?.requestAnimationFrame(() => this.setupSectionEntryObserver(attempt + 1));
      }
      return;
    }

    this.disconnectSectionObserver();

    if (typeof IntersectionObserver === 'undefined') {
      const win = this.doc.defaultView;
      if (!win) {
        return;
      }
      const onScroll = (): void => {
        if (this.playStarted) {
          return;
        }
        const r = el.getBoundingClientRect();
        const vh = win.innerHeight;
        if (isSectionEnteringViewport(r, vh)) {
          this.ngZone.run(() => this.onPortfolioSectionEntered());
        }
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      this.sectionFallbackScrollCleanup = () => win.removeEventListener('scroll', onScroll);
      return;
    }

    this.sectionIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.ngZone.run(() => this.onPortfolioSectionEntered());
            return;
          }
        }
      },
      SCROLL_REVEAL_IO,
    );
    this.sectionIo.observe(el);
  }

  private onPortfolioSectionEntered(): void {
    if (this.playStarted) {
      return;
    }
    this.playStarted = true;
    this.disconnectSectionObserver();

    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.applyTypingProgress(1);
      return;
    }
    this.startTypewriterTwoSeconds();
  }

  private cancelTypingAnimation(): void {
    if (this.typingRafId != null) {
      this.doc.defaultView?.cancelAnimationFrame(this.typingRafId);
      this.typingRafId = null;
    }
  }

  private resetVisualState(): void {
    this.typingProgress.set(0);
    this.leftBodySegments.set([]);
    this.rightBodyText.set('');
    this.leftLift.set(LIFT_PX);
    this.rightLift.set(LIFT_PX);
    this.leftOpacity.set(0);
    this.rightOpacity.set(0);
  }

  private startTypewriterTwoSeconds(): void {
    this.cancelTypingAnimation();
    const start = performance.now();
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }

    const tick = (now: number): void => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / TYPEWRITER_MS);
      this.ngZone.run(() => this.applyTypingProgress(p));
      if (p < 1) {
        this.typingRafId = win.requestAnimationFrame(tick);
      } else {
        this.typingRafId = null;
      }
    };

    this.typingRafId = win.requestAnimationFrame(tick);
  }

  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  private isAccentPart(part: LeftBodyPart): boolean {
    const a = part.accent;
    if (a === true) {
      return true;
    }
    if (typeof a === 'string' && a.length > 0 && a !== '0' && a.toLowerCase() !== 'false') {
      return true;
    }
    return false;
  }

  private getLeftBodyParts(): LeftBodyPart[] {
    const raw = this.translate.instant('portfolio.leftBody') as unknown;
    if (raw && typeof raw === 'object' && raw !== null && 'parts' in raw) {
      const parts = (raw as { parts: unknown }).parts;
      if (Array.isArray(parts)) {
        return parts.filter((x): x is LeftBodyPart => x != null && typeof x === 'object' && 'text' in x && typeof (x as LeftBodyPart).text === 'string') as LeftBodyPart[];
      }
    }
    if (typeof raw === 'string') {
      return [{ text: raw }];
    }
    return [{ text: '' }];
  }

  private getLeftBodyPlainLength(): number {
    return this.getLeftBodyParts().reduce((n, part) => n + part.text.length, 0);
  }

  private sliceLeftBodyVisible(nChars: number): { text: string; accent: boolean }[] {
    let remaining = Math.max(0, Math.floor(nChars));
    const out: { text: string; accent: boolean }[] = [];
    for (const part of this.getLeftBodyParts()) {
      if (remaining <= 0) {
        break;
      }
      const take = Math.min(part.text.length, remaining);
      if (take > 0) {
        out.push({ text: part.text.slice(0, take), accent: this.isAccentPart(part) });
        remaining -= take;
      }
    }
    return out;
  }

  private applyTypingProgress(progress: number): void {
    const p = Math.max(0, Math.min(1, progress));
    this.typingProgress.set(p);

    const lenL = this.getLeftBodyPlainLength();
    const rightBody = this.translate.instant('portfolio.rightBody') as string;
    const lenR = rightBody.length;
    const total = Math.max(1, lenL + lenR);
    const u = p * total;

    const nL = Math.min(lenL, Math.floor(u));
    const nR = Math.min(lenR, Math.max(0, Math.floor(u - lenL)));

    this.leftBodySegments.set(this.sliceLeftBodyVisible(nL));
    this.rightBodyText.set(rightBody.slice(0, nR));

    const lProg = lenL > 0 ? nL / lenL : 1;
    const rProg = lenR > 0 ? nR / lenR : 1;

    if (nL < lenL) {
      this.leftLift.set(lenL > 0 ? LIFT_PX * (1 - this.easeOutQuad(lProg)) : 0);
      this.leftOpacity.set(lenL === 0 ? 0 : nL > 0 ? 1 : 0);
      this.rightLift.set(LIFT_PX);
      this.rightOpacity.set(0);
      return;
    }

    this.leftLift.set(0);
    this.leftOpacity.set(lenL === 0 ? 0 : 1);

    if (nR < lenR) {
      this.rightLift.set(lenR > 0 ? LIFT_PX * (1 - this.easeOutQuad(rProg)) : 0);
      this.rightOpacity.set(lenR === 0 ? 0 : nR > 0 ? 1 : 0);
      return;
    }

    this.rightLift.set(0);
    this.rightOpacity.set(lenR === 0 ? 0 : 1);
  }
}
