import { hashSeed } from './svgMath';

/** Same jabs as LOW_TIER, worded for when they've clearly landed. */
const LOW_TIER = [
  'Are those jeans still tight?',
  'Still muffin-topping?',
  'Couch still warm from yesterday?',
  "Skipped the gym again, didn't you?",
  'That belt notch getting any tighter?',
];

const MID_TIER = [
  'Think you can string two good days together?',
  'Ready to actually break a sweat today?',
  'Still thinking about it, or are we doing this?',
  'Feeling those extra steps yet?',
  'Yesterday was fine. Today could be better.',
];

const HIGH_TIER = [
  'Those jeans finally loose on you?',
  'Muffin top a distant memory now?',
  "Keep this up and I'll need a new joke.",
  'Look at you, actually glowing.',
  "Who's the fit one now?",
];

/**
 * A teasing one-liner from the avatar — no response needed, just a nudge.
 * Picked deterministically from `seed` (typically today's date) so it
 * holds steady through the day rather than re-rolling on every render,
 * but still rotates day to day. Tone follows fitness: the harshest jabs
 * when things have slipped, the same jokes flipped into bragging once
 * fitness is high.
 */
export function pickTaunt(fitness: number, seed: string): string {
  const pool = fitness >= 0.8 ? HIGH_TIER : fitness < 0.3 ? LOW_TIER : MID_TIER;
  const index = hashSeed(`taunt-${seed}`) % pool.length;
  return pool[index];
}
