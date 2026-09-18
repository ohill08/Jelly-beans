import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import type { BeanColor, DayEntry } from '../lib/types';

interface Props {
  entries: DayEntry[];
  justAddedDate?: string | null;
}

// Virtual coordinate space for the packing simulation — matches the
// rendered interior of the jar in App.css (`.jar` height 320px, minus the
// 10px inset on every side).
const JAR_W = 240;
const JAR_H = 300;
const BEAN_W = 15;
const BEAN_H = 22;
const BINS = 18;
const BIN_W = JAR_W / BINS;
// Each bean only "banks" part of its visual height onto the pile, so beans
// overlap and nestle into one another like a real jar of jelly beans
// instead of stacking in neat, fully-separated rows.
const NEST = 0.5;
const FLOOR_PAD = 6;

interface Placed {
  date: string;
  bean: BeanColor;
  x: number;
  bottom: number;
  yJitter: number;
  rot: number;
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Lays beans out with a cheap gravity approximation: each bean (oldest
 * first) drops into whichever column currently has the lowest pile, with a
 * little deterministic jostle so the surface isn't perfectly flat, then
 * nudges its neighbours up so the mound stays rounded rather than spiky.
 */
function packBeans(entries: DayEntry[]) {
  const heights = new Array(BINS).fill(0);
  const placed: Placed[] = [];

  for (const entry of entries) {
    const seed = hashSeed(entry.date);
    let bestBin = 0;
    let bestScore = Infinity;
    for (let bin = 0; bin < BINS; bin++) {
      const jostle = Math.abs(Math.sin(seed * (bin + 1.7))) * 10;
      const score = heights[bin] + jostle;
      if (score < bestScore) {
        bestScore = score;
        bestBin = bin;
      }
    }

    const resting = heights[bestBin];
    // Wide enough to spill into a neighbouring bin's space, so the pile
    // doesn't read as discrete vertical columns at high bean counts.
    const jitterX = Math.sin(seed * 3.1) * BIN_W * 0.85;
    const yJitter = Math.cos(seed * 4.7) * 3;
    const rot = ((seed % 40) - 20) * 0.7;
    const rawX = bestBin * BIN_W + (BIN_W - BEAN_W) / 2 + jitterX;
    const x = Math.max(0, Math.min(JAR_W - BEAN_W, rawX));

    placed.push({ date: entry.date, bean: entry.bean, x, bottom: resting, yJitter, rot });

    const newHeight = resting + BEAN_H * NEST;
    heights[bestBin] = newHeight;
    // Round the mound out a little by lifting nearby bins too, tapering off with distance.
    for (const [offset, falloff] of [
      [-2, 0.15],
      [-1, 0.4],
      [1, 0.4],
      [2, 0.15],
    ] as const) {
      const i = bestBin + offset;
      if (i < 0 || i >= BINS) continue;
      const spillover = resting + BEAN_H * NEST * falloff;
      heights[i] = Math.max(heights[i], spillover);
    }
  }

  const pileHeight = Math.max(0, ...heights);
  const stackHeight = Math.max(JAR_H, pileHeight + BEAN_H + FLOOR_PAD);
  return { placed, stackHeight };
}

export default function JellyBeanJar({ entries, justAddedDate }: Props) {
  const { placed, stackHeight } = useMemo(() => packBeans(entries), [entries]);
  const isEmpty = entries.length === 0;

  return (
    <div className="jar-wrap">
      <div className="jar-lid" aria-hidden="true" />
      <div className="jar" aria-label={`Jelly bean jar with ${entries.length} beans`}>
        <div className="jar-shine" aria-hidden="true" />
        <div className="jar-beans">
          {isEmpty && <p className="jar-empty">Your jar is waiting for its first jelly bean.</p>}
          <div className="jar-beans-stack" style={{ height: stackHeight }}>
            {placed.map(({ date, bean, x, bottom, yJitter, rot }) => {
              const isNew = date === justAddedDate;
              return (
                <span
                  key={date}
                  className={`bean bean-${bean}${isNew ? ' bean-drop' : ''}`}
                  style={
                    {
                      left: `${x}px`,
                      top: `${stackHeight - bottom - BEAN_H + yJitter}px`,
                      rotate: `${rot}deg`,
                    } as CSSProperties
                  }
                  title={`${date}: ${bean}`}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="jar-base" aria-hidden="true" />
    </div>
  );
}
