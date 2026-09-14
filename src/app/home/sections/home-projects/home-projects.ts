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

type HomeProject = {
  id: string;
  kind: 'route' | 'href';
  path: string;
  image: string;
  titleKey: string;
  tagKey: string;
  bodyKey: string;
};

@Component({
  selector: 'app-home-projects-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.css',
})
export class HomeProjectsSectionComponent {
  protected readonly activeLang = inject(ActiveLanguage);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  protected readonly visible = signal(false);
  private readonly sectionRef = viewChild<ElementRef<HTMLElement>>('projectsSection');
  private sectionIo: IntersectionObserver | null = null;
  private sectionFallbackScrollCleanup: (() => void) | null = null;
  private langEffectRef: EffectRef | null = null;
  private playStarted = false;

  protected readonly projects: HomeProject[] = [
    {
      id: 'filo',
      kind: 'href',
      path: '/projects/landingPageS/index.html',
      image:
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=70',
      titleKey: 'homeProjects.items.filo.title',
      tagKey: 'homeProjects.items.filo.tag',
      bodyKey: 'homeProjects.items.filo.body',
    },
    {
      id: 'vertice',
      kind: 'route',
      path: '/projects/landing-elaborada',
      image:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70',
      titleKey: 'homeProjects.items.vertice.title',
      tagKey: 'homeProjects.items.vertice.tag',
      bodyKey: 'homeProjects.items.vertice.body',
    },
    {
      id: 'miga',
      kind: 'href',
      path: '/projects/mini-tienda/',
      image:
        'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=70',
      titleKey: 'homeProjects.items.miga.title',
      tagKey: 'homeProjects.items.miga.tag',
      bodyKey: 'homeProjects.items.miga.body',
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
