import AvatarCoach from './AvatarCoach';
import { fitnessLabel } from '../lib/avatar';

interface Props {
  fitness: number;
  pendingCount: number;
  onReady: () => void;
}

export default function ReadyScreen({ fitness, pendingCount, onReady }: Props) {
  return (
    <div className="ready-screen">
      <AvatarCoach fitness={fitness} size="lg" />
      <p className="ready-status">{fitnessLabel(fitness)}</p>
      <h2>{pendingCount > 1 ? "Ready to log your last few days?" : 'Ready to log yesterday?'}</h2>
      <p className="ready-sub">
        {pendingCount > 1
          ? `Just a few quick questions for each of the last ${pendingCount} days.`
          : 'Just a few quick questions and your jar updates.'}
      </p>
      <button className="submit-btn" onClick={onReady}>
        I'm ready
      </button>
    </div>
  );
}
