import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { gsap, prefersReducedMotion, registerLpcGsap } from '../lpc-motion';

@Component({
  selector: 'app-lpc-hero',
  standalone: true,
  templateUrl: './lpc-hero.html',
  styleUrl: './lpc-hero.scss',
})
export class LpcHeroComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.playIntro());
  }

  protected goContact(event: Event): void {
    event.preventDefault();
    this.doc.getElementById('lpc-contacto')?.scrollIntoView({ behavior: 'smooth' });
  }

  private playIntro(): void {
    if (!isPlatformBrowser(this.platformId) || prefersReducedMotion()) {
      return;
    }
    registerLpcGsap();
    const root = this.host.nativeElement;
    const ctx = gsap.context(() => {
      // Tiempos de entrada del hero: título 1.1s, lead 0.9s, CTA 0.75s
      gsap.from('.lpc-hero__kicker', { y: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' });
      gsap.from('.lpc-hero__title', { y: 42, autoAlpha: 0, duration: 1.1, delay: 0.08, ease: 'power3.out' });
      gsap.from('.lpc-hero__lead', { y: 24, autoAlpha: 0, duration: 0.9, delay: 0.2, ease: 'power2.out' });
      gsap.from('.lpc-hero__cta', { y: 16, autoAlpha: 0, duration: 0.75, delay: 0.34, ease: 'power2.out' });
    }, root);
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
