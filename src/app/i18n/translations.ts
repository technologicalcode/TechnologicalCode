export type Lang = 'en' | 'es';

/** Variante de frases animadas del hero: 0 natural, 1 startup, 2 tech. */
export type HeroPhraseOptionIndex = 0 | 1 | 2;

/** Frases del hero por idioma y variante (natural / startup / tech). */
export const HERO_PHRASES_BY_LANG: Record<
  Lang,
  readonly [readonly string[], readonly string[], readonly string[]]
> = {
  en: [
    [
      'turns visitors into customers',
      'cuts the work that wastes your week',
      'scales without hiring more',
      'sells while you sleep',
      'gives you back control',
    ],
    [
      'closes more deals',
      'lowers operating cost',
      'multiplies your capacity',
      'puts your ops on autopilot',
      'pays for itself in time saved',
    ],
    [
      'runs without the chaos',
      'plugs into the tools you already use',
      'stays fast as you grow',
      'is ready for AI from day one',
      'won’t break when demand spikes',
    ],
  ],
  es: [
    [
      'convierte visitas en clientes',
      'quita el trabajo que te roba la semana',
      'escala sin contratar más',
      'vende mientras no estás',
      'te devuelve el control',
    ],
    [
      'cierra más ventas',
      'baja el costo operativo',
      'multiplica tu capacidad',
      'pone tu operación en automático',
      'se paga solo en tiempo ahorrado',
    ],
    [
      'corre sin el caos',
      'se conecta a lo que ya usas',
      'sigue rápido cuando creces',
      'está listo para IA desde el día uno',
      'no se cae cuando sube la demanda',
    ],
  ],
};

export function getHeroPhrases(lang: Lang, option: HeroPhraseOptionIndex): readonly string[] {
  return HERO_PHRASES_BY_LANG[lang][option];
}
