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
import { isSectionEnteringViewport, SCROLL_REVEAL_IO, TYPEWRITER_TITLE_MS } from '../../scroll-reveal';
const FALLBACK_TITLE_PARTS: TitlePart[] = [
  { text: 'Deja que la ' },
  { text: 'IA', accent: true },
  { text: ' haga el trabajo pesado. Tú ' },
  { text: 'diriges', accent: true },
  { text: ' el negocio.' },
];

const FALLBACK_BODY_PARTS: TitlePart[] = [
  { text: 'Automatiza lo repetido y acelera lo importante. ' },
  { text: 'Construyamos', accent: true },
  { text: ' juntos.' },
];

/** Igual que portfolio/keyCompetencies: `accent` puede venir como string desde ngx-translate. */
type TitlePart = { text: string; accent?: boolean | string };

@Component({
  selector: 'app-manifesto-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './manifesto.html',
  styleUrl: './manifesto.css',
})
export class ManifestoSectionComponent {
  private readonly translate = inject(TranslateService);
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  protected readonly typingProgress = signal(0);
  protected readonly titleSegments = signal<{ text: string; accent: boolean }[]>([]);

  private readonly manifestoTypewriterRef = viewChild<ElementRef<HTMLElement>>('manifestoTypewriter');
  private sectionIo: IntersectionObserver | null = null;
  private sectionFallbackScrollCleanup: (() => void) | null = null;

  private langEffectRef: EffectRef | null = null;
  private playStarted = false;
  private typingRafId: ReturnType<typeof requestAnimationFrame> | null = null;

  protected readonly caretVisible = computed(() => {
    this.typingProgress();
    this.activeLang.code();
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return this.typingProgress() < 1;
  });

  /** Imagen + texto + CTA: visible solo cuando el autoescrito del título terminó. */
  protected readonly staticBlockVisible = computed(() => {
    this.typingProgress();
    this.activeLang.code();
    return this.typingProgress() >= 1;
  });

  /** Texto lateral (rendimiento / IA resaltados); reacciona al idioma. */
  protected readonly bodyParts = computed(() => {
    this.activeLang.code();
    return this.getPartsFromKey('manifesto.body');
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectSectionObserver();
      this.cancelTypingAnimation();
      if (this.langEffectRef) {
        this.langEffectRef.destroy();
        this.langEffectRef = null;
      }
    });

    afterNextRender(() => {
      queueMicrotask(() => this.setupSectionEntryObserver(0));
      this.langEffectRef = effect(() => {
        this.activeLang.code();
        this.cancelTypingAnimation();
        this.playStarted = false;
        this.resetVisualState();
        this.ngZone.run(() => queueMicrotask(() => this.setupSectionEntryObserver(0)));
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

    const el = this.manifestoTypewriterRef()?.nativeElement;
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
          this.ngZone.run(() => this.onManifestoEntered());
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
            this.ngZone.run(() => this.onManifestoEntered());
            return;
          }
        }
      },
      SCROLL_REVEAL_IO,
    );
    this.sectionIo.observe(el);
  }

  private onManifestoEntered(): void {
    if (this.playStarted) {
      return;
    }
    this.playStarted = true;
    this.disconnectSectionObserver();

    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.applyTypingProgress(1);
      return;
    }
    this.startTypewriter();
  }

  private cancelTypingAnimation(): void {
    if (this.typingRafId != null) {
      this.doc.defaultView?.cancelAnimationFrame(this.typingRafId);
      this.typingRafId = null;
    }
  }

  private resetVisualState(): void {
    this.typingProgress.set(0);
    this.titleSegments.set([]);
  }

  private startTypewriter(): void {
    this.cancelTypingAnimation();
    const start = performance.now();
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }

    const tick = (now: number): void => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / TYPEWRITER_TITLE_MS);
      this.ngZone.run(() => this.applyTypingProgress(p));
      if (p < 1) {
        this.typingRafId = win.requestAnimationFrame(tick);
      } else {
        this.typingRafId = null;
      }
    };

    this.typingRafId = win.requestAnimationFrame(tick);
  }

  protected isAccentPart(part: TitlePart): boolean {
    const a = part.accent;
    if (a === true) {
      return true;
    }
    if (typeof a === 'string' && a.length > 0 && a !== '0' && a.toLowerCase() !== 'false') {
      return true;
    }
    return false;
  }

  private getPartsFromKey(baseKey: string): TitlePart[] {
    const raw = this.translate.instant(baseKey) as unknown;
    if (raw && typeof raw === 'object' && raw !== null && 'parts' in raw) {
      const parts = (raw as { parts: unknown }).parts;
      if (Array.isArray(parts)) {
        return parts.filter(
          (x): x is TitlePart => x != null && typeof x === 'object' && 'text' in x && typeof (x as TitlePart).text === 'string',
        ) as TitlePart[];
      }
    }
    if (baseKey === 'manifesto.title') {
      return FALLBACK_TITLE_PARTS;
    }
    if (baseKey === 'manifesto.body') {
      return FALLBACK_BODY_PARTS;
    }
    return [{ text: '' }];
  }

  private getTitleParts(): TitlePart[] {
    return this.getPartsFromKey('manifesto.title');
  }

  private getTitlePlainLength(): number {
    return this.getTitleParts().reduce((n, part) => n + part.text.length, 0);
  }

  private sliceTitleVisible(nChars: number): { text: string; accent: boolean }[] {
    let remaining = Math.max(0, Math.floor(nChars));
    const out: { text: string; accent: boolean }[] = [];
    for (const part of this.getTitleParts()) {
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

    const len = this.getTitlePlainLength();
    const total = Math.max(1, len);
    const u = p * total;
    const n = Math.min(len, Math.floor(u));

    this.titleSegments.set(this.sliceTitleVisible(n));
  }
}
