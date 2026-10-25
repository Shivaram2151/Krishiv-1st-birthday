import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Clock3, Landmark, MapPin, Shirt, Phone, Navigation, CalendarPlus, Download, ChevronDown, Info } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import {
  formattedDate,
  formattedTime,
  directionsUrl,
  mapEmbedUrl,
  googleCalendarUrl,
  downloadIcs,
  hasStart,
} from '../utils/event';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { useToast } from './Toast';

const TBA = 'To be announced';

function InfoCard({ icon: Icon, label, value, href, i }) {
  return (
    <Reveal className="info-card card" delay={(i % 2) * 0.06} y={18}>
      <span className="info-icon">
        <Icon aria-hidden="true" />
      </span>
      <div className="info-text">
        <p className="info-label">{label}</p>
        {href && value ? (
          <a className="info-value" href={href}>
            {value}
          </a>
        ) : (
          <p className={`info-value ${value ? '' : 'is-tba'}`}>{value || TBA}</p>
        )}
      </div>
    </Reveal>
  );
}

export function MapIllustration({ label }) {
  return (
    <div className="map-illus" aria-hidden="true">
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="220" fill="#EAF2FF" />
        <path d="M-10 160 C 80 120 140 190 230 140 S 360 90 410 120" stroke="#fff" strokeWidth="18" fill="none" />
        <path d="M120 -10 L 160 230" stroke="#fff" strokeWidth="14" />
        <path d="M-10 60 L 410 90" stroke="#fff" strokeWidth="10" />
        <path d="M290 -10 L 270 230" stroke="#fff" strokeWidth="8" />
        <rect x="18" y="86" width="80" height="50" rx="8" fill="#D7E6FB" />
        <rect x="180" y="16" width="90" height="56" rx="8" fill="#D7E6FB" />
        <rect x="300" y="140" width="80" height="60" rx="8" fill="#D7E6FB" />
        <circle cx="330" cy="40" r="22" fill="#CFE8D8" />
        <circle cx="60" cy="190" r="26" fill="#CFE8D8" />
      </svg>
      <span className="map-pin">
        <MapPin />
      </span>
      {label && <span className="map-label">{label}</span>}
    </div>
  );
}

/** Screen 7 — event details, directions and add-to-calendar. */
export default function EventDetails() {
  const toast = useToast();
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef(null);
  const dirUrl = directionsUrl();
  const embed = mapEmbedUrl();
  const gcal = googleCalendarUrl();
  const canCalendar = hasStart();

  useEffect(() => {
    if (!calOpen) return undefined;
    const onDown = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setCalOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [calOpen]);

  const cards = [
    { icon: CalendarDays, label: 'Birthday Date', value: formattedDate() },
    { icon: Clock3, label: 'Start Time', value: formattedTime() },
    { icon: Landmark, label: 'Venue', value: eventConfig.venueName?.trim() },
    { icon: MapPin, label: 'Address', value: eventConfig.venueAddress?.trim() },
  ];
  if (eventConfig.dressCode?.trim()) cards.push({ icon: Shirt, label: 'Dress Code', value: eventConfig.dressCode });
  if (eventConfig.organizerContact?.trim())
    cards.push({
      icon: Phone,
      label: 'Contact',
      value: eventConfig.organizerContact,
      href: `tel:${eventConfig.organizerContact.replace(/[^\d+]/g, '')}`,
    });

  return (
    <section id="details" className="section section--ivory details" aria-labelledby="details-title">
      <div className="container">
        <SectionHeading
          id="details-title"
          eyebrow="Join the Celebration"
          title="Event Details"
          subtitle="Everything you need to join our little celebration."
        />

        <div className="details-layout">
          <div className="info-grid">
            {cards.map((c, i) => (
              <InfoCard key={c.label} {...c} i={i} />
            ))}
          </div>

          <Reveal className="details-side card" delay={0.1}>
            {embed ? (
              <iframe
                className="details-map"
                title={`Map showing ${eventConfig.venueName || 'the venue'}`}
                src={embed}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <MapIllustration label={eventConfig.venueName?.trim() || null} />
            )}
            <div className="details-actions">
              {dirUrl ? (
                <a className="btn btn-blue btn-block" href={dirUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation aria-hidden="true" /> Get Directions
                </a>
              ) : (
                <button type="button" className="btn btn-blue btn-block" disabled aria-describedby="details-note">
                  <Navigation aria-hidden="true" /> Get Directions
                </button>
              )}

              <div className="cal-wrap" ref={calRef}>
                <button
                  type="button"
                  className="btn btn-gold btn-block"
                  onClick={() => setCalOpen((o) => !o)}
                  disabled={!canCalendar}
                  aria-expanded={calOpen}
                  aria-haspopup="menu"
                  aria-controls="cal-menu"
                  aria-describedby={!canCalendar ? 'details-note' : undefined}
                >
                  <CalendarPlus aria-hidden="true" /> Add to Calendar
                  <ChevronDown aria-hidden="true" className={`chev ${calOpen ? 'up' : ''}`} />
                </button>
                <AnimatePresence>
                  {calOpen && (
                    <motion.ul
                      id="cal-menu"
                      className="cal-menu"
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <li role="none">
                        <a
                          role="menuitem"
                          href={gcal}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setCalOpen(false)}
                        >
                          <CalendarDays aria-hidden="true" /> Google Calendar
                        </a>
                      </li>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            downloadIcs();
                            setCalOpen(false);
                            toast('Calendar file downloaded');
                          }}
                        >
                          <Download aria-hidden="true" /> Apple / Outlook (.ics)
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {(!dirUrl || !canCalendar) && (
                <p className="details-note" id="details-note">
                  <Info aria-hidden="true" />
                  <span>
                    {!dirUrl && !canCalendar
                      ? 'Directions and calendar will be available once the venue, date and time are announced.'
                      : !dirUrl
                        ? 'Directions will be available once the venue address is announced.'
                        : 'Calendar invites will be available once the date and time are announced.'}
                  </span>
                </p>
              )}
              {canCalendar && (
                <p className="details-tz">All times are in {eventConfig.timezone.replace('_', ' ')} time.</p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
