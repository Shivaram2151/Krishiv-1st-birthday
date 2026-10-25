import { useEffect, useState } from 'react';
import { Menu, Music2, VolumeX } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { scrollToSection } from '../data/navigation';
import { useMusic } from './MusicProvider';

export function MusicToggle({ className = '' }) {
  const { available, playing, toggle } = useMusic();
  if (!available) return null;
  return (
    <button
      type="button"
      className={`icon-btn music-btn ${playing ? 'is-playing' : ''} ${className}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause background music' : 'Play background music'}
    >
      {playing ? <Music2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
    </button>
  );
}

export default function Navbar({ onMenu, menuOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar-inner container" aria-label="Primary">
        <a
          href="#home"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
          aria-label={`${eventConfig.childName} turns one — back to top`}
        >
          <img src={assets.crown} alt="" aria-hidden="true" width="34" height="26" />
          <span className="brand-text">
            <span className="brand-name">{eventConfig.childName}</span>
            <span className="brand-tag">Turns One</span>
          </span>
        </a>
        <div className="navbar-actions">
          <MusicToggle />
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={onMenu}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  );
}
