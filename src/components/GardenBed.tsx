import GardenFlower from './GardenFlower';
import GardenStand from './GardenStand';
import { hashSeed } from '../lib/svgMath';
import type { GardenState } from '../lib/garden';

interface Props {
  garden: GardenState;
}

/** Cap how many pots render at once so a long-running garden doesn't blow out the layout. */
const MAX_VISIBLE = 10;
const FLOWER_SIZE = 0.62;
const ELEVATIONS = [0, 15, 27]; // ground / stool / table, in px

interface Slot {
  key: string;
  stage: number;
  xPercent: number;
  elevation: number;
  rotation: number;
  scale: number;
}

/** Deterministic per-slot placement (stable across re-renders) so the bed reads as scattered, not gridded. */
function layoutSlots(count: number, growingStage: number | null): Slot[] {
  const total = count + (growingStage !== null ? 1 : 0);
  if (total === 0) return [];

  const slots: Slot[] = [];
  const spread = 100 / total;

  for (let i = 0; i < total; i++) {
    const isGrowing = growingStage !== null && i === total - 1;
    const seed = hashSeed(`garden-slot-${i}`);

    const tierRoll = seed % 100;
    const tier = tierRoll < 52 ? 0 : tierRoll < 78 ? 1 : 2;

    const jitterX = (((seed >> 4) % 100) / 100 - 0.5) * spread * 0.7;
    const xPercent = Math.max(7, Math.min(93, (i + 0.5) * spread + jitterX));

    const rotation = (((seed >> 9) % 140) - 70) / 10; // -7..7deg
    const scale = 0.86 + ((seed >> 14) % 22) / 100; // 0.86..1.08

    slots.push({
      key: isGrowing ? 'growing' : `flower-${i}`,
      stage: isGrowing ? growingStage! : 1,
      xPercent,
      elevation: isGrowing ? 0 : ELEVATIONS[tier], // the newest sprout always sits on the ground
      rotation: isGrowing ? 0 : rotation,
      scale: isGrowing ? 0.8 : scale,
    });
  }
  return slots;
}

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

  const slots = layoutSlots(visibleCount, showGrowing ? growingProgress : null);

  return (
    <div className="garden-bed">
      <div className="garden-scene">
        <div className="garden-ground" />
        {slots.map((slot) => (
          <div
            key={slot.key}
            className="garden-slot"
            style={{ left: `${slot.xPercent}%`, transform: `translateX(-50%) rotate(${slot.rotation}deg) scale(${slot.scale})` }}
          >
            <GardenFlower stage={slot.stage} health={health} size={FLOWER_SIZE} />
            {slot.elevation > 0 && <GardenStand height={slot.elevation} />}
          </div>
        ))}
      </div>
      <p className="garden-caption">
        {completedFlowers} {completedFlowers === 1 ? 'flower' : 'flowers'}
        {overflow > 0 ? ` (+${overflow} more)` : ''}
      </p>
    </div>
  );
}
