import { fitnessLabel } from '../lib/avatar';

interface Props {
  fitness: number; // 0..1
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
function project(base: { x: number; y: number }, length: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: base.x + length * Math.sin(rad), y: base.y + length * Math.cos(rad) };
}

/**
 * A male "coach" figure whose posture, expression, grooming, skin tone and
 * physique interpolate continuously with `fitness` (0..1) — driven by how
 * many gold/green beans the user has earned recently. Low scores read as
 * run-down: pale/sallow skin, under-eye circles, stubble, mussed hair,
 * a wrinkled shirt and a rounder, more hunched frame. High scores read as
 * upright, groomed, glowing and athletic.
 */
export default function AvatarCoach({ fitness }: Props) {
  const f = Math.max(0, Math.min(1, fitness));

  const lean = lerp(9, 0, f); // forward slouch when low
  const hunch = lerp(6, 0, f); // rounded shoulders when low
  const shoulderHalf = lerp(20, 26, f);
  const waistHalf = lerp(22, 16.5, f);
  const bellyBulge = lerp(7, 0, f);
  const shirtColor = lerpColor([150, 150, 140], [27, 176, 150], f);
  const skinColor = lerpColor([201, 196, 176], [240, 195, 154], f); // sallow -> warm/healthy
  const mouthCurve = lerp(-6, 7, f); // negative = frown, positive = smile
  const browTilt = lerp(6, -4, f); // positive = worried, negative = confident
  const glow = lerp(0, 0.5, f);
  const underEye = lerp(0.6, 0, f);
  const stubble = lerp(0.55, 0, f);
  const blush = lerp(0, 0.4, Math.max(0, f - 0.5) * 2);
  const wrinkles = lerp(0.5, 0, f);
  const messyHair = lerp(1, 0, Math.min(1, f / 0.6));

  const topY = 58;
  const botY = 103;
  const midY = (topY + botY) / 2 + 8;
  const torsoPath = `
    M ${60 - shoulderHalf} ${topY}
    Q 60 ${topY - 6 + hunch} ${60 + shoulderHalf} ${topY}
    Q ${60 + waistHalf + bellyBulge} ${midY} ${60 + waistHalf} ${botY}
    Q 60 ${botY + 5} ${60 - waistHalf} ${botY}
    Q ${60 - waistHalf - bellyBulge} ${midY} ${60 - shoulderHalf} ${topY}
    Z
  `;

  // Left-screen arm: flexes into a bicep curl as fitness rises.
  const leftShoulder = { x: 60 - shoulderHalf + 4, y: topY + 5 };
  const leftUpperAngle = -lerp(9, 22, f);
  const leftElbow = project(leftShoulder, 19, leftUpperAngle);
  const leftForearmAngle = lerp(-15, -165, f);
  const leftHand = project(leftElbow, 16, leftForearmAngle);
  const bicepMid = project(leftShoulder, 10, leftUpperAngle);

  // Right-screen arm: stays relaxed, drooping more when tired.
  const rightShoulder = { x: 60 + shoulderHalf - 4, y: topY + 5 };
  const rightUpperAngle = lerp(16, 5, f);
  const rightElbow = project(rightShoulder, 18, rightUpperAngle);
  const rightForearmAngle = lerp(24, 6, f);
  const rightHand = project(rightElbow, 16, rightForearmAngle);

  const armPath = (shoulder: { x: number; y: number }, elbow: { x: number; y: number }, hand: { x: number; y: number }) =>
    `M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y} L ${hand.x} ${hand.y}`;

  const showSweat = f < 0.32;
  const showSparkle = f >= 0.75;

  // Stubble dots scattered along the jawline, fading out as fitness rises.
  const stubbleDots = [
    [46.5, 41], [48.5, 43.5], [51, 45.5], [54, 47], [57, 47.8],
    [63, 47.8], [66, 47], [69, 45.5], [71.5, 43.5], [73.5, 41],
  ];

  return (
    <div className="avatar-coach">
      <svg viewBox="0 0 120 150" width="84" height="105" role="img" aria-label={fitnessLabel(f)}>
        <defs>
          <radialGradient id="coachGlow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#ffd54a" stopOpacity={glow} />
            <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coachShade" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        <circle cx="60" cy="62" r="58" fill="url(#coachGlow)" />
        <ellipse cx="60" cy="138" rx="25" ry="4.5" fill="rgba(20, 15, 30, 0.14)" />

        {/* legs (fixed — the figure stands planted regardless of posture) */}
        <rect x="47" y="101" width="11" height="32" rx="5" fill="#3b3450" />
        <rect x="62" y="101" width="11" height="32" rx="5" fill="#3b3450" />
        <rect x="45" y="129" width="15" height="7" rx="3.5" fill="#241f30" />
        <rect x="60" y="129" width="15" height="7" rx="3.5" fill="#241f30" />

        <g transform={`rotate(${lean} 60 100)`}>
          {/* ears, behind the head */}
          <ellipse cx="41.5" cy="36" rx="2.6" ry="4" fill={skinColor} />
          <ellipse cx="78.5" cy="36" rx="2.6" ry="4" fill={skinColor} />

          {/* relaxed arm, drawn behind torso */}
          <path
            d={armPath(rightShoulder, rightElbow, rightHand)}
            stroke={skinColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx={rightHand.x} cy={rightHand.y} r="5.2" fill={skinColor} />

          {/* flexing arm */}
          <path
            d={armPath(leftShoulder, leftElbow, leftHand)}
            stroke={skinColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx={leftHand.x} cy={leftHand.y} r="5.2" fill={skinColor} />
          <circle cx={bicepMid.x} cy={bicepMid.y} r={lerp(0, 6.5, f)} fill={skinColor} opacity={f > 0.15 ? 1 : 0} />

          {/* torso */}
          <path d={torsoPath} fill={shirtColor} />
          <path d={torsoPath} fill="url(#coachShade)" />
          <g stroke="rgba(30, 20, 10, 0.35)" strokeWidth="1.3" fill="none" opacity={wrinkles} strokeLinecap="round">
            <path d={`M ${60 - waistHalf + 5} ${botY - 16} q 9 5 18 0`} />
            <path d={`M ${60 - waistHalf + 7} ${botY - 7} q 11 5 22 0`} />
          </g>

          {/* neck + head */}
          <rect x="55" y="49" width="10" height="11" fill={skinColor} />
          <circle cx="60" cy="35" r="17.5" fill={skinColor} />
          <circle cx="60" cy="35" r="17.5" fill="url(#coachShade)" />

          {/* hair: neat base cap, plus stray cowlicks that fade in as grooming slips */}
          <path d="M 43.5 32 Q 44 15 60 15 Q 76 15 76.5 32 Q 68 24 60 25 Q 52 24 43.5 32 Z" fill="#4a3324" />
          <g stroke="#4a3324" strokeWidth="2" strokeLinecap="round" opacity={messyHair}>
            <path d="M46 19 l-5 -7" />
            <path d="M53 15.5 l-2.5 -8" />
            <path d="M67 15.5 l2.5 -8" />
            <path d="M74 19 l5 -7" />
            <path d="M60 14 l0 -7" />
          </g>

          {/* face */}
          <path d="M59 37 q 1.6 3 0 5.2" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <line x1="47.5" y1={26 + browTilt} x2="54.5" y2={26 - browTilt} stroke="#2b2438" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="65.5" y1={26 - browTilt} x2="72.5" y2={26 + browTilt} stroke="#2b2438" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="52.5" cy="38" rx="3.2" ry="1.8" fill="#6b5b73" opacity={underEye} />
          <ellipse cx="67.5" cy="38" rx="3.2" ry="1.8" fill="#6b5b73" opacity={underEye} />
          <circle cx="52.5" cy="34" r="2.1" fill="#2b2438" />
          <circle cx="67.5" cy="34" r="2.1" fill="#2b2438" />
          <ellipse cx="50.5" cy="40.5" rx="3.6" ry="2.1" fill="#ff9d8a" opacity={blush} />
          <ellipse cx="69.5" cy="40.5" rx="3.6" ry="2.1" fill="#ff9d8a" opacity={blush} />
          <path d={`M 51 45 Q 60 ${45 + mouthCurve} 69 45`} stroke="#2b2438" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <g fill="#3a2a20" opacity={stubble}>
            {stubbleDots.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.65" />
            ))}
          </g>
        </g>

        {showSweat && <path d="M83 27 Q 87 34 83 39 Q 79 34 83 27 Z" fill="#8ecbff" opacity="0.85" />}
        {showSparkle && (
          <g fill="#ffd54a">
            <path d="M22 24 L24 30 L30 32 L24 34 L22 40 L20 34 L14 32 L20 30 Z" />
            <path d="M96 46 L97.3 49.5 L101 50.5 L97.3 51.5 L96 55 L94.7 51.5 L91 50.5 L94.7 49.5 Z" />
          </g>
        )}
      </svg>
    </div>
  );
}
