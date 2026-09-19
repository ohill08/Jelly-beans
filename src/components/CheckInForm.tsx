import { useState } from 'react';
import type { DayAnswers, TriAnswer } from '../lib/types';
import { formatFriendly } from '../lib/dates';
import { fitnessLabel } from '../lib/avatar';
import AvatarCoach from './AvatarCoach';

interface Props {
  date: string;
  queuePosition: number;
  queueTotal: number;
  onSubmit: (answers: DayAnswers) => void;
  initialAnswers?: DayAnswers;
  isEdit?: boolean;
  fitness: number;
}

interface Question {
  key: keyof DayAnswers;
  label: string;
  hint: string;
  allowNA?: boolean;
}

const SICK_QUESTION: Question = {
  key: 'sick',
  label: 'Were you sick?',
  hint: 'A sick day always gets a white bean, whatever else happened.',
};

const REST_OF_QUESTIONS: Question[] = [
  { key: 'ateHealthy', label: 'Did you eat healthily?', hint: 'Mostly whole foods, sensible portions.' },
  { key: 'drankAlcohol', label: 'Did you drink alcohol?', hint: 'Any alcoholic drinks at all.' },
  { key: 'exercised', label: 'Did you exercise?', hint: 'Any intentional movement or workout.' },
  { key: 'steps10k', label: 'Did you do 10,000 steps?', hint: 'Required for green or gold, no matter what else you did.' },
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
  fitness,
}: Props) {
  const [draft, setDraft] = useState<Draft>(() =>
    initialAnswers
      ? {
          sick: initialAnswers.sick ? 'yes' : 'no',
          ateHealthy: initialAnswers.ateHealthy ? 'yes' : 'no',
          drankAlcohol: initialAnswers.drankAlcohol ? 'yes' : 'no',
          exercised: initialAnswers.exercised ? 'yes' : 'no',
          steps10k: initialAnswers.steps10k ? 'yes' : 'no',
          hrv: initialAnswers.hrv,
        }
      : {},
  );

  const setAnswer = (key: keyof DayAnswers, value: TriAnswer) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const isSick = draft.sick === 'yes';
  const visibleQuestions = isSick ? [SICK_QUESTION] : [SICK_QUESTION, ...REST_OF_QUESTIONS];
  const allAnswered = visibleQuestions.every((q) => draft[q.key] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered) return;
    const answers: DayAnswers = isSick
      ? { sick: true, ateHealthy: false, drankAlcohol: false, exercised: false, steps10k: false, hrv: 'na' }
      : {
          sick: false,
          ateHealthy: draft.ateHealthy === 'yes',
          drankAlcohol: draft.drankAlcohol === 'yes',
          exercised: draft.exercised === 'yes',
          steps10k: draft.steps10k === 'yes',
          hrv: draft.hrv as TriAnswer,
        };
    onSubmit(answers);
  };

  return (
    <div className="checkin-card">
      <div className="checkin-asker">
        <AvatarCoach fitness={fitness} />
        <div className="checkin-bubble">
          <span className="checkin-eyebrow">
            {isEdit
              ? 'Editing entry'
              : queueTotal > 1
                ? `Catching up · ${queuePosition} of ${queueTotal}`
                : 'Daily check-in'}
          </span>
          <h2>{formatFriendly(date)}</h2>
          <p className="checkin-sub">{isEdit ? 'Update your answers for this day.' : 'How did yesterday go?'}</p>
          <p className="checkin-coach-status">{fitnessLabel(fitness)}</p>
        </div>
      </div>

      <div className="questions">
        {visibleQuestions.map((q) => (
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
