import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Camera, Film, ImageIcon } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import SectionHeading from './SectionHeading';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';

function Placeholder({ item, large = false }) {
  return (
    <div className={`ph ${large ? 'ph--large' : ''}`} role="img" aria-label={`${item.category} — photo coming soon`}>
      <span className={`ph-icon ${item.month ? 'ph-icon--month' : ''}`}>
        {item.month ? <span aria-hidden="true">{item.month}</span> : <Camera aria-hidden="true" />}
      </span>
      <span className="ph-note">Photo coming soon</span>
    </div>
  );
}

/** Screen 6 — first-year memories gallery with lightbox. */
export default function PhotoGallery() {
  const photos = eventConfig.gallery || [];
  const videos = (eventConfig.videos || []).filter((v) => v.src);
  const [tab, setTab] = useState('photos');
  const [index, setIndex] = useState(null);

  return (
    <section id="memories" className="section section--white gallery" aria-labelledby="memories-title">
      <div className="container">
        <SectionHeading
          id="memories-title"
          eyebrow="Our Favourite Moments"
          title="Krishiv's First-Year Memories"
          subtitle="A journey of 365 days filled with love, laughter and beautiful moments."
        />

        {videos.length > 0 && (
          <div className="tabs" role="tablist" aria-label="Memories">
            <button
              role="tab"
              type="button"
              id="tab-photos"
              aria-selected={tab === 'photos'}
              aria-controls="panel-photos"
              className="tab"
              onClick={() => setTab('photos')}
            >
              <ImageIcon aria-hidden="true" /> Photos
            </button>
            <button
              role="tab"
              type="button"
              id="tab-videos"
              aria-selected={tab === 'videos'}
              aria-controls="panel-videos"
              className="tab"
              onClick={() => setTab('videos')}
            >
              <Film aria-hidden="true" /> Videos
            </button>
          </div>
        )}

        {tab === 'photos' && (
          <ul className="gallery-grid" id="panel-photos" role={videos.length ? 'tabpanel' : undefined} aria-labelledby={videos.length ? 'tab-photos' : undefined}>
            {photos.map((item, i) => (
              <motion.li
                key={`${item.category}-${i}`}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  className="photo-card"
                  onClick={() => setIndex(i)}
                  aria-label={`Open ${item.category} photo ${i + 1} of ${photos.length}`}
                >
                  <span className="photo-media">
                    {item.src ? (
                      <img src={item.src} alt={item.alt} loading="lazy" decoding="async" width="800" height="600" />
                    ) : (
                      <Placeholder item={item} />
                    )}
                  </span>
                  <span className="photo-caption">
                    {item.category}
                    {item.date && <small className="photo-date">{item.date}</small>}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        )}

        {tab === 'videos' && (
          <div className="video-grid" id="panel-videos" role="tabpanel" aria-labelledby="tab-videos">
            {videos.map((v, i) => (
              <figure key={v.src} className="video-card">
                <video src={v.src} poster={v.poster || undefined} controls preload="metadata" playsInline />
                {v.title && <figcaption>{v.title}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* Portal to <body> so the viewer sits above the fixed navbar and section stacking contexts. */}
      {createPortal(
        <AnimatePresence>
          {index !== null && (
            <Lightbox photos={photos} index={index} setIndex={setIndex} onClose={() => setIndex(null)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

function Lightbox({ photos, index, setIndex, onClose }) {
  const ref = useRef(null);
  const [dir, setDir] = useState(0);
  const count = photos.length;
  const item = photos[index];
  useScrollLock(true);
  const close = useCallback(() => onClose(), [onClose]);
  useFocusTrap(ref, true, close);

  const go = useCallback(
    (d) => {
      setDir(d);
      setIndex((i) => (i + d + count) % count);
    },
    [count, setIndex],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <motion.div
      ref={ref}
      className="lightbox on-dark"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${item.category}, ${index + 1} of ${count}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="lb-top">
        <span className="lb-count" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button type="button" className="icon-btn lb-close" onClick={close} aria-label="Close photo viewer" data-autofocus>
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="lb-stage" onClick={(e) => e.target === e.currentTarget && close()}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.figure
            key={index}
            className="lb-figure"
            custom={dir}
            initial={{ opacity: 0, x: dir * 60, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: dir * -60, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) go(1);
              else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
            }}
          >
            {item.src ? (
              <img src={item.src} alt={item.alt} draggable="false" />
            ) : (
              <Placeholder item={item} large />
            )}
            <figcaption>{item.date ? `${item.category} · ${item.date}` : item.category}</figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="lb-controls">
          <button type="button" className="lb-nav" onClick={() => go(-1)} aria-label="Previous photo">
            <ChevronLeft aria-hidden="true" />
          </button>
          <p className="lb-hint">Swipe or use the arrows</p>
          <button type="button" className="lb-nav" onClick={() => go(1)} aria-label="Next photo">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
