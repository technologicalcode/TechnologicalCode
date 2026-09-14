/**
 * Disparo al scrollear: el bloque se anima al asomar por abajo,
 * no cuando ya ocupa el centro (eso iba tarde respecto al scroll).
 */
export const SCROLL_REVEAL_IO: IntersectionObserverInit = {
  root: null,
  threshold: 0.02,
  rootMargin: '0px 0px 20% 0px',
};

/** Typewriter de leads (competencias / portafolio): cabe en el tiempo de lectura al pasar. */
export const TYPEWRITER_MS = 1280;

/** Título del manifiesto (un poco más largo). */
export const TYPEWRITER_TITLE_MS = 1500;

export function isSectionEnteringViewport(rect: DOMRect, viewportHeight: number): boolean {
  return rect.top < viewportHeight * 0.96 && rect.bottom > viewportHeight * 0.04;
}
