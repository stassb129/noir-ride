import type Lenis from 'lenis';

// Module-level singleton so non-React helpers (e.g. scroll-to-hash) can drive
// the active Lenis instance for programmatic, smoothed scrolling.
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}
