import AvatarCoach from './AvatarCoach';
import GardenBed from './GardenBed';
import { fitnessLabel } from '../lib/avatar';
import { daysUntil } from '../lib/dates';
import type { GardenState } from '../lib/garden';

const WEDDING_DATE = '2027-12-11';

interface Props {
  fitness: number;
  garden: GardenState;
  pendingCount: number;
  onReady: () => void;
}

export default function ReadyScreen({ fitness, garden, pendingCount, onReady }: Props) {
  const daysToWedding = daysUntil(WEDDING_DATE);

  return (
    <div className="ready-screen">
      <AvatarCoach fitness={fitness} size="lg" />
      <GardenBed garden={garden} />
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

      <div className="wedding-countdown">
        {daysToWedding > 0 ? (
          <>
            <span className="wedding-countdown-num">{daysToWedding}</span>
            <span className="wedding-countdown-label">
              {daysToWedding === 1 ? 'Day to Wedding' : 'Days to Wedding'}
            </span>
          </>
        ) : daysToWedding === 0 ? (
          <span className="wedding-countdown-label">It's the wedding day! 💍</span>
        ) : (
          <span className="wedding-countdown-label">Married!</span>
        )}
      </div>
    </div>
  );
}
