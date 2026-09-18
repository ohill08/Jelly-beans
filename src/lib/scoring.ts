import type { BeanColor, DayAnswers } from './types';

/**
 * Scores a day's answers into a jelly bean color.
 *
 * Each answer contributes one "positive" point when it reflects the
 * healthy choice (ate well, skipped alcohol, exercised, HRV above 65).
 * HRV is excluded from the total when the user marks it 'na', so people
 * without a wearable aren't penalised for not tracking it.
 *
 *  - Gold:  every tracked question hit the healthy answer
 *  - Green: at least half did
 *  - Red:   fewer than half did
 */
export function scoreDay(answers: DayAnswers): BeanColor {
  const checks: boolean[] = [
    answers.ateHealthy,
    !answers.drankAlcohol,
    answers.exercised,
  ];
  if (answers.hrv !== 'na') {
    checks.push(answers.hrv === 'yes');
  }

  const positives = checks.filter(Boolean).length;
  const ratio = positives / checks.length;

  if (ratio === 1) return 'gold';
  if (ratio >= 0.5) return 'green';
  return 'red';
}
