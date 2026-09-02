import type { EventInfo } from '../api/types';

export type EventPhase = 'registration' | 'pre' | 'day' | 'post';

/**
 * Phase des Anlasses – steuert die Texte auf der Seite:
 * - 'registration': Anmeldung offen (Vorbereitungsphase, normale Startseite)
 * - 'pre':  Anmeldung geschlossen, Event-Tag steht noch bevor
 * - 'day':  Event-Tag ist heute → «Markttag»
 * - 'post': Event-Tag ist vorbei
 *
 * Ist die Anmeldung geschlossen, aber kein Datum gesetzt, fällt die Funktion
 * auf 'day' zurück (bisheriges Markttag-Verhalten).
 */
export function eventPhase(
  event: Pick<EventInfo, 'registration_open' | 'event_date'> | null | undefined,
): EventPhase {
  if (!event) return 'registration';
  if (event.registration_open) return 'registration';
  if (!event.event_date) return 'day';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const [y, m, d] = event.event_date.split('-').map(Number);
  const eventDay = new Date(y, (m ?? 1) - 1, d ?? 1).getTime();

  if (today < eventDay) return 'pre';
  if (today > eventDay) return 'post';
  return 'day';
}

/** Formatiert ein ISO-Datum (JJJJ-MM-TT) als «Sonntag, 6. September 2026». */
export function formatEventDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
