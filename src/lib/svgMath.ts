export interface Pt {
  x: number;
  y: number;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamps `t` to 0..1 before lerping, for values derived from open-ended sums. */
export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

type RGB = readonly [number, number, number];

export function lerpColor(c1: RGB, c2: RGB, t: number): string {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

/** A 3-stop version of lerpColor, for a journey with a distinct midpoint hue rather than a flat blend. */
export function lerpColor3(c0: RGB, c1: RGB, c2: RGB, t: number): string {
  return t < 0.5 ? lerpColor(c0, c1, t * 2) : lerpColor(c1, c2, (t - 0.5) * 2);
}

/** A point `length` away from `base`, at `angleDeg` measured clockwise from straight up. */
export function project(base: Pt, length: number, angleDeg: number): Pt {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: base.x + length * Math.sin(rad), y: base.y - length * Math.cos(rad) };
}
