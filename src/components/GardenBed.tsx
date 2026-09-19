import GardenFlower from './GardenFlower';
import GardenBush from './GardenBush';
import GardenGrassTuft from './GardenGrassTuft';
import { hashSeed, lerp } from '../lib/svgMath';
import type { GardenState } from '../lib/garden';

interface Props {
  garden: GardenState;
}

/** Cap how many plants render at once so a long-running garden doesn't blow out the layout. */
const MAX_VISIBLE = 10;
const PLANT_SIZE = 0.62;

type PlantType = 'flower' | 'bush' | 'grass';

interface Slot {
  key: string;
  type: PlantType;
  stage: number;
  xPercent: number;
  bottom: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

function pickType(roll: number): PlantType {
  return roll < 40 ? 'flower' : roll < 72 ? 'grass' : 'bush';
}

/**
 * Deterministic per-slot placement (stable across re-renders) so the bed
 * reads as a wild patch growing around the coach, not a tidy row. Each
 * plant gets a random type and a "depth" that drives both its vertical
 * offset and scale — nearer plants sit lower and bigger, farther ones
 * higher and smaller — which breaks up the layout into two dimensions
 * instead of one straight line.
 */
function layoutSlots(count: number, growingStage: number | null): Slot[] {
  const total = count + (growingStage !== null ? 1 : 0);
  if (total === 0) return [];

  const slots: Slot[] = [];
  const band = 100 / total;

  for (let i = 0; i < total; i++) {
    const isGrowing = growingStage !== null && i === total - 1;
    const seed = hashSeed(`garden-plant-${i}`);

    // Unsigned shift: `seed` is a uint32, and `>>` would sign-extend it back
    // to negative for any seed with the top bit set, poisoning `depth` (and
    // the zIndex/bottom/scale derived from it) for roughly half of all slots.
    const depth = ((seed >>> 3) % 100) / 100;
    const jitterX = (((seed >>> 11) % 100) / 100 - 0.5) * band * 0.85;
    const xPercent = Math.max(4, Math.min(96, (i + 0.5) * band + jitterX));
    const rotation = (((seed >>> 17) % 160) - 80) / 10; // -8..8deg
    const typeRoll = seed % 100;

    slots.push({
      key: isGrowing ? 'growing' : `plant-${i}`,
      type: isGrowing ? 'flower' : pickType(typeRoll),
      stage: isGrowing ? growingStage! : 1,
      xPercent,
      bottom: isGrowing ? 0 : lerp(0, 20, depth),
      rotation: isGrowing ? 0 : rotation,
      scale: isGrowing ? 0.75 : lerp(0.68, 1.14, depth),
      zIndex: isGrowing ? 1 : Math.round(depth * 100) + 1,
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
        <p className="garden-empty-hint">Green and gold beans grow your garden — none yet.</p>
      </div>
    );
  }

  const slots = layoutSlots(visibleCount, showGrowing ? growingProgress : null);

  return (
    <div className="garden-bed">
      <div className="garden-scene">
        <div className="garden-ground-wild">
          <span className="ground-blob ground-blob-a" />
          <span className="ground-blob ground-blob-b" />
          <span className="ground-blob ground-blob-c" />
        </div>
        {slots.map((slot) => (
          <div
            key={slot.key}
            className="garden-slot"
            style={{
              left: `${slot.xPercent}%`,
              bottom: `${slot.bottom}px`,
              zIndex: slot.zIndex,
              transform: `translateX(-50%) rotate(${slot.rotation}deg) scale(${slot.scale})`,
            }}
          >
            {slot.type === 'bush' ? (
              <GardenBush health={health} size={PLANT_SIZE} />
            ) : slot.type === 'grass' ? (
              <GardenGrassTuft health={health} size={PLANT_SIZE} />
            ) : (
              <GardenFlower stage={slot.stage} health={health} size={PLANT_SIZE} />
            )}
          </div>
        ))}
      </div>
      <p className="garden-caption">
        {completedFlowers} {completedFlowers === 1 ? 'plant' : 'plants'}
        {overflow > 0 ? ` (+${overflow} more)` : ''}
      </p>
    </div>
  );
}
