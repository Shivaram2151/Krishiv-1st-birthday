import { useEffect, useState } from 'react';

const calc = (target) => {
  const diff = Math.max(0, target - Date.now());
  const total = Math.floor(diff / 1000);
  return {
    done: diff <= 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

/** Live countdown to `target` (Date | null). Ticks on the second boundary and stops at zero. */
export function useCountdown(target) {
  const ts = target ? target.getTime() : null;
  const [state, setState] = useState(() => (ts ? calc(ts) : null));

  useEffect(() => {
    if (!ts) return undefined;
    let timer;
    const tick = () => {
      const next = calc(ts);
      setState(next);
      if (!next.done) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    // Re-sync when the tab becomes visible again (timers are throttled in background tabs).
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [ts]);

  return state;
}
