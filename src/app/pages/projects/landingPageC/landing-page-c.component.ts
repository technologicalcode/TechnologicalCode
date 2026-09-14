import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { LpcAboutComponent } from './lpc-about/lpc-about';
import { LpcContactComponent } from './lpc-contact/lpc-contact';
import { LpcCtaComponent } from './lpc-cta/lpc-cta';
import { LpcFooterComponent } from './lpc-footer/lpc-footer';
import { LpcGalleryComponent } from './lpc-gallery/lpc-gallery';
import { LpcHeroComponent } from './lpc-hero/lpc-hero';
import { LpcNavbarComponent } from './lpc-navbar/lpc-navbar';
import { LpcServicesComponent } from './lpc-services/lpc-services';
import { LpcTestimonialsComponent } from './lpc-testimonials/lpc-testimonials';
import { LpcWaFloatComponent } from './lpc-wa-float/lpc-wa-float';

const FONT_ID = 'lpc-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Sora:wght@400;500;600&display=swap';

@Component({
  selector: 'app-landing-page-c',
  standalone: true,
  imports: [
    LpcNavbarComponent,
    LpcHeroComponent,
    LpcAboutComponent,
    LpcServicesComponent,
    LpcGalleryComponent,
    LpcTestimonialsComponent,
    LpcContactComponent,
    LpcCtaComponent,
    LpcFooterComponent,
    LpcWaFloatComponent,
  ],
  templateUrl: './landing-page-c.component.html',
  styleUrl: './landing-page-c.component.scss',
})
export class LandingPageCComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.injectFonts();
      this.lockPageChrome();
    });
  }

  /** Evita que el tema/padding del sitio principal se cuele en esta demo. */
  private lockPageChrome(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const html = this.doc.documentElement;
    const prevScheme = html.style.colorScheme;
    const prevPad = html.style.scrollPaddingTop;
    html.classList.add('lpc-demo');
    html.style.colorScheme = 'light';
    html.style.scrollPaddingTop = '5rem';
    this.destroyRef.onDestroy(() => {
      html.classList.remove('lpc-demo');
      html.style.colorScheme = prevScheme;
      html.style.scrollPaddingTop = prevPad;
    });
  }

  private injectFonts(): void {
    if (!isPlatformBrowser(this.platformId) || this.doc.getElementById(FONT_ID)) {
      return;
    }
    const link = this.doc.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    this.doc.head.appendChild(link);
    this.destroyRef.onDestroy(() => link.remove());
  }
}
