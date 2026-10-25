import { memo, useMemo } from 'react';
import { assets } from '../data/assets';
import { useLowPower } from '../hooks/useLowPower';

/** Deterministic pseudo-random so the sky looks the same on every render. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Twinkling dots + a few golden sparkles. Pure CSS animation. */
export const Starfield = memo(function Starfield({ count = 36, sparkles = 6, seed = 7, className = '' }) {
  const low = useLowPower();
  const n = low ? Math.ceil(count / 2) : count;
  const m = low ? Math.ceil(sparkles / 2) : sparkles;
  const stars = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: n }, () => ({
      left: `${r() * 100}%`,
      top: `${r() * 100}%`,
      size: 1 + r() * 2.2,
      d: `${2.4 + r() * 3.5}s`,
      delay: `${-r() * 6}s`,
    }));
  }, [n, seed]);
  const spark = useMemo(() => {
    const r = seeded(seed + 101);
    return Array.from({ length: m }, () => ({
      left: `${4 + r() * 92}%`,
      top: `${4 + r() * 80}%`,
      size: 10 + r() * 16,
      d: `${3 + r() * 3}s`,
      delay: `${-r() * 5}s`,
    }));
  }, [m, seed]);

  return (
    <div className={`starfield ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, '--d': s.d, '--delay': s.delay }}
        />
      ))}
      {spark.map((s, i) => (
        <img
          key={`s${i}`}
          className="sparkle"
          src={assets.star}
          alt=""
          width={s.size}
          height={s.size}
          style={{ left: s.left, top: s.top, '--d': s.d, '--delay': s.delay }}
        />
      ))}
    </div>
  );
});

/** Slowly rising golden particles. */
export const GoldParticles = memo(function GoldParticles({ count = 14, seed = 3 }) {
  const low = useLowPower();
  const n = low ? Math.ceil(count / 2) : count;
  const parts = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: n }, () => ({
      left: `${r() * 100}%`,
      size: 3 + r() * 5,
      d: `${14 + r() * 14}s`,
      delay: `${-r() * 26}s`,
      dx: `${(r() - 0.5) * 80}px`,
      o: (0.4 + r() * 0.5).toFixed(2),
    }));
  }, [n, seed]);
  return (
    <div className="particles" aria-hidden="true">
      {parts.map((p, i) => (
        <span
          key={i}
          style={{ left: p.left, width: p.size, height: p.size, '--d': p.d, '--delay': p.delay, '--dx': p.dx, '--o': p.o }}
        />
      ))}
    </div>
  );
});

/** Decorative image — always hidden from assistive tech. */
export function Decor({ src, className = '', style, width, height }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`decor ${className}`}
      style={style}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  );
}

/** Row of fluffy clouds anchored to the bottom of a section. */
export function CloudBank({ className = '' }) {
  return (
    <div className={`cloud-bank ${className}`} aria-hidden="true">
      <img src={assets.cloud} alt="" className="cloud c1 anim-drift" draggable="false" />
      <img src={assets.cloud} alt="" className="cloud c2" draggable="false" />
      <img src={assets.cloud} alt="" className="cloud c3 anim-drift" draggable="false" />
    </div>
  );
}
