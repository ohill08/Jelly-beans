import type { BeanColor } from '../lib/types';

const COPY: Record<BeanColor, { title: string; body: string }> = {
  gold: {
    title: 'Gold jelly bean!',
    body: 'Ate healthily, skipped alcohol, hit 10,000 steps, exercised, and HRV above 65 — a perfect day.',
  },
  green: { title: 'Green jelly bean', body: 'You ate healthily, skipped alcohol, and hit 10,000 steps. Solid work.' },
  red: { title: 'Red jelly bean', body: "Diet, alcohol, or steps didn't go to plan today. Tomorrow's a fresh start." },
};

interface Props {
  bean: BeanColor;
  onContinue: () => void;
  continueLabel: string;
}

export default function RewardReveal({ bean, onContinue, continueLabel }: Props) {
  const copy = COPY[bean];
  return (
    <div className="reveal-card">
      <div className={`reveal-bean bean-${bean}`} aria-hidden="true" />
      <h2>{copy.title}</h2>
      <p>{copy.body}</p>
      <button className="submit-btn" onClick={onContinue}>
        {continueLabel}
      </button>
    </div>
  );
}
