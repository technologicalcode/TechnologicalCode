import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { gsap, prefersReducedMotion, registerLpcGsap } from '../lpc-motion';

export type LpcShot = { src: string; alt: string };

@Component({
  selector: 'app-lpc-gallery',
  standalone: true,
  templateUrl: './lpc-gallery.html',
  styleUrl: './lpc-gallery.scss',
})
export class LpcGalleryComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly shots: LpcShot[] = [
    {
      src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=70',
      alt: 'Sala con luz lateral y madera clara',
    },
    {
      src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=70',
      alt: 'Cocina abierta hacia el jardín',
    },
    {
      src: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1000&q=70',
      alt: 'Fachada de concreto y vegetación',
    },
    {
      src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=70',
      alt: 'Dormitorio con patio interior',
    },
    {
      src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdbc?auto=format&fit=crop&w=1000&q=70',
      alt: 'Escalera de concreto visto',
    },
    {
      src: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1000&q=70',
      alt: 'Terraza al atardecer',
    },
  ];

  protected readonly active = signal<LpcShot | null>(null);

  constructor() {
    afterNextRender(() => this.reveal());
  }

  protected open(shot: LpcShot): void {
    this.active.set(shot);
  }

  protected close(): void {
    this.active.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    this.close();
  }

  private reveal(): void {
    if (!isPlatformBrowser(this.platformId) || prefersReducedMotion()) {
      return;
    }
    registerLpcGsap();
    const ctx = gsap.context(() => {
      gsap.from('.shot', {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.grid', start: 'top 82%' },
      });
    }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
