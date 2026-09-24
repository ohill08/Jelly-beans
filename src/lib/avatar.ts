import type { DayEntry } from './types';
import { addDays, todayISO } from './dates';

const RECENT_WINDOW = 14;
const EXERCISE_WINDOW_DAYS = 7;

/**
 * A 0 (rough) .. 1 (peak) score for how the coach avatar should look,
 * based on the user's most recently logged days. Gold counts fully,
 * green counts half, red counts for nothing. Sick days are excluded
 * entirely rather than counted as neutral, so they don't use up a slot
 * in the recent window or nudge the average either way. With no
 * (non-sick) history yet the coach starts at rock bottom — no habits
 * logged is treated the same as a bad streak, not given the benefit
 * of the doubt.
 */
export function computeFitness(entries: DayEntry[]): number {
  const healthTracked = entries.filter((e) => e.bean !== 'white');
  const recent = healthTracked.slice(-RECENT_WINDOW);
  if (recent.length === 0) return 0;

  const weight = { gold: 1, green: 0.55, red: 0, white: 0 } as const;
  const total = recent.reduce((sum, e) => sum + weight[e.bean], 0);
  // Round to avoid float drift (e.g. 0.55 * 14 / 14) landing just under a label threshold.
  return Math.round((total / recent.length) * 100) / 100;
}

/** Whether any of the last 7 calendar days (today inclusive) recorded exercise. */
export function hasRecentExercise(entries: DayEntry[]): boolean {
  const cutoff = addDays(todayISO(), -(EXERCISE_WINDOW_DAYS - 1));
  return entries.some((e) => e.date >= cutoff && e.answers.exercised);
}

export function fitnessLabel(f: number): string {
  if (f >= 0.8) return 'Your coach is in peak condition';
  if (f >= 0.55) return 'Your coach is feeling strong';
  if (f >= 0.3) return 'Your coach is building momentum';
  return 'Your coach could use a good week';
}
