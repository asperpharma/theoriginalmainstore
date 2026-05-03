import { useCallback, useEffect, useRef, useState } from "react";

const DURATION_MS = 8000;

/**
 * RAF-driven auto-advance hook.
 * Returns the current active index, a paused flag, and controls.
 */
export function useAutoAdvance(total: number) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);
  const activeRef = useRef(active);

  pausedRef.current = paused;
  activeRef.current = active;

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % total);
    setProgress(0);
    startRef.current = null;
  }, [total]);

  const goTo = useCallback((index: number) => {
    setActive(index);
    setProgress(0);
    startRef.current = null;
  }, []);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + total) % total);
    setProgress(0);
    startRef.current = null;
  }, [total]);

  const next = useCallback(() => {
    advance();
  }, [advance]);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = (timestamp: number) => {
      if (cancelled) return;
      if (pausedRef.current) {
        startRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = timestamp - startRef.current;
      const pct = Math.min(elapsed / DURATION_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        setActive((prev) => (prev + 1) % total);
        setProgress(0);
        startRef.current = null;
      }

      if (!cancelled) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [total]);

  return { active, paused, progress, goTo, prev, next, togglePause };
}
