import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-lpc-navbar',
  standalone: true,
  templateUrl: './lpc-navbar.html',
  styleUrl: './lpc-navbar.scss',
})
export class LpcNavbarComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly solid = signal(false);
  protected readonly open = signal(false);

  constructor() {
    afterNextRender(() => this.bindScroll());
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected go(id: string, event: Event): void {
    event.preventDefault();
    this.open.set(false);
    const el = this.doc.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private bindScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }
    const onScroll = (): void => this.solid.set(win.scrollY > 24);
    win.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    this.destroyRef.onDestroy(() => win.removeEventListener('scroll', onScroll));
  }
}
