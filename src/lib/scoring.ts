import type { BeanColor, DayAnswers } from './types';

/**
 * Scores a day's answers into a jelly bean color.
 *
 *  - Gold:  ate healthily, no alcohol, exercised, and HRV above 65
 *  - Green: ate healthily and no alcohol (regardless of exercise/HRV)
 *  - Red:   didn't eat healthily and/or drank alcohol
 */
export function scoreDay(answers: DayAnswers): BeanColor {
  const atePlusSober = answers.ateHealthy && !answers.drankAlcohol;

  if (atePlusSober && answers.exercised && answers.hrv === 'yes') return 'gold';
  if (atePlusSober) return 'green';
  return 'red';
}
