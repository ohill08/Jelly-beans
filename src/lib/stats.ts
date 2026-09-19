import type { BeanColor, DayEntry } from './types';
import { addDays } from './dates';

export interface Stats {
  total: number;
  counts: Record<BeanColor, number>;
  currentStreak: number; // consecutive most-recent days that were gold or green
  bestStreak: number;
}

function isHealthy(bean: BeanColor): boolean {
  return bean === 'gold' || bean === 'green';
}

/**
 * Streaks treat a sick (white) day as transparent: it neither builds nor
 * breaks a streak, so a healthy run picks back up right where it left off
 * once the user is well again. A genuine gap in logging (no entry at all)
 * still breaks it — sickness only excuses days actually marked sick.
 */
export function computeStats(entries: DayEntry[]): Stats {
  const counts: Record<BeanColor, number> = { gold: 0, green: 0, red: 0, white: 0 };
  for (const e of entries) counts[e.bean]++;

  let bestStreak = 0;
  let running = 0;
  let prevDate: string | null = null;
  for (const e of entries) {
    const contiguous = prevDate !== null && addDays(prevDate, 1) === e.date;
    if (!contiguous) running = 0;
    if (e.bean === 'white') {
      // Pass through unchanged — doesn't extend or reset the run.
    } else {
      running = isHealthy(e.bean) ? running + 1 : 0;
    }
    bestStreak = Math.max(bestStreak, running);
    prevDate = e.date;
  }

  let currentStreak = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (i < entries.length - 1) {
      const next = entries[i + 1];
      if (addDays(e.date, 1) !== next.date) break; // real gap in logging
    }
    if (e.bean === 'white') continue; // sick day: skip without breaking the streak
    if (!isHealthy(e.bean)) break;
    currentStreak++;
  }

  return { total: entries.length, counts, currentStreak, bestStreak };
}
