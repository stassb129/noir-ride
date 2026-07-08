'use client';

import { useEffect, useRef } from 'react';
import styles from './CursorFollower.module.scss';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, summary';

export default function CursorFollower() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only on precise pointers (mouse/trackpad) — never on touch.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const ring = ringRef.current;
    if (!ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;
    let rafId = 0;

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const render = () => {
      // Small lag for that trailing, "premium" feel.
      ringX = lerp(ringX, mouseX, 0.18);
      ringY = lerp(ringY, mouseY, 0.18);
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(render);
    };

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        ring.classList.add(styles.visible);
      }
      const interactive = (e.target as Element | null)?.closest?.(INTERACTIVE_SELECTOR);
      ring.classList.toggle(styles.hovering, Boolean(interactive));
    };

    const handleLeave = () => {
      visible = false;
      ring.classList.remove(styles.visible);
    };

    const handleDown = () => ring.classList.add(styles.pressed);
    const handleUp = () => ring.classList.remove(styles.pressed);

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return <div ref={ringRef} className={styles.ring} aria-hidden />;
}
