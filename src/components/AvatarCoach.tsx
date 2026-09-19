import { fitnessLabel } from '../lib/avatar';

interface Props {
  fitness: number; // 0..1
  size?: 'sm' | 'lg';
}

interface Pt {
  x: number;
  y: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

/** A point `length` away from `base`, at `angleDeg` measured clockwise from straight down. */
function project(base: Pt, length: number, angleDeg: number): Pt {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: base.x + length * Math.sin(rad), y: base.y + length * Math.cos(rad) };
}

function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** A smooth curve that runs through every point in `pts`, via quadratic beziers through their midpoints. */
function smoothThrough(pts: Pt[]): string {
  let d = `L ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    d += ` Q ${pts[i].x} ${pts[i].y} ${mid(pts[i], pts[i + 1]).x} ${mid(pts[i], pts[i + 1]).y}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function normal(a: Pt, b: Pt): Pt {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

/** Builds a tapered tube through `points`, each with its own width, rounded off at the last point. */
function buildLimb(points: Pt[], widths: number[]): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i + 1];
    let n: Pt;
    if (prev && next) {
      const n1 = normal(prev, points[i]);
      const n2 = normal(points[i], next);
      const combined = { x: n1.x + n2.x, y: n1.y + n2.y };
      const len = Math.hypot(combined.x, combined.y) || 1;
      n = { x: combined.x / len, y: combined.y / len };
    } else if (next) {
      n = normal(points[i], next);
    } else {
      n = normal(prev, points[i]);
    }
    const w = widths[i] / 2;
    left.push({ x: points[i].x + n.x * w, y: points[i].y + n.y * w });
    right.push({ x: points[i].x - n.x * w, y: points[i].y - n.y * w });
  }
  const capR = widths[widths.length - 1] / 2;
  const rightRev = [...right].reverse();
  return [
    `M ${left[0].x} ${left[0].y}`,
    ...left.slice(1).map((p) => `L ${p.x} ${p.y}`),
    `A ${capR} ${capR} 0 1 1 ${rightRev[0].x} ${rightRev[0].y}`,
    ...rightRev.slice(1).map((p) => `L ${p.x} ${p.y}`),
    'Z',
  ].join(' ');
}

/** Builds a smooth closed torso silhouette from vertical width levels, mirrored left/right. */
function buildTorso(cx: number, topCenter: Pt, levels: { y: number; half: number }[], hemY: number, hemCenterHalf: number): string {
  const right = levels.map((l) => ({ x: cx + l.half, y: l.y }));
  const left = levels.map((l) => ({ x: cx - l.half, y: l.y })).reverse();
  return [
    `M ${topCenter.x} ${topCenter.y}`,
    `Q ${right[0].x} ${topCenter.y} ${right[0].x} ${right[0].y}`,
    smoothThrough(right),
    `Q ${cx + hemCenterHalf} ${hemY} ${cx} ${hemY}`,
    `Q ${cx - hemCenterHalf} ${hemY} ${left[0].x} ${left[0].y}`,
    smoothThrough(left),
    `Q ${topCenter.x} ${topCenter.y} ${topCenter.x} ${topCenter.y}`,
    'Z',
  ].join(' ');
}

/**
 * A male "coach" figure whose build, posture, grooming and expression
 * interpolate continuously with `fitness` (0..1) — driven by how many
 * gold/green beans the user has earned recently. Low scores read as
 * heavier through the middle, hunched, pale and unkempt; high scores read
 * as lean, upright, groomed and energised.
 */
export default function AvatarCoach({ fitness, size = 'sm' }: Props) {
  const f = Math.max(0, Math.min(1, fitness));
  const cx = 70;

  const lean = lerp(10, 0, f); // forward slouch when low
  const hunch = lerp(7, 0, f); // rounded shoulders when low

  // Torso silhouette: shoulders stay fairly stable, but the waist/hip swing
  // hard between a heavy overhang (low) and an athletic taper (high).
  const shoulderHalf = lerp(21, 28, f);
  const chestHalf = lerp(25, 27, f);
  const waistHalf = lerp(34, 17, f);
  const hipHalf = lerp(28, 19, f);
  const armThickness = lerp(1.25, 0.95, f);
  const legThickness = lerp(1.2, 0.95, f);

  const shirtColor = lerpColor([150, 150, 140], [27, 176, 150], f);
  const skinColor = lerpColor([216, 206, 197], [255, 219, 172], f); // pale/ashen when sick -> fair, healthy colour
  const hairColor = '#3b2414'; // dark brown
  const mouthCurve = lerp(-6, 7, f); // negative = frown, positive = smile
  const browTilt = lerp(6, -4, f); // positive = worried, negative = confident
  const glow = lerp(0, 0.5, f);
  const underEye = lerp(0.6, 0, f);
  const stubble = lerp(0.55, 0, f);
  const blush = lerp(0, 0.4, Math.max(0, f - 0.5) * 2);
  const wrinkles = lerp(0.6, 0, f);
  const messyHair = lerp(1, 0, Math.min(1, f / 0.6));
  const jowl = lerp(1, 0, Math.min(1, f / 0.55));
  const headRx = lerp(19.5, 17, f);

  const topY = 66;
  const chestY = 82;
  const waistY = 104;
  const hipY = 122;
  const kneeY = 142;
  const ankleY = 160;

  const topCenter = { x: cx, y: topY - 7 + hunch };
  const torsoPath = buildTorso(
    cx,
    topCenter,
    [
      { y: topY, half: shoulderHalf },
      { y: chestY, half: chestHalf },
      { y: waistY, half: waistHalf },
      { y: hipY, half: hipHalf },
    ],
    hipY + 6,
    hipHalf * 0.5,
  );

  // Arms swing outward enough to clear a wider waist, so a heavier build
  // doesn't just bury them in the belly silhouette.
  const bellyClear = Math.max(0, waistHalf - shoulderHalf);

  // Left-screen arm: flexes into a bicep curl as fitness rises.
  const leftShoulder = { x: cx - shoulderHalf + 5, y: topY + 6 };
  const leftUpperAngle = -(lerp(9, 22, f) + bellyClear * 1.1);
  const leftElbow = project(leftShoulder, 21, leftUpperAngle);
  const leftForearmAngle = lerp(-14, -165, f) - bellyClear * 0.6;
  const leftHand = project(leftElbow, 17, leftForearmAngle);
  const leftHandR = 5 * armThickness;
  const leftArmPath = buildLimb(
    [leftShoulder, leftElbow, leftHand],
    [11.5 * armThickness, 9 * armThickness, leftHandR * 2],
  );
  const bicepMid = project(leftShoulder, 11, leftUpperAngle);

  // Right-screen arm: stays relaxed, drooping more when tired.
  const rightShoulder = { x: cx + shoulderHalf - 5, y: topY + 6 };
  const rightUpperAngle = lerp(17, 5, f) + bellyClear * 1.1;
  const rightElbow = project(rightShoulder, 20, rightUpperAngle);
  const rightForearmAngle = lerp(26, 6, f) + bellyClear * 0.6;
  const rightHand = project(rightElbow, 17, rightForearmAngle);
  const rightHandR = 5 * armThickness;
  const rightArmPath = buildLimb(
    [rightShoulder, rightElbow, rightHand],
    [11.5 * armThickness, 9 * armThickness, rightHandR * 2],
  );

  // Legs: mostly vertical, widths taper knee -> ankle.
  const leftHip = { x: cx - hipHalf * 0.55, y: hipY + 4 };
  const leftKnee = { x: cx - hipHalf * 0.5, y: kneeY };
  const leftAnkle = { x: cx - hipHalf * 0.45, y: ankleY };
  const rightHip = { x: cx + hipHalf * 0.55, y: hipY + 4 };
  const rightKnee = { x: cx + hipHalf * 0.5, y: kneeY };
  const rightAnkle = { x: cx + hipHalf * 0.45, y: ankleY };
  const legWidths = [17 * legThickness, 13.5 * legThickness, 10.5 * legThickness];
  const leftLegPath = buildLimb([leftHip, leftKnee, leftAnkle], legWidths);
  const rightLegPath = buildLimb([rightHip, rightKnee, rightAnkle], legWidths);

  const showSweat = f < 0.32;
  const showSparkle = f >= 0.75;

  const stubbleDots = [
    [cx - 24, 44], [cx - 21.5, 46.5], [cx - 18, 48.5], [cx - 14, 50], [cx - 10, 50.8],
    [cx + 10, 50.8], [cx + 14, 50], [cx + 18, 48.5], [cx + 21.5, 46.5], [cx + 24, 44],
  ] as const;

  return (
    <div className={`avatar-coach${size === 'lg' ? ' avatar-coach-lg' : ''}`}>
      <svg
        viewBox="0 0 140 172"
        width={size === 'lg' ? 172 : 92}
        height={size === 'lg' ? 211 : 113}
        role="img"
        aria-label={fitnessLabel(f)}
      >
        <defs>
          <radialGradient id="coachGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ffd54a" stopOpacity={glow} />
            <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coachShade" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="limbShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy="65" r="66" fill="url(#coachGlow)" />
        <ellipse cx={cx} cy="166" rx="30" ry="4.8" fill="rgba(20, 15, 30, 0.14)" />

        <g transform={`rotate(${lean} ${cx} ${hipY})`}>
          {/* legs, fixed stance */}
          <path d={leftLegPath} fill="#3b3450" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
          <path d={leftLegPath} fill="url(#limbShade)" />
          <path d={rightLegPath} fill="#3b3450" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
          <path d={rightLegPath} fill="url(#limbShade)" />
          <ellipse cx={leftAnkle.x} cy={ankleY + 7} rx="10.5" ry="5.5" fill="#241f30" />
          <ellipse cx={rightAnkle.x} cy={ankleY + 7} rx="10.5" ry="5.5" fill="#241f30" />

          {/* torso + shirt, drawn before the arms so a wide waist doesn't swallow them */}
          <path d={torsoPath} fill={shirtColor} stroke="rgba(0,0,0,0.16)" strokeWidth="0.7" />
          <path d={torsoPath} fill="url(#coachShade)" />
          <path
            d={`M ${cx - shoulderHalf * 0.6} ${topY - 5} Q ${cx} ${topY + 6} ${cx + shoulderHalf * 0.6} ${topY - 5}`}
            fill="none"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="1.1"
          />
          <g stroke="rgba(30, 20, 10, 0.32)" strokeWidth="1.2" fill="none" opacity={wrinkles} strokeLinecap="round">
            <path d={`M ${cx - waistHalf + 6} ${waistY - 6} q 10 5 20 0`} />
            <path d={`M ${cx - waistHalf + 8} ${waistY + 6} q 12 5 24 0`} />
          </g>

          {/* ears, behind the head */}
          <ellipse cx={cx - headRx - 2} cy="39" rx="2.8" ry="4.4" fill={skinColor} />
          <ellipse cx={cx + headRx + 2} cy="39" rx="2.8" ry="4.4" fill={skinColor} />

          {/* relaxed arm, drawn in front of the torso */}
          <path d={rightArmPath} fill={skinColor} stroke="rgba(120,70,40,0.25)" strokeWidth="0.6" />
          <path d={rightArmPath} fill="url(#limbShade)" />
          <circle cx={rightElbow.x} cy={rightElbow.y} r={4.5 * armThickness} fill={skinColor} />
          <circle cx={rightHand.x} cy={rightHand.y} r={rightHandR} fill={skinColor} stroke="rgba(120,70,40,0.3)" strokeWidth="0.5" />

          {/* flexing arm */}
          <path d={leftArmPath} fill={skinColor} stroke="rgba(120,70,40,0.25)" strokeWidth="0.6" />
          <path d={leftArmPath} fill="url(#limbShade)" />
          <circle cx={leftElbow.x} cy={leftElbow.y} r={4.5 * armThickness} fill={skinColor} />
          <circle cx={leftHand.x} cy={leftHand.y} r={leftHandR} fill={skinColor} stroke="rgba(120,70,40,0.3)" strokeWidth="0.5" />
          <circle cx={bicepMid.x} cy={bicepMid.y} r={lerp(0, 7, f)} fill={skinColor} opacity={f > 0.15 ? 1 : 0} />

          {/* neck (tapered) + jowl/double-chin that fades in when fitness is low */}
          <path d={`M ${cx - 8} 50 L ${cx + 8} 50 L ${cx + 6.5} 63 L ${cx - 6.5} 63 Z`} fill={skinColor} />
          <ellipse cx={cx} cy={55} rx={lerp(11, 5, 1 - jowl)} ry={lerp(5.5, 1.5, 1 - jowl)} fill={skinColor} opacity={jowl} />

          {/* head */}
          <ellipse cx={cx} cy="37" rx={headRx} ry="19" fill={skinColor} />
          <ellipse cx={cx} cy="37" rx={headRx} ry="19" fill="url(#coachShade)" />

          {/* hair: neat base cap with a side part, plus stray cowlicks that fade in as grooming slips */}
          <path
            d={`M ${cx - headRx + 1} 33 Q ${cx - headRx - 0.5} 15 ${cx} 15 Q ${cx + headRx + 0.5} 15 ${cx + headRx - 1} 33 Q ${cx + headRx * 0.5} 24 ${cx} 25.5 Q ${cx - headRx * 0.5} 24 ${cx - headRx + 1} 33 Z`}
            fill={hairColor}
          />
          <path
            d={`M ${cx - 4} 16.5 Q ${cx - 2} 23 ${cx - 6} 26.5`}
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
          <g stroke={hairColor} strokeWidth="2.1" strokeLinecap="round" opacity={messyHair}>
            <path d={`M ${cx - 15} 20 l -5.5 -7.5`} />
            <path d={`M ${cx - 8} 16 l -2.5 -8.5`} />
            <path d={`M ${cx + 8} 16 l 2.5 -8.5`} />
            <path d={`M ${cx + 15} 20 l 5.5 -7.5`} />
            <path d={`M ${cx} 15 l 0 -7.5`} />
          </g>

          {/* sideburns + a light beard and moustache — always present, not tied to fitness */}
          <path
            d={`M ${cx - headRx + 2.5} 32 Q ${cx - headRx * 0.82} 39 ${cx - headRx * 0.72} 43.5`}
            stroke={hairColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d={`M ${cx + headRx - 2.5} 32 Q ${cx + headRx * 0.82} 39 ${cx + headRx * 0.72} 43.5`}
            stroke={hairColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d={`M ${cx - headRx * 0.72} 42 Q ${cx - headRx * 0.55} 53 ${cx} 54.5 Q ${cx + headRx * 0.55} 53 ${cx + headRx * 0.72} 42
                Q ${cx + headRx * 0.42} 50.5 ${cx} 52 Q ${cx - headRx * 0.42} 50.5 ${cx - headRx * 0.72} 42 Z`}
            fill={hairColor}
            opacity="0.3"
          />
          <path
            d={`M ${cx - 7} 44 Q ${cx} 42 ${cx + 7} 44 Q ${cx} 45.1 ${cx - 7} 44 Z`}
            fill={hairColor}
            opacity="0.45"
          />

          {/* face */}
          <path d={`M ${cx - 1} 39 q 1.8 3.2 0 5.6`} stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path
            d={`M ${cx - 14.5} ${28 + browTilt} Q ${cx - 10} ${25.5 - browTilt * 0.6} ${cx - 5.5} ${28 - browTilt}`}
            stroke={hairColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${cx + 5.5} ${28 - browTilt} Q ${cx + 10} ${25.5 - browTilt * 0.6} ${cx + 14.5} ${28 + browTilt}`}
            stroke={hairColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx={cx - 7.5} cy="40" rx="3.4" ry="1.9" fill="#6b5b73" opacity={underEye} />
          <ellipse cx={cx + 7.5} cy="40" rx="3.4" ry="1.9" fill="#6b5b73" opacity={underEye} />
          <ellipse cx={cx - 7.5} cy="36" rx="2.6" ry="2.9" fill="#fff" />
          <ellipse cx={cx + 7.5} cy="36" rx="2.6" ry="2.9" fill="#fff" />
          <circle cx={cx - 7.5} cy="36.4" r="1.9" fill="#2b2438" />
          <circle cx={cx + 7.5} cy="36.4" r="1.9" fill="#2b2438" />
          <circle cx={cx - 6.9} cy="35.8" r="0.6" fill="#fff" opacity={lerp(0, 0.9, f)} />
          <circle cx={cx + 8.1} cy="35.8" r="0.6" fill="#fff" opacity={lerp(0, 0.9, f)} />
          <ellipse cx={cx - 9.5} cy="42.5" rx="3.8" ry="2.2" fill="#ff9d8a" opacity={blush} />
          <ellipse cx={cx + 9.5} cy="42.5" rx="3.8" ry="2.2" fill="#ff9d8a" opacity={blush} />
          <path
            d={`M ${cx - 9} 47 Q ${cx} ${47 + mouthCurve} ${cx + 9} 47`}
            stroke="#2b2438"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <g fill="#3a2a20" opacity={stubble}>
            {stubbleDots.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" />
            ))}
          </g>
          {showSweat && (
            <path d={`M ${cx + 24} 29 Q ${cx + 28} 36 ${cx + 24} 41 Q ${cx + 20} 36 ${cx + 24} 29 Z`} fill="#8ecbff" opacity="0.85" />
          )}
        </g>

        {showSparkle && (
          <g fill="#ffd54a">
            <path d={`M ${cx - 47} 25 L ${cx - 45} 31 L ${cx - 39} 33 L ${cx - 45} 35 L ${cx - 47} 41 L ${cx - 49} 35 L ${cx - 55} 33 L ${cx - 49} 31 Z`} />
            <path d={`M ${cx + 25} 47 L ${cx + 26.3} 50.5 L ${cx + 30} 51.5 L ${cx + 26.3} 52.5 L ${cx + 25} 56 L ${cx + 23.7} 52.5 L ${cx + 20} 51.5 L ${cx + 23.7} 50.5 Z`} />
          </g>
        )}
      </svg>
    </div>
  );
}
