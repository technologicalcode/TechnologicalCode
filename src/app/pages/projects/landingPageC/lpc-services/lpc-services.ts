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
  selector: 'app-lpc-services',
  standalone: true,
  templateUrl: './lpc-services.html',
  styleUrl: './lpc-services.scss',
})
export class LpcServicesComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.staggerIn());
  }

  private staggerIn(): void {
    if (!isPlatformBrowser(this.platformId) || prefersReducedMotion()) {
      return;
    }
    registerLpcGsap();
    const ctx = gsap.context(() => {
      // Entrada escalonada: 0.12s entre tarjetas
      gsap.from('.card', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.12,
        immediateRender: false,
        scrollTrigger: { trigger: '.cards', start: 'top 80%' },
      });
    }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
