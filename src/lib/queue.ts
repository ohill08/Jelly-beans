import { addDays, yesterdayISO } from './dates';
import type { DayEntry } from './types';

/** Don't overwhelm a returning user with a huge backlog — cap it. */
const MAX_BACKLOG_DAYS = 7;

/**
 * Returns the ordered list of dates (oldest first) that still need a
 * check-in, up through yesterday. If the user has never logged anything,
 * only yesterday is queued rather than dumping their whole install history.
 */
export function getPendingDates(entries: DayEntry[]): string[] {
  const yesterday = yesterdayISO();
  if (entries.length === 0) return [yesterday];

  const lastLogged = entries[entries.length - 1].date;
  if (lastLogged >= yesterday) return [];

  let start = addDays(lastLogged, 1);
  const earliestAllowed = addDays(yesterday, -(MAX_BACKLOG_DAYS - 1));
  if (start < earliestAllowed) start = earliestAllowed;

  const pending: string[] = [];
  let cursor = start;
  while (cursor <= yesterday) {
    pending.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return pending;
}
