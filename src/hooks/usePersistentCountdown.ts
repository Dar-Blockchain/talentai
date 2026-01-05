import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  ttl: number;
  storageKey: string;
  onExpire?: () => void;
}

export const usePersistentCountdown = ({
  ttl,
  storageKey,
  onExpire,
}: Options) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hasExpired, setHasExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    localStorage.removeItem(storageKey);
    setSecondsLeft(0);
    setHasExpired(false); // 🔑 important
  }, [storageKey]);

  const runTimer = useCallback(
    (expiresAt: number) => {
      const tick = () => {
        const remaining = Math.max(
          0,
          Math.floor((expiresAt - Date.now()) / 1000)
        );

        setSecondsLeft(remaining);

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          localStorage.removeItem(storageKey);
          setHasExpired(true); // 🔥 only natural expiry
          onExpire?.();
        }
      };

      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [storageKey, onExpire]
  );

  const start = useCallback(() => {
    setHasExpired(false);
    const expiresAt = Date.now() + ttl * 1000;
    localStorage.setItem(storageKey, expiresAt.toString());
    runTimer(expiresAt);
  }, [ttl, storageKey, runTimer]);

  const restore = useCallback(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    const expiresAt = Number(stored);

    if (expiresAt <= Date.now()) {
      localStorage.removeItem(storageKey);
      setSecondsLeft(0);
      setHasExpired(true);
      onExpire?.();
      return;
    }

    setHasExpired(false);
    runTimer(expiresAt);
  }, [storageKey, runTimer, onExpire]);

  useEffect(() => {
    restore();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restore]);

  return {
    secondsLeft,
    isExpired: hasExpired,
    isRunning: secondsLeft > 0,
    start,
    clear,
  };
};
