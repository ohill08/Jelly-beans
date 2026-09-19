import type { BeanColor, DayEntry } from './types';
import { computeFitness } from './avatar';

/** Points a flower costs to fully plant. */
const FLOWER_COST = 3;

/**
 * Gold plants a flower outright (3 points — a whole flower in one go);
 * green builds toward one a third at a time (1 point, so every 3rd green
 * finishes a flower); red and sick days contribute nothing.
 */
function growthPoints(bean: BeanColor): number {
  if (bean === 'gold') return 3;
  if (bean === 'green') return 1;
  return 0;
}

export interface GardenState {
  /** Flowers fully planted so far — permanent; earned habits are never taken away. */
  completedFlowers: number;
  /** 0..1 progress toward the *next* flower, shown as a small growing sprout. */
  growingProgress: number;
  /**
   * 0 (wilted) .. 1 (blooming) — how vigorous the garden currently looks.
   * Reflects recent habits (the same score that drives the coach avatar),
   * not the permanent flower count: a red streak wilts the garden's colour
   * without deleting flowers you've already earned, and it recovers as
   * soon as the good days come back.
   */
  health: number;
}

export function computeGarden(entries: DayEntry[]): GardenState {
  const totalPoints = entries.reduce((sum, e) => sum + growthPoints(e.bean), 0);
  return {
    completedFlowers: Math.floor(totalPoints / FLOWER_COST),
    growingProgress: (totalPoints % FLOWER_COST) / FLOWER_COST,
    health: computeFitness(entries),
  };
}
