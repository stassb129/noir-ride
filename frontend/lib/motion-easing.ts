/**
 * Shared cubic-bezier for Framer Motion.
 * `as const` keeps TS from widening to `number[]`, which breaks `Variants` / `Transition` typing on CI.
 */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
