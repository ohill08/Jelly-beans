import { clamp01, lerp, lerpColor, project } from '../lib/svgMath';

interface Props {
  /** 0 (wilted) .. 1 (vibrant) — current vigor, shared across the whole garden. */
  health: number;
  /** Display scale; 1 = the SVG's natural 40x60 size. */
  size?: number;
}

const DRIED = [176, 158, 92] as const;
const FRESH = [86, 168, 92] as const;

const BLADE_OFFSETS = [-6, -2, 2, 6, 9];
const BLADE_ANGLES = [-22, -9, 2, 12, 24];
const BLADE_LENGTHS = [0.85, 1, 0.78, 0.95, 0.7];

/** A tuft of wild grass blades fanning up from the ground — short and pale when unhealthy, tall and green when thriving. */
export default function GardenGrassTuft({ health, size = 1 }: Props) {
  const h = clamp01(health);
  const cx = 20;
  const groundY = 54;

  const color = lerpColor(DRIED, FRESH, h);
  const bladeH = lerp(9, 21, h);

  return (
    <svg viewBox="0 0 40 60" width={40 * size} height={60 * size} aria-hidden="true">
      <ellipse cx={cx} cy={groundY} rx="8" ry="2.2" fill="#5a3d26" opacity="0.85" />
      {BLADE_OFFSETS.map((bx, i) => {
        const base = { x: cx + bx, y: groundY - 1 };
        const length = bladeH * BLADE_LENGTHS[i];
        const tip = project(base, length, BLADE_ANGLES[i]);
        const mid = { x: base.x + (tip.x - base.x) * 0.5, y: base.y - length * 0.5 };
        return (
          <path
            key={bx}
            d={`M ${base.x} ${base.y} Q ${mid.x} ${mid.y} ${tip.x} ${tip.y}`}
            stroke={color}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
