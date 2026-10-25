import { useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { navLinks, scrollToSection } from '../data/navigation';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { Starfield } from './Ambient';
import { MusicToggle } from './Navbar';
import { useMusic } from './MusicProvider';

/** Screen 12 — slide-in navigation menu. */
export default function NavigationMenu({ open, onClose }) {
  return <AnimatePresence>{open && <MenuPanel onClose={onClose} />}</AnimatePresence>;
}

function MenuPanel({ onClose }) {
  const ref = useRef(null);
  const { available, playing } = useMusic();
  const close = useCallback(() => onClose(), [onClose]);
  useFocusTrap(ref, true, close);
  useScrollLock(true);

  const go = (id) => {
    onClose();
    // Wait for the panel to start closing so the scroll lock is released.
    setTimeout(() => scrollToSection(id), 220);
  };

  return (
    <div className="menu-root">
      <motion.div
        className="menu-overlay"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        id="site-menu"
        className="menu-panel on-dark"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%', transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        <Starfield count={22} sparkles={4} seed={23} />
        <div className="menu-head">
          <div className="menu-brand">
            <img src={assets.crown} alt="" aria-hidden="true" width="48" height="36" />
            <div>
              <p className="menu-brand-name">{eventConfig.childName}</p>
              <p className="menu-brand-tag">Turns One</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close menu" data-autofocus>
            <X aria-hidden="true" />
          </button>
        </div>

        <ul className="menu-list">
          {navLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.li
                key={link.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.045, duration: 0.35 }}
              >
                <a
                  href={`#${link.id}`}
                  className="menu-link"
                  onClick={(e) => {
                    e.preventDefault();
                    go(link.id);
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              </motion.li>
            );
          })}
        </ul>

        {available && (
          <div className="menu-music">
            <span>Background music {playing ? 'on' : 'off'}</span>
            <MusicToggle />
          </div>
        )}
        <p className="menu-foot script">{eventConfig.tagline}</p>
      </motion.div>
    </div>
  );
}
