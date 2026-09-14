import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
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
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ActiveLanguage } from '../../../locale/active-language';
import { isSectionEnteringViewport, SCROLL_REVEAL_IO } from '../../scroll-reveal';

type PricingPlan = {
  id: string;
  featured: boolean;
  nameKey: string;
  amountKey: string;
  bodyKey: string;
  itemKeys: readonly string[];
};

@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class PricingSectionComponent {
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  protected readonly visible = signal(false);
  private readonly sectionRef = viewChild<ElementRef<HTMLElement>>('pricingSection');
  private sectionIo: IntersectionObserver | null = null;
  private sectionFallbackScrollCleanup: (() => void) | null = null;
  private langEffectRef: EffectRef | null = null;
  private playStarted = false;

  protected readonly plans: PricingPlan[] = [
    {
      id: 'landing',
      featured: false,
      nameKey: 'homePricing.plans.landing.name',
      amountKey: 'homePricing.plans.landing.amount',
      bodyKey: 'homePricing.plans.landing.body',
      itemKeys: [
        'homePricing.plans.landing.items.a',
        'homePricing.plans.landing.items.b',
        'homePricing.plans.landing.items.c',
      ],
    },
    {
      id: 'growth',
      featured: true,
      nameKey: 'homePricing.plans.growth.name',
      amountKey: 'homePricing.plans.growth.amount',
      bodyKey: 'homePricing.plans.growth.body',
      itemKeys: [
        'homePricing.plans.growth.items.a',
        'homePricing.plans.growth.items.b',
        'homePricing.plans.growth.items.c',
      ],
    },
    {
      id: 'custom',
      featured: false,
      nameKey: 'homePricing.plans.custom.name',
      amountKey: 'homePricing.plans.custom.amount',
      bodyKey: 'homePricing.plans.custom.body',
      itemKeys: [
        'homePricing.plans.custom.items.a',
        'homePricing.plans.custom.items.b',
        'homePricing.plans.custom.items.c',
      ],
    },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectObserver();
      this.langEffectRef?.destroy();
      this.langEffectRef = null;
    });

    afterNextRender(() => {
      queueMicrotask(() => this.setupObserver(0));
      this.langEffectRef = effect(() => {
        this.activeLang.code();
        this.playStarted = false;
        this.visible.set(false);
        this.ngZone.run(() => queueMicrotask(() => this.setupObserver(0)));
      });
    });
  }

  private disconnectObserver(): void {
    this.sectionIo?.disconnect();
    this.sectionIo = null;
    this.sectionFallbackScrollCleanup?.();
    this.sectionFallbackScrollCleanup = null;
  }

  private setupObserver(attempt: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const el = this.sectionRef()?.nativeElement;
    if (!el) {
      if (attempt < 24) {
        this.doc.defaultView?.requestAnimationFrame(() => this.setupObserver(attempt + 1));
      }
      return;
    }
    this.disconnectObserver();

    if (typeof IntersectionObserver === 'undefined') {
      const win = this.doc.defaultView;
      if (!win) {
        return;
      }
      const onScroll = (): void => {
        if (this.playStarted) {
          return;
        }
        if (isSectionEnteringViewport(el.getBoundingClientRect(), win.innerHeight)) {
          this.ngZone.run(() => this.onEntered());
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
          this.ngZone.run(() => this.onEntered());
          return;
        }
      }
    }, SCROLL_REVEAL_IO);
    this.sectionIo.observe(el);
  }

  private onEntered(): void {
    if (this.playStarted) {
      return;
    }
    this.playStarted = true;
    this.disconnectObserver();
    this.visible.set(true);
  }
}
