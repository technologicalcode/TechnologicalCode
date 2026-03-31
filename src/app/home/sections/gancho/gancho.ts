import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  EffectRef,
  inject,
  NgZone,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { ActiveLanguage } from '../../../locale/active-language';
import { sectionIntersectsHeaderZone } from '../../../layout/header-zone-geometry';
import { HeaderZoneService } from '../../../layout/header-zone.service';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

type HookTextPart = { text: string; accent?: boolean | string };

@Component({
  selector: 'app-gancho-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './gancho.html',
  styleUrl: './gancho.css',
})
export class GanchoSectionComponent {
  private readonly translate = inject(TranslateService);
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly headerZone = inject(HeaderZoneService);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  private readonly ganchoSectionRef = viewChild<ElementRef<HTMLElement>>('ganchoSection');
  private headerZoneFallbackCleanup: (() => void) | null = null;
  private langEffectRef: EffectRef | null = null;

  protected readonly textParts = computed(() => {
    this.activeLang.code();
    return this.getTextParts();
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectGanchoHeaderZoneObserver();
      this.headerZone.inGanchoSection.set(false);
      if (this.langEffectRef) {
        this.langEffectRef.destroy();
        this.langEffectRef = null;
      }
    });

    afterNextRender(() => {
      queueMicrotask(() => this.setupGanchoHeaderZoneObserver(0));
      this.langEffectRef = effect(() => {
        this.activeLang.code();
        this.ngZone.run(() => queueMicrotask(() => this.setupGanchoHeaderZoneObserver(0)));
      });
    });
  }

  private disconnectGanchoHeaderZoneObserver(): void {
    if (this.headerZoneFallbackCleanup) {
      this.headerZoneFallbackCleanup();
      this.headerZoneFallbackCleanup = null;
    }
  }

  private setupGanchoHeaderZoneObserver(attempt: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const el = this.ganchoSectionRef()?.nativeElement;
    if (!el) {
      if (attempt < 24) {
        this.doc.defaultView?.requestAnimationFrame(() => this.setupGanchoHeaderZoneObserver(attempt + 1));
      }
      return;
    }

    this.disconnectGanchoHeaderZoneObserver();

    const apply = (intersecting: boolean): void => {
      this.headerZone.inGanchoSection.set(intersecting);
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

  protected isAccentPart(part: HookTextPart): boolean {
    const a = part.accent;
    if (a === true) {
      return true;
    }
    if (typeof a === 'string' && a.length > 0 && a !== '0' && a.toLowerCase() !== 'false') {
      return true;
    }
    return false;
  }

  private getTextParts(): HookTextPart[] {
    const raw = this.translate.instant('hook.text') as unknown;
    if (raw && typeof raw === 'object' && raw !== null && 'parts' in raw) {
      const parts = (raw as { parts: unknown }).parts;
      if (Array.isArray(parts)) {
        return parts.filter(
          (x): x is HookTextPart => x != null && typeof x === 'object' && 'text' in x && typeof (x as HookTextPart).text === 'string',
        ) as HookTextPart[];
      }
    }
    return [
      { text: 'Trabaja con nosotros con ' },
      { text: 'distintas formas de pago', accent: true },
      { text: ' para nuestra variedad de servicios.' },
    ];
  }
}
