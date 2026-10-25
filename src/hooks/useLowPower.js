import { useMemo } from 'react';

/** Rough heuristic so we can thin out ambient effects on modest devices. */
export function useLowPower() {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency || 8;
    const mem = navigator.deviceMemory || 8;
    const saveData = navigator.connection?.saveData === true;
    return saveData || cores <= 4 || mem <= 3;
  }, []);
}
