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

export function computeStats(entries: DayEntry[]): Stats {
  const counts: Record<BeanColor, number> = { gold: 0, green: 0, red: 0 };
  for (const e of entries) counts[e.bean]++;

  let bestStreak = 0;
  let running = 0;
  let prevDate: string | null = null;
  for (const e of entries) {
    const contiguous = prevDate !== null && addDays(prevDate, 1) === e.date;
    if (!contiguous) running = 0;
    running = isHealthy(e.bean) ? running + 1 : 0;
    bestStreak = Math.max(bestStreak, running);
    prevDate = e.date;
  }

  let currentStreak = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (!isHealthy(e.bean)) break;
    if (i < entries.length - 1) {
      const next = entries[i + 1];
      if (addDays(e.date, 1) !== next.date) break;
    }
    currentStreak++;
  }

  return { total: entries.length, counts, currentStreak, bestStreak };
}
