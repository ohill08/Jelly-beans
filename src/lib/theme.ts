import type { BeanColor, DayEntry } from './types';

const RECENT_WINDOW = 7;

const BEAN_RGB: Record<BeanColor, [number, number, number]> = {
  gold: [244, 180, 0],
  green: [76, 175, 107],
  red: [229, 72, 77],
};

/**
 * Averages the RGB of the last week's beans, equal weight per day — an
 * all-green week comes out solid green, a mixed week lands somewhere
 * between. Returns null when there's no history yet, so callers can fall
 * back to the app's neutral default background.
 */
export function computeWeeklyBeanColor(entries: DayEntry[]): [number, number, number] | null {
  const recent = entries.slice(-RECENT_WINDOW);
  if (recent.length === 0) return null;

  const sum = recent.reduce(
    (acc, e) => {
      const [r, g, b] = BEAN_RGB[e.bean];
      return [acc[0] + r, acc[1] + g, acc[2] + b] as [number, number, number];
    },
    [0, 0, 0] as [number, number, number],
  );

  return [sum[0] / recent.length, sum[1] / recent.length, sum[2] / recent.length];
}

export function rgbString([r, g, b]: [number, number, number]): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
