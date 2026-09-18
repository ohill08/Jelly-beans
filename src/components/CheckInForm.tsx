import { useState } from 'react';
import type { DayAnswers, TriAnswer } from '../lib/types';
import { formatFriendly } from '../lib/dates';

interface Props {
  date: string;
  queuePosition: number;
  queueTotal: number;
  onSubmit: (answers: DayAnswers) => void;
  initialAnswers?: DayAnswers;
  isEdit?: boolean;
}

interface Question {
  key: keyof DayAnswers;
  label: string;
  hint: string;
  allowNA?: boolean;
}

const QUESTIONS: Question[] = [
  { key: 'ateHealthy', label: 'Did you eat healthily?', hint: 'Mostly whole foods, sensible portions.' },
  { key: 'drankAlcohol', label: 'Did you drink alcohol?', hint: 'Any alcoholic drinks at all.' },
  { key: 'exercised', label: 'Did you exercise?', hint: 'Any intentional movement or workout.' },
  { key: 'hrv', label: 'Was your HRV above 65?', hint: "Don't track HRV? Choose N/A.", allowNA: true },
];

type Draft = Partial<Record<keyof DayAnswers, TriAnswer>>;

export default function CheckInForm({
  date,
  queuePosition,
  queueTotal,
  onSubmit,
  initialAnswers,
  isEdit,
}: Props) {
  const [draft, setDraft] = useState<Draft>(() =>
    initialAnswers
      ? {
          ateHealthy: initialAnswers.ateHealthy ? 'yes' : 'no',
          drankAlcohol: initialAnswers.drankAlcohol ? 'yes' : 'no',
          exercised: initialAnswers.exercised ? 'yes' : 'no',
          hrv: initialAnswers.hrv,
        }
      : {},
  );

  const setAnswer = (key: keyof DayAnswers, value: TriAnswer) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const allAnswered = QUESTIONS.every((q) => draft[q.key] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered) return;
    const answers: DayAnswers = {
      ateHealthy: draft.ateHealthy === 'yes',
      drankAlcohol: draft.drankAlcohol === 'yes',
      exercised: draft.exercised === 'yes',
      hrv: draft.hrv as TriAnswer,
    };
    onSubmit(answers);
  };

  return (
    <div className="checkin-card">
      <div className="checkin-header">
        <span className="checkin-eyebrow">
          {isEdit
            ? 'Editing entry'
            : queueTotal > 1
              ? `Catching up · ${queuePosition} of ${queueTotal}`
              : 'Daily check-in'}
        </span>
        <h2>{formatFriendly(date)}</h2>
        <p className="checkin-sub">{isEdit ? 'Update your answers for this day.' : 'How did yesterday go?'}</p>
      </div>

      <div className="questions">
        {QUESTIONS.map((q) => (
          <div className="question" key={q.key}>
            <div className="question-text">
              <span className="question-label">{q.label}</span>
              <span className="question-hint">{q.hint}</span>
            </div>
            <div className="question-options" role="group" aria-label={q.label}>
              <button
                type="button"
                className={draft[q.key] === 'yes' ? 'opt opt-yes selected' : 'opt opt-yes'}
                onClick={() => setAnswer(q.key, 'yes')}
              >
                Yes
              </button>
              <button
                type="button"
                className={draft[q.key] === 'no' ? 'opt opt-no selected' : 'opt opt-no'}
                onClick={() => setAnswer(q.key, 'no')}
              >
                No
              </button>
              {q.allowNA && (
                <button
                  type="button"
                  className={draft[q.key] === 'na' ? 'opt opt-na selected' : 'opt opt-na'}
                  onClick={() => setAnswer(q.key, 'na')}
                >
                  N/A
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="submit-btn" disabled={!allAnswered} onClick={handleSubmit}>
        {allAnswered ? 'Reveal my jelly bean' : 'Answer all questions'}
      </button>
    </div>
  );
}
