import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import EnvelopeOpening from './components/EnvelopeOpening';
import Navbar from './components/Navbar';
import NavigationMenu from './components/NavigationMenu';
import Home from './pages/Home';
import { MusicProvider, useMusic } from './components/MusicProvider';
import { ToastProvider } from './components/Toast';
import { scrollToSection } from './data/navigation';

function Experience() {
  const [opened, setOpened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { play } = useMusic();

  const complete = useCallback(() => setOpened(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Honour deep links such as /#rsvp once the envelope has been opened.
  useEffect(() => {
    if (!opened) return;
    window.scrollTo(0, 0);
    const id = window.location.hash.slice(1);
    // Use the link once, then drop it so a refresh starts at the top again.
    if (id) history.replaceState(null, '', window.location.pathname + window.location.search);
    // Wait for the envelope's fade-out (which holds the scroll lock) to finish.
    if (id && id !== 'home' && document.getElementById(id)) {
      const t = setTimeout(() => scrollToSection(id), 950);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [opened]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AnimatePresence>
        {!opened && <EnvelopeOpening key="envelope" onOpen={play} onComplete={complete} />}
      </AnimatePresence>
      {/* The site mounts as the envelope fades away so its entrance animations play on reveal. */}
      {opened && (
        <div className="site">
          <Navbar onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
          <Home />
        </div>
      )}
      <NavigationMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <MusicProvider>
          <Experience />
        </MusicProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
