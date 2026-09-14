import { isPlatformBrowser } from '@angular/common';
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
  selector: 'app-lpc-cta',
  standalone: true,
  templateUrl: './lpc-cta.html',
  styleUrl: './lpc-cta.scss',
})
export class LpcCtaComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.parallax());
  }

  private parallax(): void {
    if (!isPlatformBrowser(this.platformId) || prefersReducedMotion()) {
      return;
    }
    registerLpcGsap();
    const glow = this.host.nativeElement.querySelector('.cta__glow');
    if (!(glow instanceof HTMLElement)) {
      return;
    }
    const ctx = gsap.context(() => {
      // Parallax suave del halo: 40px de recorrido
      gsap.to(glow, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: this.host.nativeElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
