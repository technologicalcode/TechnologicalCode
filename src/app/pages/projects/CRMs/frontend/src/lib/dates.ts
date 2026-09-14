import type { Interaction, Lead } from '../types';

const STALE_DAYS = 7;

export function parseDay(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function daysSince(iso: string, now = new Date()): number {
  const start = parseDay(iso).getTime();
  return Math.floor((now.getTime() - start) / 86_400_000);
}

export function lastActivityDate(lead: Lead, interactions: Interaction[]): string {
  const dates = interactions.filter((item) => item.leadId === lead.id).map((item) => item.date);
  dates.push(lead.createdAt);
  return dates.sort().at(-1) ?? lead.createdAt;
}

/** Lead sin movimiento reciente: más de 7 días sin interacción (ni alta). */
export function isStale(lead: Lead, interactions: Interaction[], now = new Date()): boolean {
  return daysSince(lastActivityDate(lead, interactions), now) > STALE_DAYS;
}

export function isSameMonth(iso: string, now = new Date()): boolean {
  const date = parseDay(iso);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function formatDate(iso: string): string {
  return parseDay(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
