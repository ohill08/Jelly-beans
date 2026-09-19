import { clamp01, lerp, lerpColor, lerpColor3, project } from '../lib/svgMath';

interface Props {
  /** 0 (bare soil) .. 1 (full bloom) — how grown this particular flower is. */
  stage: number;
  /** 0 (wilted) .. 1 (vibrant) — current vigor, shared across the whole garden. */
  health: number;
  /** Display scale; 1 = the SVG's natural 40x60 size. */
  size?: number;
}

const DRIED = [126, 108, 84] as const;
const TAN = [206, 158, 94] as const;
const BLOOM = [219, 84, 150] as const;
const LEAF_DRIED = [118, 104, 76] as const;
const LEAF_FRESH = [76, 175, 107] as const;

/** A single wildflower growing straight out of the ground: how tall/bloomed it is (`stage`) is independent of how vigorous it currently looks (`health`), so an established flower can still droop when recent habits slip, and a new sprout can still look lively. */
export default function GardenFlower({ stage, health, size = 1 }: Props) {
  const s = clamp01(stage);
  const h = clamp01(health);
  const cx = 20;

  const groundY = 54;
  const stemBaseY = groundY - 2;

  const stemH = lerp(3, 30, Math.max(s, 0.08));
  const droopFactor = Math.min(1, s / 0.3);
  const droopAngle = lerp(0, 62, 1 - h) * droopFactor;
  const stemTop = project({ x: cx, y: stemBaseY }, stemH, droopAngle);

  const leafY = stemBaseY - Math.min(stemH * 0.4, 9);
  const leafOpacity = clamp01((s - 0.15) / 0.3);
  const leafColor = lerpColor(LEAF_DRIED, LEAF_FRESH, h);

  const petalOpacity = clamp01((s - 0.35) / 0.65);
  const petalColor = lerpColor3(DRIED, TAN, BLOOM, h);
  const centerColor = lerpColor([120, 100, 60], [255, 204, 77], h);

  const petalAngles = [0, 72, 144, 216, 288];

  return (
    <svg viewBox="0 0 40 60" width={40 * size} height={60 * size} aria-hidden="true">
      <ellipse cx={cx} cy={groundY} rx="8" ry="2.4" fill="#5a3d26" opacity="0.85" />
      <path d={`M ${cx - 6} ${groundY - 1} Q ${cx - 6} ${groundY - 5} ${cx - 4} ${groundY - 2}`} stroke={leafColor} strokeWidth="1.4" fill="none" opacity={leafOpacity * 0.7} />
      <path d={`M ${cx + 6} ${groundY - 1} Q ${cx + 6} ${groundY - 5} ${cx + 4} ${groundY - 2}`} stroke={leafColor} strokeWidth="1.4" fill="none" opacity={leafOpacity * 0.7} />

      <line x1={cx} y1={stemBaseY} x2={stemTop.x} y2={stemTop.y} stroke={leafColor} strokeWidth="2.4" strokeLinecap="round" />

      <ellipse cx={cx - 4} cy={leafY} rx="5" ry="2.1" fill={leafColor} opacity={leafOpacity} transform={`rotate(-35 ${cx - 4} ${leafY})`} />
      <ellipse cx={cx + 4} cy={leafY} rx="5" ry="2.1" fill={leafColor} opacity={leafOpacity} transform={`rotate(35 ${cx + 4} ${leafY})`} />

      <g transform={`translate(${stemTop.x} ${stemTop.y})`} opacity={petalOpacity}>
        {petalAngles.map((angle) => (
          <ellipse key={angle} cx="0" cy="-5" rx="2.3" ry="4" fill={petalColor} transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="2" fill={centerColor} />
      </g>
    </svg>
  );
}
