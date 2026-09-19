/** Formats a Date as a local YYYY-MM-DD string (no timezone shifting). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(isoDate: string, delta: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toISODate(dt);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function yesterdayISO(): string {
  return addDays(todayISO(), -1);
}

export function formatFriendly(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Whole days from today until `targetISODate` (negative once it's passed). */
export function daysUntil(targetISODate: string): number {
  const [ty, tm, td] = targetISODate.split('-').map(Number);
  const target = new Date(ty, tm - 1, td);
  const [ny, nm, nd] = todayISO().split('-').map(Number);
  const now = new Date(ny, nm - 1, nd);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - now.getTime()) / msPerDay);
}
