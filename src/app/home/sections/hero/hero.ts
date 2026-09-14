import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ActiveLanguage } from '../../../locale/active-language';
import { getHeroPhrases, type HeroPhraseOptionIndex } from '../../../i18n/translations';

type Phase = 'typing' | 'pause' | 'deleting';

@Component({
  selector: 'app-hero-section',
  imports: [TranslatePipe],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroSectionComponent {
  protected readonly activeLang = inject(ActiveLanguage);

  /**
   * 0 = natural · 1 = startup · 2 = tech.
   */
  protected readonly phraseOptionIndex: HeroPhraseOptionIndex = 0;

  protected readonly typedLine = signal('');

  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private timer: ReturnType<typeof setInterval> | null = null;
  private phraseIndex = 0;
  private phase: Phase = 'typing';
  private pauseTicks = 0;

  constructor() {
    effect(() => {
      this.activeLang.code();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.phraseIndex = 0;
      this.phase = 'typing';
      this.pauseTicks = 0;

      const reduce =
        typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        this.typedLine.set(this.getPhrases()[0] ?? '');
        return;
      }

      this.typedLine.set('');
      this.timer = setInterval(() => this.step(), 40);
    });

    this.destroyRef.onDestroy(() => {
      if (this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
      }
    });
  }

  private getPhrases(): readonly string[] {
    return getHeroPhrases(this.activeLang.code(), this.phraseOptionIndex);
  }

  private step(): void {
    const phrases = this.getPhrases();
    const target = phrases[this.phraseIndex] ?? '';
    const current = this.typedLine();

    if (this.phase === 'typing') {
      if (current.length < target.length) {
        this.typedLine.set(target.slice(0, current.length + 1));
      } else {
        this.phase = 'pause';
        this.pauseTicks = 0;
      }
      return;
    }

    if (this.phase === 'pause') {
      this.pauseTicks += 1;
      if (this.pauseTicks >= 48) {
        this.phase = 'deleting';
      }
      return;
    }

    if (current.length > 0) {
      this.typedLine.set(current.slice(0, -1));
    } else {
      this.phraseIndex = (this.phraseIndex + 1) % phrases.length;
      this.phase = 'typing';
    }
  }
}
