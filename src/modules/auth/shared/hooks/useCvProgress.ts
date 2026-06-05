import { useEffect, useState } from "react";

/**
 * Drives the CV analysis progress bar animation.
 * Advances quickly (4% steps) until 60%, then slowly (1% steps) up to 90%,
 * giving the impression the AI is working while the real request completes.
 */
export function useCvProgress(enabled: boolean): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) { setProgress(0); return; }
    const id = setInterval(() => {
      setProgress((p) => p >= 90 ? 90 : p + (p < 60 ? 4 : 1));
    }, 300);
    return () => clearInterval(id);
  }, [enabled]);

  return progress;
}
