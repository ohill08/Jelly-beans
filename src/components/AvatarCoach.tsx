import { fitnessLabel } from '../lib/avatar';
import { lerp, lerpColor3, project } from '../lib/svgMath';

interface Props {
  fitness: number; // 0..1
  /** Exercised at least once in the last 7 days — shows a headband. */
  exercisedRecently?: boolean;
  size?: 'sm' | 'lg';
}

/**
 * A humanoid "mood blob" coach — not a realistic person, but still
 * unmistakably a person: a head, a torso, arms and legs, all drawn as soft
 * rounded shapes. Shape, colour, posture and face all shift continuously
 * with `fitness` (0..1): squat, dull and slumped at the low end, tall,
 * vivid and bouncy at the high end.
 */
export default function AvatarCoach({ fitness, exercisedRecently = false, size = 'sm' }: Props) {
  const f = Math.max(0, Math.min(1, fitness));
  const cx = 70;
  const groundY = 192;
  const bodyBottomY = 166;

  // Torso: squat and wide when low, tall and upright when high.
  const bodyRy = lerp(24, 34, f);
  const bodyCy = bodyBottomY - bodyRy;
  const lean = lerp(12, 0, f);

  // The torso is a chest ellipse over a belly ellipse rather than one
  // uniform shape, so the silhouette itself changes with fitness: a round,
  // belly-led shape when low, a broader-chested, narrow-waisted one when
  // high — read as "fatter" vs. "slimmer and more muscular".
  const chestRx = lerp(25, 35, f);
  const chestRy = bodyRy * 0.62;
  const chestCy = bodyCy - bodyRy * 0.32;
  const bellyRx = lerp(37, 23, f);
  const bellyRy = bodyRy * 0.68;
  const bellyCy = bodyCy + bodyRy * 0.22;

  const headR = lerp(21, 19, f);
  const headCy = bodyCy - bodyRy - headR + 5; // sits slightly into the shoulders, no neck needed

  // Colour travels through a distinct middle hue rather than a flat two-way
  // blend, so the change reads as a real journey across the range.
  const bodyColor = lerpColor3([158, 150, 156], [107, 142, 173], [21, 176, 146], f);
  const armColor = lerpColor3([140, 133, 140], [90, 126, 156], [16, 150, 124], f);

  const eyeOffsetX = headR * 0.45;
  const eyeLeftCx = cx - eyeOffsetX;
  const eyeRightCx = cx + eyeOffsetX;
  const eyeCy = headCy - 2;
  const eyeRy = lerp(1.2, 3.6, f); // sleepy slit -> wide open
  const eyelidOpacity = lerp(0.75, 0, f);
  const catchlightOpacity = lerp(0, 0.9, f);
  const bagOpacity = lerp(0.6, 0, f); // puffy under-eye bags, fade out as fitness climbs
  const bagCy = eyeCy + eyeRy + 2.6;

  const mouthCy = headCy + headR * 0.4;
  const mouthHalfW = lerp(6, 9, f);
  const mouthCurve = lerp(-8, 9, f); // negative = frown, positive = smile

  const cheekOffset = headR * 0.58;
  const blush = lerp(0, 0.5, Math.max(0, f - 0.5) * 2);

  const glow = lerp(0, 0.55, f);

  // Hair tuft: wilts sideways when low, perks upright when high.
  const tuftBase = { x: cx, y: headCy - headR };
  const tuftAngle = lerp(95, -10, f);
  const tuftTip = project(tuftBase, 12, tuftAngle);
  const tuftBallR = lerp(2.2, 3.4, f);

  // Arms: hang limp at the sides when low, thrown up in a cheer when high.
  // Width also grows with fitness — thin/weak at low, toned/muscular at high.
  const leftArmBase = { x: cx - chestRx, y: chestCy };
  const rightArmBase = { x: cx + chestRx, y: chestCy };
  const leftArmAngle = -lerp(160, 20, f);
  const rightArmAngle = lerp(160, 20, f);
  const leftHand = project(leftArmBase, 18, leftArmAngle);
  const rightHand = project(rightArmBase, 18, rightArmAngle);
  const armWidth = lerp(7.5, 10.5, f);

  // Legs: stand short and squat when low, tall and planted when high.
  const legBottomY = lerp(186, 194, f);
  const legGapX = bellyRx * 0.42;
  const leftLegX = cx - legGapX;
  const rightLegX = cx + legGapX;
  const legWidth = lerp(15, 11, f);

  const shadowRx = lerp(30, 21, f);
  const shadowOpacity = lerp(0.18, 0.1, f);

  const showSweat = f < 0.32;
  const showSparkle = f >= 0.75;
  const sweatX = cx + headR * 0.75;
  const sweatY = headCy - headR * 0.3;

  // Headband: sits above the eyebrows, its width following the head's own
  // curvature at that height so it reads as wrapping around, not floating.
  const bandDy = headR * 0.62;
  const bandY = headCy - bandDy;
  const bandHalfW = Math.sqrt(headR * headR - bandDy * bandDy) * 0.92;

  return (
    <div className={`avatar-coach${size === 'lg' ? ' avatar-coach-lg' : ''}`}>
      <svg
        viewBox="0 0 140 200"
        width={size === 'lg' ? 172 : 92}
        height={size === 'lg' ? 246 : 131}
        role="img"
        aria-label={fitnessLabel(f)}
      >
        <defs>
          <radialGradient id="coachGlow" cx="50%" cy="35%" r="58%">
            <stop offset="0%" stopColor="#ffd54a" stopOpacity={glow} />
            <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coachShade" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={headCy + 10} r="70" fill="url(#coachGlow)" />
        <ellipse cx={cx} cy={groundY} rx={shadowRx} ry="5" fill={`rgba(20, 15, 30, ${shadowOpacity})`} />

        <g transform={`rotate(${lean} ${cx} ${groundY})`}>
          {/* legs, fixed stance */}
          <line x1={leftLegX} y1={bodyBottomY} x2={leftLegX} y2={legBottomY} stroke="#3b3450" strokeWidth={legWidth} strokeLinecap="round" />
          <line x1={rightLegX} y1={bodyBottomY} x2={rightLegX} y2={legBottomY} stroke="#3b3450" strokeWidth={legWidth} strokeLinecap="round" />
          <ellipse cx={leftLegX} cy={legBottomY + 3} rx="9" ry="4.5" fill="#241f30" />
          <ellipse cx={rightLegX} cy={legBottomY + 3} rx="9" ry="4.5" fill="#241f30" />

          {/* arms, behind the torso */}
          <line x1={leftArmBase.x} y1={leftArmBase.y} x2={leftHand.x} y2={leftHand.y} stroke={armColor} strokeWidth={armWidth} strokeLinecap="round" />
          <circle cx={leftHand.x} cy={leftHand.y} r="5" fill={armColor} />
          <line x1={rightArmBase.x} y1={rightArmBase.y} x2={rightHand.x} y2={rightHand.y} stroke={armColor} strokeWidth={armWidth} strokeLinecap="round" />
          <circle cx={rightHand.x} cy={rightHand.y} r="5" fill={armColor} />

          {/* torso: belly below chest, their relative size is what shifts the silhouette */}
          <ellipse cx={cx} cy={bellyCy} rx={bellyRx} ry={bellyRy} fill={bodyColor} />
          <ellipse cx={cx} cy={chestCy} rx={chestRx} ry={chestRy} fill={bodyColor} />
          <ellipse cx={cx} cy={bellyCy} rx={bellyRx} ry={bellyRy} fill="url(#coachShade)" />
          <ellipse cx={cx} cy={chestCy} rx={chestRx} ry={chestRy} fill="url(#coachShade)" />

          {/* head */}
          <circle cx={cx} cy={headCy} r={headR} fill={bodyColor} />
          <circle cx={cx} cy={headCy} r={headR} fill="url(#coachShade)" />

          {/* hair tuft, on top of the head so it stays visible however it droops */}
          <line x1={tuftBase.x} y1={tuftBase.y} x2={tuftTip.x} y2={tuftTip.y} stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx={tuftTip.x} cy={tuftTip.y} r={tuftBallR} fill={bodyColor} />

          {/* headband: worn whenever they've exercised in the last week */}
          {exercisedRecently && (
            <g>
              <line x1={cx - bandHalfW} y1={bandY} x2={cx + bandHalfW} y2={bandY} stroke="#ff6b4a" strokeWidth="6" strokeLinecap="round" />
              <line
                x1={cx - bandHalfW}
                y1={bandY - 1.6}
                x2={cx + bandHalfW}
                y2={bandY - 1.6}
                stroke="#ffe1d6"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle cx={cx - bandHalfW} cy={bandY} r="2.6" fill="#e14f2f" />
            </g>
          )}

          {/* face */}
          <path
            d={`M ${eyeLeftCx - 3.5} ${eyeCy - eyeRy - 1} Q ${eyeLeftCx} ${eyeCy - eyeRy - 3} ${eyeLeftCx + 3.5} ${eyeCy - eyeRy - 1}`}
            stroke="rgba(20, 15, 30, 0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity={eyelidOpacity}
          />
          <path
            d={`M ${eyeRightCx - 3.5} ${eyeCy - eyeRy - 1} Q ${eyeRightCx} ${eyeCy - eyeRy - 3} ${eyeRightCx + 3.5} ${eyeCy - eyeRy - 1}`}
            stroke="rgba(20, 15, 30, 0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity={eyelidOpacity}
          />
          <ellipse cx={eyeLeftCx} cy={eyeCy} rx="3.2" ry={eyeRy} fill="#2b2438" />
          <ellipse cx={eyeRightCx} cy={eyeCy} rx="3.2" ry={eyeRy} fill="#2b2438" />
          <circle cx={eyeLeftCx - 0.9} cy={eyeCy - eyeRy * 0.4} r="0.8" fill="#fff" opacity={catchlightOpacity} />
          <circle cx={eyeRightCx - 0.9} cy={eyeCy - eyeRy * 0.4} r="0.8" fill="#fff" opacity={catchlightOpacity} />
          <ellipse cx={eyeLeftCx} cy={bagCy} rx="3.4" ry="1.5" fill="#584a6b" opacity={bagOpacity} />
          <ellipse cx={eyeRightCx} cy={bagCy} rx="3.4" ry="1.5" fill="#584a6b" opacity={bagOpacity} />

          <ellipse cx={cx - cheekOffset} cy={mouthCy - 3} rx="4.4" ry="2.6" fill="#ff9d8a" opacity={blush} />
          <ellipse cx={cx + cheekOffset} cy={mouthCy - 3} rx="4.4" ry="2.6" fill="#ff9d8a" opacity={blush} />

          <path
            d={`M ${cx - mouthHalfW} ${mouthCy} Q ${cx} ${mouthCy + mouthCurve} ${cx + mouthHalfW} ${mouthCy}`}
            stroke="#2b2438"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />

          {showSweat && (
            <path d={`M ${sweatX} ${sweatY - 5.5} Q ${sweatX + 3.5} ${sweatY} ${sweatX} ${sweatY + 5.5} Q ${sweatX - 3.5} ${sweatY} ${sweatX} ${sweatY - 5.5} Z`} fill="#8ecbff" opacity="0.85" />
          )}
        </g>

        {showSparkle && (
          <g fill="#ffd54a">
            <path d={`M ${cx - 50} 35 L ${cx - 48} 41 L ${cx - 42} 43 L ${cx - 48} 45 L ${cx - 50} 51 L ${cx - 52} 45 L ${cx - 58} 43 L ${cx - 52} 41 Z`} />
            <path d={`M ${cx + 44} 55 L ${cx + 45.3} 58.5 L ${cx + 49} 59.5 L ${cx + 45.3} 60.5 L ${cx + 44} 64 L ${cx + 42.7} 60.5 L ${cx + 39} 59.5 L ${cx + 42.7} 58.5 Z`} />
          </g>
        )}
      </svg>
    </div>
  );
}
