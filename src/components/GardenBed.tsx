import GardenFlower from './GardenFlower';
import type { GardenState } from '../lib/garden';

interface Props {
  garden: GardenState;
}

/** Cap how many pots render at once so a long-running garden doesn't blow out the layout. */
const MAX_VISIBLE = 10;

export default function GardenBed({ garden }: Props) {
  const { completedFlowers, growingProgress, health } = garden;
  const visibleCount = Math.min(completedFlowers, MAX_VISIBLE);
  const overflow = completedFlowers - visibleCount;
  const showGrowing = growingProgress > 0.02;

  if (completedFlowers === 0 && !showGrowing) {
    return (
      <div className="garden-bed">
        <p className="garden-empty-hint">Green and gold beans plant flowers here — none yet.</p>
      </div>
    );
  }

  return (
    <div className="garden-bed">
      <div className="garden-bed-row">
        {Array.from({ length: visibleCount }, (_, i) => (
          <GardenFlower key={i} stage={1} health={health} size={0.68} />
        ))}
        {showGrowing && <GardenFlower stage={growingProgress} health={health} size={0.68} />}
      </div>
      <p className="garden-caption">
        {completedFlowers} {completedFlowers === 1 ? 'flower' : 'flowers'}
        {overflow > 0 ? ` (+${overflow} more)` : ''}
      </p>
    </div>
  );
}
