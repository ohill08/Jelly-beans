import type { BeanColor } from '../lib/types';

const COPY: Record<BeanColor, { title: string; body: string }> = {
  gold: { title: 'Gold jelly bean!', body: 'A perfect day — every healthy box ticked.' },
  green: { title: 'Green jelly bean', body: 'Solid day. More than half your healthy habits landed.' },
  red: { title: 'Red jelly bean', body: 'A tougher day. Tomorrow is a fresh shot at gold.' },
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
