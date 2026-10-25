import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { Starfield, GoldParticles, CloudBank } from './Ambient';
import { useScrollLock } from '../hooks/useScrollLock';
import '../styles/envelope.css';

/**
 * Screens 1 + 2 — the magical envelope and the invitation reveal.
 *
 * phases:  closed → opening (flap) → rising (card peeks out)
 *          → present (invitation card shown) → onComplete()
 */
const TIMINGS = { opening: 0, rising: 850, present: 1900, complete: 4900 };

export default function EnvelopeOpening({ onOpen, onComplete }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState('closed');
  const timers = useRef([]);
  useScrollLock(true);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    onComplete();
  }, [onComplete]);

  const open = () => {
    if (phase !== 'closed') return;
    onOpen?.();
    if (reduce) {
      // Reduced motion: go straight to the revealed card; guest continues manually.
      setPhase('present');
      return;
    }
    setPhase('opening');
    timers.current.push(setTimeout(() => setPhase('rising'), TIMINGS.rising));
    timers.current.push(setTimeout(() => setPhase('present'), TIMINGS.present));
    timers.current.push(setTimeout(finish, TIMINGS.complete));
  };

  const opened = phase !== 'closed';
  const flapOpen = phase !== 'closed';
  const presenting = phase === 'present';
  const portrait = eventConfig.portrait?.src?.trim() || assets.portraitPlaceholder;

  return (
    <motion.div
      className="envelope-screen on-dark"
      role="dialog"
      aria-modal="true"
      aria-labelledby="envelope-title"
      onClick={open} // tap anywhere opens; open() ignores taps after the first
      style={{ cursor: opened ? undefined : 'pointer' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
    >
      <div className="env-glow anim-glow" aria-hidden="true" />
      <Starfield count={44} sparkles={8} seed={11} />
      <GoldParticles count={14} />

      <motion.div
        className="env-burst"
        aria-hidden="true"
        initial={false}
        animate={opened ? { opacity: [0, 1, 0.55], scale: [0.3, 1.25, 1.05] } : { opacity: 0, scale: 0.3 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />

      <div className="env-content">
        <motion.header
          className="env-header"
          animate={presenting ? { opacity: 0, y: -24 } : opened ? { opacity: 0.25, y: -8 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img
            src={assets.crown}
            alt=""
            aria-hidden="true"
            className="env-crown"
            width="64"
            height="48"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
          <motion.p
            className="env-kicker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            A Special Invitation
          </motion.p>
          <motion.h1
            id="envelope-title"
            className="env-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
          >
            <span className="env-title-small">Our Little Prince</span>
            <span className="env-title-name gold-text">{eventConfig.childName}</span>
          </motion.h1>
          <motion.p
            className="env-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            is turning one
          </motion.p>
        </motion.header>

        <motion.div
          className="env-stage"
          animate={presenting ? { y: 70, opacity: 0.35, scale: 0.92 } : { y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className={`envelope ${opened ? '' : 'anim-float'}`}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="env-back" />

            <motion.div
              className="env-peek"
              initial={false}
              animate={
                phase === 'rising' || phase === 'present' ? { y: '-52%' } : { y: '0%' }
              }
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              <img src={assets.crown} alt="" width="40" height="30" />
              <span className="script">{eventConfig.childName}</span>
            </motion.div>

            <div className="env-front" aria-hidden="true">
              <svg className="env-lines" viewBox="0 0 100 66" preserveAspectRatio="none">
                <path d="M0 66 L50 30 L100 66" fill="none" stroke="#EAB95B" strokeWidth="0.45" />
                <path d="M3 3 H97 V63 H3 Z" fill="none" stroke="#EAB95B" strokeWidth="0.3" strokeDasharray="1.2 1" />
              </svg>
              <span className="env-to">For our dearest family &amp; friends</span>
            </div>

            <motion.div
              className="env-flap"
              initial={false}
              animate={{ rotateX: flapOpen ? 180 : 0 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
              style={{ zIndex: phase === 'closed' || phase === 'opening' ? 6 : 2 }}
              aria-hidden="true"
            />

            <motion.img
              src={assets.seal}
              alt=""
              aria-hidden="true"
              className="env-seal"
              width="72"
              height="72"
              initial={false}
              animate={opened ? { opacity: 0, scale: 0.6, y: -10 } : { opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="env-footer"
          animate={opened ? { opacity: 0, y: 20, pointerEvents: 'none' } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.p
            className="env-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Sparkles aria-hidden="true" size={16} /> A little magic is waiting inside
          </motion.p>
          <motion.button
            type="button"
            className="btn btn-gold btn-glow env-open-btn"
            onClick={open}
            disabled={opened}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            autoFocus
          >
            Tap to Open <ArrowRight aria-hidden="true" />
          </motion.button>
        </motion.div>
      </div>

      {/* Screen 2 — the invitation card rising from the envelope */}
      <AnimatePresence>
        {presenting && (
          <motion.div
            className="reveal-card-wrap"
            initial={{ opacity: 0, y: 90, scale: 0.62 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="reveal-card gold-frame" role="document" aria-label="Invitation announcement">
              <img className="reveal-crown" src={assets.crown} alt="" aria-hidden="true" width="72" height="54" />
              <p className="reveal-kicker">Our Little Prince</p>
              <div className="reveal-portrait">
                <span className="reveal-portrait-glow" aria-hidden="true" />
                <img
                  src={portrait}
                  alt={eventConfig.portrait?.src ? eventConfig.portrait.alt : 'Photo of Krishiv coming soon'}
                  width="150"
                  height="150"
                />
              </div>
              <h2 className="reveal-name script">{eventConfig.childName}</h2>
              <p className="reveal-line">
                is Turning <strong className="gold-text-deep">ONE</strong>
              </p>
              <button type="button" className="btn btn-blue btn-sm reveal-enter" onClick={finish}>
                {reduce ? 'Enter the Invitation' : 'Continue'} <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <img className="env-teddy anim-float-slow" src={assets.teddy} alt="" aria-hidden="true" width="110" height="120" />
      <img className="env-gift" src={assets.giftBlue} alt="" aria-hidden="true" width="78" height="83" />
      <img className="env-gift env-gift-2" src={assets.giftGold} alt="" aria-hidden="true" width="56" height="60" />
      <CloudBank />
    </motion.div>
  );
}
