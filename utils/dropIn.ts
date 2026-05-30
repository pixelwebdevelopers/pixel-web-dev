/**
 * Returns the current Y offset for a prop that's "dropping in" from the sky.
 * Starts at `height`, falls to 0 with an easeOutBack overshoot for bounce.
 */
export function dropOffsetY(
  elapsed: number,
  delay: number,
  height = 40,
  duration = 1.0
): number {
  const t = (elapsed - delay) / duration;
  if (t <= 0) return height;
  if (t >= 1) return 0;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const u = t - 1;
  const eased = 1 + c3 * u * u * u + c1 * u * u;
  return height * (1 - eased);
}

/** Stable per-prop drop delay from a numeric seed (e.g. index or hash). */
export function dropDelay(seed: number, base = 0.05, jitter = 0.9): number {
  const f = ((seed * 9301 + 49297) % 233280) / 233280;
  return base + f * jitter;
}
