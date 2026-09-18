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
 * A friendly male "coach" figure whose posture, expression, physique and
 * shirt color interpolate continuously with `fitness` (0..1) — driven by
 * how many gold/green beans the user has earned recently. Low scores read
 * as tired/slouched, high scores read as upright, energised and strong.
 */
export default function AvatarCoach({ fitness }: Props) {
  const f = Math.max(0, Math.min(1, fitness));

  const lean = lerp(7, 0, f); // forward slouch when low
  const shoulderHalf = lerp(21, 26, f);
  const waistHalf = lerp(20, 16.5, f);
  const shirtColor = lerpColor([146, 154, 172], [27, 176, 150], f);
  const mouthCurve = lerp(-5, 7, f); // negative = frown, positive = smile
  const browTilt = lerp(5, -4, f); // positive = worried, negative = confident
  const glow = lerp(0, 0.5, f);

  const topY = 58;
  const botY = 103;
  const torsoPath = `M ${60 - shoulderHalf} ${topY} Q 60 ${topY - 6} ${60 + shoulderHalf} ${topY} L ${
    60 + waistHalf
  } ${botY} Q 60 ${botY + 5} ${60 - waistHalf} ${botY} Z`;

  // Left-screen arm: flexes into a bicep curl as fitness rises.
  const leftShoulder = { x: 60 - shoulderHalf + 4, y: topY + 5 };
  const leftUpperAngle = -lerp(10, 22, f);
  const leftElbow = project(leftShoulder, 19, leftUpperAngle);
  const leftForearmAngle = lerp(-18, -165, f);
  const leftHand = project(leftElbow, 16, leftForearmAngle);
  const bicepMid = project(leftShoulder, 10, leftUpperAngle);

  // Right-screen arm: stays relaxed, drooping more when tired.
  const rightShoulder = { x: 60 + shoulderHalf - 4, y: topY + 5 };
  const rightUpperAngle = lerp(14, 5, f);
  const rightElbow = project(rightShoulder, 18, rightUpperAngle);
  const rightForearmAngle = lerp(20, 6, f);
  const rightHand = project(rightElbow, 16, rightForearmAngle);

  const armPath = (shoulder: { x: number; y: number }, elbow: { x: number; y: number }, hand: { x: number; y: number }) =>
    `M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y} L ${hand.x} ${hand.y}`;

  const showSweat = f < 0.32;
  const showSparkle = f >= 0.75;
  const skin = '#f0c39a';

  return (
    <div className="avatar-coach">
      <svg viewBox="0 0 120 150" width="84" height="105" role="img" aria-label={fitnessLabel(f)}>
        <defs>
          <radialGradient id="coachGlow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#ffd54a" stopOpacity={glow} />
            <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="60" cy="62" r="58" fill="url(#coachGlow)" />

        {/* legs (fixed — the figure stands planted regardless of posture) */}
        <rect x="47" y="101" width="11" height="32" rx="5" fill="#3b3450" />
        <rect x="62" y="101" width="11" height="32" rx="5" fill="#3b3450" />
        <rect x="45" y="129" width="15" height="7" rx="3.5" fill="#241f30" />
        <rect x="60" y="129" width="15" height="7" rx="3.5" fill="#241f30" />

        <g transform={`rotate(${lean} 60 100)`}>
          {/* relaxed arm, drawn behind torso */}
          <path
            d={armPath(rightShoulder, rightElbow, rightHand)}
            stroke={skin}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx={rightHand.x} cy={rightHand.y} r="5.2" fill={skin} />

          {/* flexing arm */}
          <path
            d={armPath(leftShoulder, leftElbow, leftHand)}
            stroke={skin}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx={leftHand.x} cy={leftHand.y} r="5.2" fill={skin} />
          <circle cx={bicepMid.x} cy={bicepMid.y} r={lerp(0, 6.5, f)} fill={skin} opacity={f > 0.15 ? 1 : 0} />

          {/* torso */}
          <path d={torsoPath} fill={shirtColor} />

          {/* neck + head */}
          <rect x="55" y="49" width="10" height="11" fill={skin} />
          <circle cx="60" cy="35" r="17.5" fill={skin} />
          <path d="M 43.5 32 Q 44 15 60 15 Q 76 15 76.5 32 Q 68 24 60 25 Q 52 24 43.5 32 Z" fill="#4a3324" />

          {/* face */}
          <line x1="47.5" y1={26 + browTilt} x2="54.5" y2={26 - browTilt} stroke="#2b2438" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="65.5" y1={26 - browTilt} x2="72.5" y2={26 + browTilt} stroke="#2b2438" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="52.5" cy="34" r="2.1" fill="#2b2438" />
          <circle cx="67.5" cy="34" r="2.1" fill="#2b2438" />
          <path d={`M 51 45 Q 60 ${45 + mouthCurve} 69 45`} stroke="#2b2438" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        </g>

        {showSweat && (
          <path d="M83 27 Q 87 34 83 39 Q 79 34 83 27 Z" fill="#8ecbff" opacity="0.85" />
        )}
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
