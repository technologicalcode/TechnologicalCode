import type { InteractionType, LeadSource } from '../types';

export const SOURCE_LABEL: Record<LeadSource, string> = {
  web: 'Web',
  referido: 'Referido',
  redes: 'Redes sociales',
  feria: 'Feria',
};

export const INTERACTION_LABEL: Record<InteractionType, string> = {
  llamada: 'Llamada',
  email: 'Email',
  reunion: 'Reunión',
  nota: 'Nota',
};

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}
