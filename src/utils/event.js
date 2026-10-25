import { eventConfig as cfg } from '../data/eventConfig';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const OFFSET_RE = /^[+-]([01]\d|2[0-3]):[0-5]\d$/;

/** Builds an absolute Date from the configured local date/time + UTC offset. */
function toDate(date, time) {
  if (!DATE_RE.test(date || '') || !TIME_RE.test(time || '')) return null;
  const offset = OFFSET_RE.test(cfg.utcOffset || '') ? cfg.utcOffset : 'Z';
  const d = new Date(`${date}T${time}:00${offset}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const eventStart = () => toDate(cfg.birthdayDate, cfg.birthdayTime);

export const eventEnd = () => {
  const start = eventStart();
  if (!start) return null;
  const end = toDate(cfg.birthdayDate, cfg.endTime);
  // Default to a 4-hour celebration if no (valid) end time is configured.
  return end && end > start ? end : new Date(start.getTime() + 4 * 3600 * 1000);
};

export const hasDate = () => DATE_RE.test(cfg.birthdayDate || '');
export const hasStart = () => eventStart() !== null;

const fmt = (d, opts) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: cfg.timezone || undefined, ...opts }).format(d);

export function formattedDate() {
  if (!hasDate()) return null;
  // Noon on the configured day avoids any timezone date-rollover.
  const d = toDate(cfg.birthdayDate, '12:00');
  return d ? fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;
}

export function formattedTime() {
  const start = eventStart();
  if (!start) return null;
  return `${fmt(start, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()} onwards`;
}

export function directionsUrl() {
  if (cfg.mapsUrl?.trim()) return cfg.mapsUrl.trim();
  if (cfg.coordinates?.lat != null && cfg.coordinates?.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${cfg.coordinates.lat},${cfg.coordinates.lng}`;
  }
  const q = [cfg.venueName, cfg.venueAddress].filter(Boolean).join(', ').trim();
  if (!cfg.venueAddress?.trim()) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

/** Key-less Google Maps embed (no API key is needed or exposed). */
export function mapEmbedUrl() {
  if (cfg.mapEmbedUrl?.trim()) return cfg.mapEmbedUrl.trim();
  let q = '';
  if (cfg.coordinates?.lat != null && cfg.coordinates?.lng != null) q = `${cfg.coordinates.lat},${cfg.coordinates.lng}`;
  else if (cfg.venueAddress?.trim()) q = [cfg.venueName, cfg.venueAddress].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : null;
}

export const fullAddress = () => [cfg.venueName, cfg.venueAddress].filter((s) => s?.trim()).join(', ');

const icsStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const calendarTitle = () => `${cfg.childName}'s 1st Birthday Celebration`;
const calendarDetails = () =>
  `${cfg.tagline} Join us to celebrate ${cfg.childName}'s first birthday!` +
  (cfg.dressCode ? ` Dress code: ${cfg.dressCode}.` : '') +
  (cfg.organizerContact ? ` Contact: ${cfg.organizerContact}.` : '');

export function googleCalendarUrl() {
  const start = eventStart();
  if (!start) return null;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: calendarTitle(),
    dates: `${icsStamp(start)}/${icsStamp(eventEnd())}`,
    details: calendarDetails(),
    location: fullAddress(),
    ctz: cfg.timezone || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export function icsContent() {
  const start = eventStart();
  if (!start) return null;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Krishiv Turns One//Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:krishiv-first-birthday-${icsStamp(start)}@invitation`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(eventEnd())}`,
    `SUMMARY:${icsEscape(calendarTitle())}`,
    `DESCRIPTION:${icsEscape(calendarDetails())}`,
    `LOCATION:${icsEscape(fullAddress())}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(calendarTitle())} is tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadIcs() {
  const content = icsContent();
  if (!content) return false;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'krishiv-first-birthday.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export const shareUrl = () => cfg.publicUrl?.trim() || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
