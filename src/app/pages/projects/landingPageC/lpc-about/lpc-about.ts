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
  selector: 'app-lpc-about',
  standalone: true,
  templateUrl: './lpc-about.html',
  styleUrl: './lpc-about.scss',
})
export class LpcAboutComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.reveal());
  }

  private reveal(): void {
    if (!isPlatformBrowser(this.platformId) || prefersReducedMotion()) {
      return;
    }
    registerLpcGsap();
    const ctx = gsap.context(() => {
      // Fade-up al entrar al viewport (start: 82% desde arriba)
      gsap.from('.about__copy, .about__photo', {
        y: 36,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
        stagger: 0.12,
        immediateRender: false,
        scrollTrigger: { trigger: this.host.nativeElement, start: 'top 82%' },
      });
    }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
