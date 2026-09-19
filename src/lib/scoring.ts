import type { BeanColor, DayAnswers } from './types';

/**
 * Scores a day's answers into a jelly bean color.
 *
 *  - White: the user was sick — overrides everything else below
 *  - Gold:  ate healthily, no alcohol, 10,000+ steps, exercised, and HRV above 65
 *  - Green: ate healthily, no alcohol and 10,000+ steps — a hard requirement,
 *           regardless of how the rest of the day went
 *  - Red:   any of the above green requirements weren't met
 */
export function scoreDay(answers: DayAnswers): BeanColor {
  if (answers.sick) return 'white';

  const greenBar = answers.ateHealthy && !answers.drankAlcohol && answers.steps10k;

  if (greenBar && answers.exercised && answers.hrv === 'yes') return 'gold';
  if (greenBar) return 'green';
  return 'red';
}
