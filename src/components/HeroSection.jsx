import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Mail, Images, CalendarHeart, ClipboardCheck, Heart } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { scrollToSection } from '../data/navigation';
import { Starfield, GoldParticles, CloudBank } from './Ambient';

const quickLinks = [
  { id: 'invitation', label: 'Invitation', icon: Mail },
  { id: 'memories', label: 'Memories', icon: Images },
  { id: 'details', label: 'Details', icon: CalendarHeart },
  { id: 'rsvp', label: 'RSVP', icon: ClipboardCheck },
  { id: 'wishes', label: 'Wishes', icon: Heart },
];

const ease = [0.22, 1, 0.36, 1];
const enter = (delay) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
});

/** Screen 3 — main hero. */
export default function HeroSection() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Subtle multi-layer parallax (transform only). Disabled for reduced motion.
  const p = (v) => (reduce ? 0 : v);
  const yCastle = useTransform(scrollYProgress, [0, 1], [0, p(60)]);
  const yBalloons = useTransform(scrollYProgress, [0, 1], [0, p(-90)]);
  const yPortrait = useTransform(scrollYProgress, [0, 1], [0, p(30)]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, p(-30)]);

  const hasPhoto = Boolean(eventConfig.portrait?.src?.trim());
  const portrait = hasPhoto ? eventConfig.portrait.src : assets.portraitPlaceholder;

  return (
    <section id="home" ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero-sky" aria-hidden="true" />
      <Starfield count={18} sparkles={7} seed={5} className="hero-stars" />
      <GoldParticles count={10} seed={9} />

      <div className="hero-inner container">
        <div className="hero-copy">
          <motion.span className="eyebrow" {...enter(0.1)}>
            <img src={assets.star} alt="" aria-hidden="true" width="12" height="12" />
            Our Little Prince
            <img src={assets.star} alt="" aria-hidden="true" width="12" height="12" />
          </motion.span>
          <motion.h1 id="hero-title" className="hero-title" {...enter(0.2)}>
            <span className="hero-name script">{eventConfig.childName}</span>
            <span className="hero-turns">Turns</span>
            <span className="hero-one gold-text-deep">ONE</span>
          </motion.h1>
          <motion.p className="hero-sub" {...enter(0.35)}>
            A year of love, laughter and little adventures.
          </motion.p>
          <motion.div className="hero-cta" {...enter(0.5)}>
            <button type="button" className="btn btn-gold" onClick={() => scrollToSection('invitation')}>
              You&rsquo;re Invited <ChevronDown aria-hidden="true" />
            </button>
          </motion.div>
        </div>

        <motion.div
          className="hero-art"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease }}
        >
          <motion.img
            style={{ y: yCastle }}
            className="hero-castle"
            src={assets.castle}
            alt=""
            aria-hidden="true"
            width="400"
            height="390"
          />
          <motion.div style={{ y: yBalloons }} className="hero-balloons" aria-hidden="true">
            <img className="b b1 anim-sway" src={assets.balloonBlue} alt="" width="120" height="260" />
            <img className="b b2 anim-sway" src={assets.balloonGold} alt="" width="120" height="260" />
            <img className="b b3 anim-sway" src={assets.balloonBlue} alt="" width="120" height="260" />
            <img className="b b4 anim-sway" src={assets.balloonGold} alt="" width="120" height="260" />
          </motion.div>

          <motion.div style={{ y: yPortrait }} className="hero-portrait-wrap">
            <div className="hero-portrait anim-float">
              <span className="portrait-glow anim-glow" aria-hidden="true" />
              <img className="portrait-crown" src={assets.crown} alt="" aria-hidden="true" width="120" height="90" />
              <div className="portrait-frame">
                <img
                  className="portrait-img"
                  src={portrait}
                  alt={hasPhoto ? eventConfig.portrait.alt : 'Portrait of Krishiv — photo coming soon'}
                  width="320"
                  height="400"
                  fetchPriority="high"
                />
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: yFront }} className="hero-front" aria-hidden="true">
            <img className="hero-teddy" src={assets.teddy} alt="" width="220" height="240" />
            <img className="hero-gift g1" src={assets.giftBlue} alt="" width="160" height="170" />
            <img className="hero-gift g2" src={assets.giftGold} alt="" width="160" height="170" />
          </motion.div>
          <CloudBank className="hero-clouds" />
        </motion.div>
      </div>

      <motion.nav className="quick-nav container" aria-label="Quick links" {...enter(0.7)}>
        <ul>
          {quickLinks.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
              >
                <span className="quick-icon">
                  <Icon aria-hidden="true" />
                </span>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>
    </section>
  );
}
