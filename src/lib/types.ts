export type BeanColor = 'gold' | 'green' | 'red' | 'white';

export type TriAnswer = 'yes' | 'no' | 'na';

export interface DayAnswers {
  sick: boolean;
  ateHealthy: boolean;
  drankAlcohol: boolean;
  exercised: boolean;
  steps10k: boolean;
  hrv: TriAnswer; // 'na' when the user doesn't track HRV
}

export interface DayEntry {
  /** ISO date (YYYY-MM-DD) of the day being reported on. */
  date: string;
  answers: DayAnswers;
  bean: BeanColor;
  /** ISO timestamp of when the entry was recorded. */
  recordedAt: string;
}
