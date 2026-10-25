import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper, Settings2 } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { eventStart, eventEnd } from '../utils/event';
import { assets } from '../data/assets';
import SectionHeading from './SectionHeading';
import { Starfield, Decor } from './Ambient';
import Reveal from './Reveal';

const pad = (n) => String(n).padStart(2, '0');

function Unit({ value, label }) {
  const text = label === 'Days' ? String(value) : pad(value);
  return (
    <div className="cd-card">
      <div className="cd-num" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ y: '-40%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '40%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="cd-label">{label}</span>
    </div>
  );
}

/** Screen 5 — live countdown. */
export default function Countdown() {
  const target = eventStart();
  const t = useCountdown(target);

  return (
    <section id="countdown" className="section section--navy countdown on-dark" aria-labelledby="countdown-title">
      <Starfield count={30} sparkles={6} seed={31} />
      <Decor src={assets.balloonGold} className="cd-balloon l anim-sway" />
      <Decor src={assets.balloonBlue} className="cd-balloon r anim-sway" />
      <div className="container container--narrow">
        <SectionHeading
          id="countdown-title"
          eyebrow="Save the Moment"
          title="Countdown to the Celebration"
          subtitle="We can't wait to celebrate with you!"
        />

        {!target && (
          <Reveal className="cd-config">
            <Settings2 aria-hidden="true" />
            <p>
              The countdown will begin as soon as the celebration date and time are announced.
              {import.meta.env.DEV && (
                <span className="cd-config-dev">
                  (Organizer: set <code>birthdayDate</code> and <code>birthdayTime</code> in{' '}
                  <code>src/data/eventConfig.js</code>.)
                </span>
              )}
            </p>
          </Reveal>
        )}

        {target && t && !t.done && (
          <Reveal>
            <div className="cd-grid">
              <Unit value={t.days} label="Days" />
              <Unit value={t.hours} label="Hours" />
              <Unit value={t.minutes} label="Minutes" />
              <Unit value={t.seconds} label="Seconds" />
            </div>
            {/* Announce at a calm granularity for screen readers */}
            <p className="visually-hidden" aria-live="polite">
              {t.days} days and {t.hours} hours to go
            </p>
          </Reveal>
        )}

        {target && t?.done && (
          <motion.div
            className="cd-done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            role="status"
          >
            <PartyPopper aria-hidden="true" />
            <p>
              {Date.now() < eventEnd().getTime() + 12 * 3600 * 1000
                ? 'Today\u2019s the big day! Let\u2019s celebrate our little prince!'
                : 'The celebration has happened \u2014 thank you for all the love and blessings!'}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
