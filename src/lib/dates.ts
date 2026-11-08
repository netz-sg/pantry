import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';

/** Kalendertag als YYYY-MM-DD in lokaler Zeit, ohne Zeitzonenverschiebung. */
export function toDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function fromDateKey(key: string): Date {
  return parseISO(key);
}

export function today(): string {
  return toDateKey(new Date());
}

export function weekStart(key: string): string {
  return toDateKey(startOfWeek(fromDateKey(key), { weekStartsOn: 1 }));
}

export function weekDays(startKey: string): string[] {
  const s = fromDateKey(startKey);
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(s, i)));
}

export function shiftDays(key: string, days: number): string {
  return toDateKey(addDays(fromDateKey(key), days));
}

/** Tage bis zu einem Datum, negativ wenn es in der Vergangenheit liegt. */
export function daysUntil(key: string, from: string = today()): number {
  return differenceInCalendarDays(fromDateKey(key), fromDateKey(from));
}

export function isValidDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(fromDateKey(key).getTime());
}

export type ExpiryState = 'expired' | 'soon' | 'week' | 'ok' | 'none';

export function expiryState(expiresOn: string | null | undefined, from: string = today()): ExpiryState {
  if (!expiresOn) return 'none';
  const d = daysUntil(expiresOn, from);
  if (d < 0) return 'expired';
  if (d <= 1) return 'soon';
  if (d <= 7) return 'week';
  return 'ok';
}
