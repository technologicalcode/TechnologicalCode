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
import { isSectionEnteringViewport, SCROLL_REVEAL_IO } from '../../scroll-reveal';

/** `accent` en JSON debe ser string: ngx-translate elimina booleanos en objetos anidados. */
type TextPart = { text: string; accent?: boolean | string };

const FALLBACK_TITLE: TextPart[] = [
  { text: 'Por qué ' },
  { text: 'elegirnos', accent: true },
];

const FALLBACK_BODY: TextPart[] = [
  {
    text: 'En TechnologicalCode combinamos IA con desarrolladores reales para entregarte tu página ',
  },
  { text: 'en días, no en meses', accent: true },
  {
    text: '. Nos encargamos de que funcione bien desde el despliegue hasta el día a día: resolvemos cualquier incidencia de mantenimiento ',
  },
  { text: 'rápido y sin vueltas', accent: true },
  { text: ', y sabrás siempre qué incluye tu plan, ' },
  { text: 'sin cobros ocultos ni sorpresas', accent: true },
  { text: ' después de la entrega.' },
];

@Component({
  selector: 'app-why-us-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './why-us.html',
  styleUrl: './why-us.css',
})
export class WhyUsSectionComponent {
  private readonly translate = inject(TranslateService);
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  protected readonly visible = signal(false);

  private readonly whyUsSectionRef = viewChild<ElementRef<HTMLElement>>('whyUsSection');
  private sectionIo: IntersectionObserver | null = null;
  private sectionFallbackScrollCleanup: (() => void) | null = null;
  private langEffectRef: EffectRef | null = null;
  private playStarted = false;

  protected readonly titleParts = computed(() => {
    this.activeLang.code();
    return this.getPartsFromKey('whyUs.title', FALLBACK_TITLE);
  });

  protected readonly bodyParts = computed(() => {
    this.activeLang.code();
    return this.getPartsFromKey('whyUs.body', FALLBACK_BODY);
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectSectionObserver();
      if (this.langEffectRef) {
        this.langEffectRef.destroy();
        this.langEffectRef = null;
      }
    });

    afterNextRender(() => {
      queueMicrotask(() => this.setupSectionEntryObserver(0));
      this.langEffectRef = effect(() => {
        this.activeLang.code();
        this.playStarted = false;
        this.visible.set(false);
        this.ngZone.run(() => queueMicrotask(() => this.setupSectionEntryObserver(0)));
      });
    });
  }

  protected isAccentPart(part: TextPart): boolean {
    const a = part.accent;
    if (a === true) {
      return true;
    }
    if (typeof a === 'string' && a.length > 0 && a !== '0' && a.toLowerCase() !== 'false') {
      return true;
    }
    return false;
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

    const el = this.whyUsSectionRef()?.nativeElement;
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
        if (isSectionEnteringViewport(r, win.innerHeight)) {
          this.ngZone.run(() => this.onSectionEntered());
        }
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      this.sectionFallbackScrollCleanup = () => win.removeEventListener('scroll', onScroll);
      return;
    }

    this.sectionIo = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.ngZone.run(() => this.onSectionEntered());
          return;
        }
      }
    }, SCROLL_REVEAL_IO);
    this.sectionIo.observe(el);
  }

  private onSectionEntered(): void {
    if (this.playStarted) {
      return;
    }
    this.playStarted = true;
    this.disconnectSectionObserver();
    this.visible.set(true);
  }

  private getPartsFromKey(baseKey: string, fallback: TextPart[]): TextPart[] {
    const raw = this.translate.instant(baseKey) as unknown;
    if (raw && typeof raw === 'object' && raw !== null && 'parts' in raw) {
      const parts = (raw as { parts: unknown }).parts;
      if (Array.isArray(parts)) {
        return parts.filter(
          (x): x is TextPart =>
            x != null && typeof x === 'object' && 'text' in x && typeof (x as TextPart).text === 'string',
        );
      }
    }
    return fallback;
  }
}
