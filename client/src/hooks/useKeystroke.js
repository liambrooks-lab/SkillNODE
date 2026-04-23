import { useEffect, useRef, useCallback } from "react";

/**
 * useKeystroke — captures keystroke timing data for typing analytics.
 * Returns helpers to start/stop recording and retrieve the stats.
 */
export function useKeystroke() {
  const timingsRef  = useRef([]);   // ms between consecutive keystrokes
  const lastTimeRef = useRef(null);
  const totalRef    = useRef(0);
  const errorsRef   = useRef(0);

  const onKey = useCallback((e) => {
    const now = Date.now();
    if (lastTimeRef.current !== null) {
      const delta = now - lastTimeRef.current;
      if (delta < 3000) {               // ignore pauses > 3s
        timingsRef.current.push(delta);
      }
    }
    lastTimeRef.current = now;
    totalRef.current += 1;
  }, []);

  function start() {
    timingsRef.current  = [];
    lastTimeRef.current = null;
    totalRef.current    = 0;
    errorsRef.current   = 0;
    document.addEventListener("keydown", onKey);
  }

  function stop() {
    document.removeEventListener("keydown", onKey);
  }

  function recordError() {
    errorsRef.current += 1;
  }

  function getStats() {
    const timings = timingsRef.current;
    const avg = timings.length
      ? timings.reduce((a, b) => a + b, 0) / timings.length
      : 0;
    const sorted = [...timings].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const errors = errorsRef.current;
    const total  = totalRef.current;
    return {
      keystrokes: total,
      errors,
      accuracy: total > 0 ? Math.max(0, ((total - errors) / total) * 100) : 100,
      avgIntervalMs: Math.round(avg),
      p50IntervalMs: p50,
      timings,
    };
  }

  useEffect(() => {
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [onKey]);

  return { start, stop, recordError, getStats };
}
