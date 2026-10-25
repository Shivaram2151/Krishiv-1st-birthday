import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { copyText, shareUrl } from '../utils/event';
import { Starfield, GoldParticles, CloudBank } from './Ambient';
import { useToast } from './Toast';

/** Screen 11 — closing thank-you + share. */
export default function FinalSection() {
  const toast = useToast();

  const share = async () => {
    const url = shareUrl();
    const data = { title: `${eventConfig.siteName} — Our Little Prince`, text: eventConfig.shareMessage, url };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // guest closed the share sheet
      }
    }
    const ok = await copyText(`${eventConfig.shareMessage} ${url}`);
    toast(ok ? 'Invitation link copied — paste it anywhere to share' : 'Copy failed — please copy the page address');
  };

  const ease = [0.22, 1, 0.36, 1];
  const v = (delay, y = 30) => ({
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section id="thank-you" className="section final on-dark" aria-labelledby="final-title">
      <div className="final-glow anim-glow" aria-hidden="true" />
      <Starfield count={40} sparkles={9} seed={41} />
      <GoldParticles count={12} seed={17} />

      <div className="container container--narrow final-inner">
        <motion.span className="eyebrow" {...v(0)}>
          One Little Star, One Big Celebration
        </motion.span>
        <motion.h2 id="final-title" className="final-title" {...v(0.1)}>
          Thank You for Being Part of Our Journey
        </motion.h2>

        <motion.div className="final-art" aria-hidden="true" {...v(0.2, 50)}>
          <img className="final-castle" src={assets.castle} alt="" width="400" height="390" loading="lazy" />
          <img className="fb fb1 anim-sway" src={assets.balloonBlue} alt="" width="120" height="260" loading="lazy" />
          <img className="fb fb2 anim-sway" src={assets.balloonGold} alt="" width="120" height="260" loading="lazy" />
          <img className="fb fb3 anim-sway" src={assets.balloonBlue} alt="" width="120" height="260" loading="lazy" />
          <img className="final-cake" src={assets.cake} alt="" width="300" height="320" loading="lazy" />
          <img className="final-teddy anim-float-slow" src={assets.teddy} alt="" width="220" height="240" loading="lazy" />
          <img className="final-gift" src={assets.giftGold} alt="" width="160" height="170" loading="lazy" />
        </motion.div>

        <motion.p className="final-with" {...v(0.3)}>
          With love,
        </motion.p>
        <motion.p className="final-sign script gold-text" {...v(0.4)}>
          {eventConfig.childName} &amp; Family
        </motion.p>

        <motion.div {...v(0.5)}>
          <button type="button" className="btn btn-gold btn-glow" onClick={share}>
            <Share2 aria-hidden="true" /> Share Invitation
          </button>
        </motion.div>
      </div>
      <CloudBank className="final-clouds" />
    </section>
  );
}
