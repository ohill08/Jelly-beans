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

/** A 3-stop version of lerpColor, for a journey with a distinct midpoint hue rather than a flat blend. */
function lerpColor3(c0: [number, number, number], c1: [number, number, number], c2: [number, number, number], t: number): string {
  return t < 0.5 ? lerpColor(c0, c1, t * 2) : lerpColor(c1, c2, (t - 0.5) * 2);
}

/** A point `length` away from `base`, at `angleDeg` measured clockwise from straight down. */
function project(base: Pt, length: number, angleDeg: number): Pt {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: base.x + length * Math.sin(rad), y: base.y - length * Math.cos(rad) };
}

/**
 * A minimal "mood blob" coach — deliberately not a realistic person, just an
 * expressive creature whose shape, colour, posture and face all shift
 * continuously with `fitness` (0..1): squat, dull and droopy at the low end,
 * tall, vivid and bouncy at the high end.
 */
export default function AvatarCoach({ fitness, size = 'sm' }: Props) {
  const f = Math.max(0, Math.min(1, fitness));
  const cx = 70;
  const groundY = 142;
  const bodyBottomY = 136;

  // Body: squat and wide when low, tall and upright when high — the
  // clearest single cue that something has changed.
  const bodyRy = lerp(26, 40, f);
  const bodyRx = lerp(38, 29, f);
  const bodyCy = bodyBottomY - bodyRy;
  const lean = lerp(12, 0, f);

  // Colour travels through a distinct middle hue rather than a flat two-way
  // blend, so the "spectrum" reads as a real journey, not just a fade.
  const bodyColor = lerpColor3([158, 150, 156], [107, 142, 173], [21, 176, 146], f);
  const armColor = lerpColor3([140, 133, 140], [90, 126, 156], [16, 150, 124], f);

  const eyeCy = bodyCy - bodyRy * 0.35;
  const eyeLeftCx = cx - 11;
  const eyeRightCx = cx + 11;
  const eyeRy = lerp(1.3, 4.2, f); // sleepy slit -> wide open
  const eyelidOpacity = lerp(0.75, 0, f);
  const catchlightOpacity = lerp(0, 0.9, f);

  const mouthCy = eyeCy + 14;
  const mouthHalfW = lerp(7, 11, f);
  const mouthCurve = lerp(-9, 10, f); // negative = frown, positive = smile

  const cheekOffset = bodyRx * 0.55;
  const blush = lerp(0, 0.5, Math.max(0, f - 0.5) * 2);

  const glow = lerp(0, 0.55, f);

  // Antenna: wilts sideways/down when low, perks upright when high.
  // (`project`'s angle is measured from straight up.)
  const antennaBase = { x: cx, y: bodyCy - bodyRy };
  const antennaAngle = lerp(110, -10, f);
  const antennaTip = project(antennaBase, 16, antennaAngle);
  const antennaBallR = lerp(3, 4.6, f);

  // Little nub arms: hang limp at the sides when low, thrown up in a cheer when high.
  const armBaseY = bodyCy;
  const leftArmBase = { x: cx - bodyRx, y: armBaseY };
  const rightArmBase = { x: cx + bodyRx, y: armBaseY };
  const leftArmAngle = -lerp(160, 20, f);
  const rightArmAngle = lerp(160, 20, f);
  const leftHand = project(leftArmBase, 18, leftArmAngle);
  const rightHand = project(rightArmBase, 18, rightArmAngle);

  const shadowRx = lerp(30, 21, f);
  const shadowOpacity = lerp(0.18, 0.1, f);

  const showSweat = f < 0.32;
  const showSparkle = f >= 0.75;
  const sweatX = cx + bodyRx * 0.65;
  const sweatY = bodyCy - bodyRy * 0.55;

  return (
    <div className={`avatar-coach${size === 'lg' ? ' avatar-coach-lg' : ''}`}>
      <svg
        viewBox="0 0 140 165"
        width={size === 'lg' ? 172 : 92}
        height={size === 'lg' ? 203 : 108}
        role="img"
        aria-label={fitnessLabel(f)}
      >
        <defs>
          <radialGradient id="blobGlow" cx="50%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#ffd54a" stopOpacity={glow} />
            <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="blobShade" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={bodyCy - 10} r="64" fill="url(#blobGlow)" />
        <ellipse cx={cx} cy={groundY} rx={shadowRx} ry="5" fill={`rgba(20, 15, 30, ${shadowOpacity})`} />

        <g transform={`rotate(${lean} ${cx} ${groundY})`}>
          {/* arms, behind the body */}
          <line x1={leftArmBase.x} y1={leftArmBase.y} x2={leftHand.x} y2={leftHand.y} stroke={armColor} strokeWidth="9" strokeLinecap="round" />
          <circle cx={leftHand.x} cy={leftHand.y} r="5.2" fill={armColor} />
          <line x1={rightArmBase.x} y1={rightArmBase.y} x2={rightHand.x} y2={rightHand.y} stroke={armColor} strokeWidth="9" strokeLinecap="round" />
          <circle cx={rightHand.x} cy={rightHand.y} r="5.2" fill={armColor} />

          {/* body */}
          <ellipse cx={cx} cy={bodyCy} rx={bodyRx} ry={bodyRy} fill={bodyColor} />
          <ellipse cx={cx} cy={bodyCy} rx={bodyRx} ry={bodyRy} fill="url(#blobShade)" />

          {/* antenna, drawn on top of the body so it stays visible however it droops */}
          <line x1={antennaBase.x} y1={antennaBase.y} x2={antennaTip.x} y2={antennaTip.y} stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx={antennaTip.x} cy={antennaTip.y} r={antennaBallR} fill={bodyColor} />

          {/* face */}
          <path
            d={`M ${eyeLeftCx - 4} ${eyeCy - eyeRy - 1} Q ${eyeLeftCx} ${eyeCy - eyeRy - 3.5} ${eyeLeftCx + 4} ${eyeCy - eyeRy - 1}`}
            stroke="rgba(20, 15, 30, 0.55)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity={eyelidOpacity}
          />
          <path
            d={`M ${eyeRightCx - 4} ${eyeCy - eyeRy - 1} Q ${eyeRightCx} ${eyeCy - eyeRy - 3.5} ${eyeRightCx + 4} ${eyeCy - eyeRy - 1}`}
            stroke="rgba(20, 15, 30, 0.55)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity={eyelidOpacity}
          />
          <ellipse cx={eyeLeftCx} cy={eyeCy} rx="3.6" ry={eyeRy} fill="#2b2438" />
          <ellipse cx={eyeRightCx} cy={eyeCy} rx="3.6" ry={eyeRy} fill="#2b2438" />
          <circle cx={eyeLeftCx - 1} cy={eyeCy - eyeRy * 0.4} r="0.9" fill="#fff" opacity={catchlightOpacity} />
          <circle cx={eyeRightCx - 1} cy={eyeCy - eyeRy * 0.4} r="0.9" fill="#fff" opacity={catchlightOpacity} />

          <ellipse cx={cx - cheekOffset} cy={mouthCy - 3} rx="5" ry="3" fill="#ff9d8a" opacity={blush} />
          <ellipse cx={cx + cheekOffset} cy={mouthCy - 3} rx="5" ry="3" fill="#ff9d8a" opacity={blush} />

          <path
            d={`M ${cx - mouthHalfW} ${mouthCy} Q ${cx} ${mouthCy + mouthCurve} ${cx + mouthHalfW} ${mouthCy}`}
            stroke="#2b2438"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />

          {showSweat && (
            <path d={`M ${sweatX} ${sweatY - 6} Q ${sweatX + 4} ${sweatY} ${sweatX} ${sweatY + 6} Q ${sweatX - 4} ${sweatY} ${sweatX} ${sweatY - 6} Z`} fill="#8ecbff" opacity="0.85" />
          )}
        </g>

        {showSparkle && (
          <g fill="#ffd54a">
            <path d={`M ${cx - 50} 30 L ${cx - 48} 36 L ${cx - 42} 38 L ${cx - 48} 40 L ${cx - 50} 46 L ${cx - 52} 40 L ${cx - 58} 38 L ${cx - 52} 36 Z`} />
            <path d={`M ${cx + 44} 50 L ${cx + 45.3} 53.5 L ${cx + 49} 54.5 L ${cx + 45.3} 55.5 L ${cx + 44} 59 L ${cx + 42.7} 55.5 L ${cx + 39} 54.5 L ${cx + 42.7} 53.5 Z`} />
          </g>
        )}
      </svg>
    </div>
  );
}
