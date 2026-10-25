import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { eventConfig } from '../data/eventConfig';

const MusicCtx = createContext({ available: false, playing: false, toggle: () => {}, play: () => {} });

/**
 * Background music — only active when eventConfig.musicUrl is set.
 * Playback is only ever started from a user gesture (never autoplay).
 */
export function MusicProvider({ children }) {
  const available = Boolean(eventConfig.musicUrl?.trim());
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!available) return undefined;
    const audio = new Audio(eventConfig.musicUrl);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.45;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audioRef.current = null;
    };
  }, [available]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play().catch(() => setPlaying(false)); // blocked or failed to load — stay silent
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) play();
    else a.pause();
  }, [play]);

  return <MusicCtx.Provider value={{ available, playing, toggle, play }}>{children}</MusicCtx.Provider>;
}

export const useMusic = () => useContext(MusicCtx);
