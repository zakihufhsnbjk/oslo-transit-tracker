import { useEffect, useState } from "react";

/**
 * Forces a re-render on every tick. Components using this will
 * recalculate any Date.now()-based values automatically.
 */
export function useTicker(intervalMs = 1000): void {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}