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
import { isSectionEnteringViewport, SCROLL_REVEAL_IO, TYPEWRITER_MS } from '../../scroll-reveal';

const LIFT_PX = 14;

/** `accent` en JSON debe ser string (p. ej. "1"): ngx-translate elimina booleanos en objetos anidados. */
type LeftBodyPart = { text: string; accent?: boolean | string };

/**
 * El typewriter arranca cuando esta sección entra en el viewport (IntersectionObserver),
 * no al salir del hero — así cada bloque se anima al llegar el usuario.
 */
@Component({
  selector: 'app-key-competencies-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './key-competencies-section.html',
  styleUrl: './key-competencies-section.css',
})
export class KeyCompetenciesSectionComponent {
  private readonly translate = inject(TranslateService);
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  /** Progreso 0–1 de la animación temporal (caret y estilos) */
  protected readonly typingProgress = signal(0);

  /** Fragmentos visibles del lead (texto + acentos) para el typewriter */
  protected readonly leftBodySegments = signal<{ text: string; accent: boolean }[]>([]);
  protected readonly rightBodyText = signal('');

  protected readonly leftLift = signal(LIFT_PX);
  protected readonly rightLift = signal(LIFT_PX);

  protected readonly leftOpacity = signal(0);
  protected readonly rightOpacity = signal(0);

  /** El typewriter terminó (lead + subtítulo completos) */
  protected readonly typingComplete = signal(false);

  /** Tarjetas: solo tras `typingComplete` y al estar el bloque en viewport (o fallback) */
  protected readonly cardsVisible = signal(false);

  private readonly kcCardsRef = viewChild<ElementRef<HTMLElement>>('kcCards');
  private readonly kcSectionRef = viewChild<ElementRef<HTMLElement>>('kcSection');
  private cardsIo: IntersectionObserver | null = null;
  private sectionIo: IntersectionObserver | null = null;
  private sectionFallbackScrollCleanup: (() => void) | null = null;

  private langEffectRef: EffectRef | null = null;

  /** Ya se disparó la escritura (no repetir hasta cambio de idioma) */
  private playStarted = false;

  private typingRafId: ReturnType<typeof requestAnimationFrame> | null = null;

  protected readonly caretPhase = computed(() => {
    this.typingProgress();
    this.activeLang.code();
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'none' as const;
    }
    const lenL = this.getLeftBodyPlainLength();
    const rightBody = this.translate.instant('keyCompetencies.rightBody') as string;
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
      this.disconnectCardsObserver();
      this.cancelTypingAnimation();
      if (this.langEffectRef) {
        this.langEffectRef.destroy();
        this.langEffectRef = null;
      }
    });

    afterNextRender(() => {
      queueMicrotask(() => {
        this.setupSectionEntryObserver(0);
        this.setupCardsReveal(0);
      });
      this.langEffectRef = effect(() => {
        this.activeLang.code();
        this.cancelTypingAnimation();
        this.playStarted = false;
        this.resetVisualState();
        this.ngZone.run(() => {
          queueMicrotask(() => {
            this.setupSectionEntryObserver(0);
            this.setupCardsReveal(0);
          });
        });
      });
    });
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

    const el = this.kcSectionRef()?.nativeElement;
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
        if (r.top < vh * 0.88 && r.bottom > vh * 0.06) {
          this.ngZone.run(() => this.onKcSectionEntered());
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
            this.ngZone.run(() => this.onKcSectionEntered());
            return;
          }
        }
      },
      SCROLL_REVEAL_IO,
    );
    this.sectionIo.observe(el);
  }

  private onKcSectionEntered(): void {
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

  private disconnectCardsObserver(): void {
    if (this.cardsIo) {
      this.cardsIo.disconnect();
      this.cardsIo = null;
    }
  }

  private setupCardsReveal(attempt: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const el = this.kcCardsRef()?.nativeElement;
    if (!el) {
      if (attempt < 24) {
        this.doc.defaultView?.requestAnimationFrame(() => this.setupCardsReveal(attempt + 1));
      }
      return;
    }

    this.disconnectCardsObserver();
    this.cardsIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.ngZone.run(() => this.tryShowCardsAfterTyping());
            return;
          }
        }
      },
      { root: null, threshold: 0.04, rootMargin: '0px 0px 10% 0px' },
    );
    this.cardsIo.observe(el);
  }

  private tryShowCardsAfterTyping(): void {
    if (!this.typingComplete() || this.cardsVisible()) {
      return;
    }
    this.cardsVisible.set(true);
    this.disconnectCardsObserver();
  }

  /** Si el bloque ya está en vista cuando termina el typewriter, mostrar sin esperar otro scroll */
  private revealCardsIfAlreadyInView(): void {
    if (!isPlatformBrowser(this.platformId) || !this.typingComplete() || this.cardsVisible()) {
      return;
    }
    const el = this.kcCardsRef()?.nativeElement;
    const win = this.doc.defaultView;
    if (!el || !win) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const vh = win.innerHeight;
    const intersecting = isSectionEnteringViewport(rect, vh);
    if (intersecting) {
      this.cardsVisible.set(true);
      this.disconnectCardsObserver();
    }
  }

  private cancelTypingAnimation(): void {
    if (this.typingRafId != null) {
      this.doc.defaultView?.cancelAnimationFrame(this.typingRafId);
      this.typingRafId = null;
    }
  }

  private resetVisualState(): void {
    this.typingProgress.set(0);
    this.typingComplete.set(false);
    this.cardsVisible.set(false);
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
    const raw = this.translate.instant('keyCompetencies.leftBody') as unknown;
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
    const rightBody = this.translate.instant('keyCompetencies.rightBody') as string;
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

    if (p >= 1) {
      if (!this.typingComplete()) {
        this.typingComplete.set(true);
        if (typeof IntersectionObserver === 'undefined') {
          this.cardsVisible.set(true);
        } else {
          queueMicrotask(() => {
            this.revealCardsIfAlreadyInView();
          });
        }
      }
    }
  }
}
