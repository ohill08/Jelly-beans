import { clamp01, lerp, lerpColor } from '../lib/svgMath';

interface Props {
  /** 0 (wilted) .. 1 (vibrant) — current vigor, shared across the whole garden. */
  health: number;
  /** Display scale; 1 = the SVG's natural 40x60 size. */
  size?: number;
}

const DRIED = [131, 115, 74] as const;
const FRESH = [58, 140, 76] as const;
const BUD_DRIED = [126, 108, 84] as const;
const BUD_FRESH = [214, 68, 96] as const;

/** A low, rounded shrub — three overlapping leaf clumps growing straight out of the ground, with small buds that only show once health is high enough. */
export default function GardenBush({ health, size = 1 }: Props) {
  const h = clamp01(health);
  const cx = 20;
  const groundY = 54;

  const bushColor = lerpColor(DRIED, FRESH, h);
  const budColor = lerpColor(BUD_DRIED, BUD_FRESH, h);
  const budOpacity = clamp01((h - 0.55) / 0.45);
  const sag = lerp(3, 0, h); // slumps a little when unhealthy

  return (
    <svg viewBox="0 0 40 60" width={40 * size} height={60 * size} aria-hidden="true">
      <ellipse cx={cx} cy={groundY} rx="9" ry="2.4" fill="#5a3d26" opacity="0.85" />
      <ellipse cx={cx - 7} cy={groundY - 9 + sag} rx="7.5" ry="7" fill={bushColor} />
      <ellipse cx={cx + 7} cy={groundY - 9 + sag} rx="7.5" ry="7" fill={bushColor} />
      <ellipse cx={cx} cy={groundY - 15 + sag} rx="9" ry="8.5" fill={bushColor} />
      <circle cx={cx - 4} cy={groundY - 16 + sag} r="1.6" fill={budColor} opacity={budOpacity} />
      <circle cx={cx + 5} cy={groundY - 13 + sag} r="1.6" fill={budColor} opacity={budOpacity} />
      <circle cx={cx + 1} cy={groundY - 20 + sag} r="1.6" fill={budColor} opacity={budOpacity} />
    </svg>
  );
}
