/**
 * ─────────────────────────────────────────────────────────────
 *  KRISHIV TURNS ONE — CENTRAL EVENT CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  Edit ONLY this file to change event details, photos and music.
 *
 *  Leave a value as "" until it is confirmed. The website will
 *  show a tasteful "to be announced" state instead of inventing
 *  details, and features that depend on a value (countdown,
 *  directions, calendar, map, music) stay safely disabled.
 * ─────────────────────────────────────────────────────────────
 */

export const eventConfig = {
  childName: 'Manchala Sri Krishiv',
  siteName: 'Krishiv Turns One',
  tagline: 'One Year of Love, Laughter & Little Miracles.',
  themeName: 'Our Little Prince — Royal Blue and Gold',

  /* ── Date & time ───────────────────────────────────────────
   * birthdayDate: "YYYY-MM-DD"      e.g. "2026-12-15"
   * birthdayTime: "HH:mm" (24h)     e.g. "11:00"
   * endTime:      "HH:mm" (24h)     e.g. "15:00" (used for calendar)
   * timezone:     IANA name, shown to guests and used in the calendar
   * utcOffset:    offset of that timezone on the event day
   */
  birthdayDate: '2026-11-14',
  birthdayTime: '19:00',
  endTime: '23:00',
  timezone: 'Asia/Kolkata',
  utcOffset: '+05:30',

  /* ── Venue ─────────────────────────────────────────────── */
  venueName: 'VKB A/C Garden',
  venueAddress: 'Beside Pub Restaurant Lane, Govindpalli, Jagtial, Telangana 505327',
  // Optional. A verified Google Maps link for the venue (share link from
  // Google Maps). If empty, directions are built from venueAddress.
  mapsUrl: 'https://maps.app.goo.gl/SqcGHBPQyNPQkF4B7',
  // Optional. The src of Google Maps' "Share → Embed a map" iframe; shows the exact pin.
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d700!2d78.9144445!3d18.7827861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcd13ecfbf67e49%3A0x1be1aa7855810952!2sVKB%20a%2Fc%20Garden!5e1!3m2!1sen!2sin!4v1792939126895!5m2!1sen!2sin',
  // Optional verified coordinates, e.g. { lat: 17.385, lng: 78.4867 }
  coordinates: { lat: 18.7827861, lng: 78.9144445 },
  parkingInfo: '',
  landmarks: '',
  // Optional venue photo, e.g. "/assets/decorations/venue.webp"
  venuePhoto: '',

  /* ── Extras ────────────────────────────────────────────── */
  dressCode: '',
  organizerContact: '+91 91007 42151', // e.g. "+91 98765 43210"
  // How many guests a single RSVP may include
  maxGuestsPerRsvp: 6,

  /* ── Photos ────────────────────────────────────────────────
   * Put real photos in /public/assets/baby and /public/assets/gallery
   * and set the paths below (e.g. "/assets/baby/krishiv.webp").
   * Empty src = elegant placeholder showing the month number.
   */
  portrait: {
    src: '/assets/baby/krishiv.jpg',
    alt: 'Portrait of Krishiv',
  },
  // Month-wise photos: set src for each month, e.g. "/assets/gallery/month-01.webp".
  // Add fit: "contain" to show a wide photo whole in its tile instead of cropping the sides.
  gallery: [
    { src: '/assets/gallery/month-01.jpg', month: 1, category: '1 Month', date: 'Dec 2025', alt: 'Krishiv dressed in yellow silk among marigold rangoli at 1 month', fit: 'contain' },
    { src: '/assets/gallery/month-02.jpg', month: 2, category: '2 Months', date: 'Jan 2026', alt: 'Krishiv at 2 months' },
    { src: '/assets/gallery/month-03.jpg', month: 3, category: '3 Months', date: 'Feb 2026', alt: 'Krishiv as a little farmer at 3 months', fit: 'contain' },
    { src: '/assets/gallery/month-04.jpg', month: 4, category: '4 Months', date: 'Mar 2026', alt: 'Krishiv as a little chef at 4 months', fit: 'contain' },
    { src: '/assets/gallery/month-05.jpg', month: 5, category: '5 Months', date: 'Apr 2026', alt: 'Krishiv wrapped like a chocolate among sweets at 5 months', fit: 'contain' },
    { src: '/assets/gallery/month-06.jpg', month: 6, category: '6 Months', date: 'May 2026', alt: 'Krishiv with a toy-car race track at 6 months', fit: 'contain' },
    { src: '/assets/gallery/month-07.jpg', month: 7, category: '7 Months', date: 'Jun 2026', alt: 'Krishiv on a beach-themed setup at 7 months', fit: 'contain' },
    { src: '/assets/gallery/month-08.jpg', month: 8, category: '8 Months', date: 'Jul 2026', alt: 'Krishiv beside a hot-air-balloon basket at 8 months', fit: 'contain' },
    { src: '/assets/gallery/month-09.jpg', month: 9, category: '9 Months', date: 'Aug 2026', alt: 'Krishiv the little artist with paints at 9 months', fit: 'contain' },
    { src: '/assets/gallery/month-10.jpg', month: 10, category: '10 Months', date: 'Sep 2026', alt: 'Dr. Sri Krishiv with a doctor kit at 10 months', fit: 'contain' },
    { src: '/assets/gallery/month-11.jpg', month: 11, category: '11 Months', date: 'Oct 2026', alt: 'Krishiv the little cricketer at 11 months', fit: 'contain' },
    { src: '', month: 12, category: '1 Year', date: 'Nov 2026', alt: 'Krishiv at 1 year' },
  ],
  // Optional memory videos: { src: "/assets/gallery/clip.mp4", poster: "", title: "" }
  videos: [],

  /* ── Music ─────────────────────────────────────────────────
   * Put a licensed, gentle instrumental track in /public/assets/audio
   * and set e.g. "/assets/audio/lullaby.mp3". Empty = no music toggle.
   */
  musicUrl: '/assets/audio/birthday-music-box.mp3',

  /* ── Sharing ───────────────────────────────────────────────
   * Public URL of the deployed site. Empty = current page URL.
   */
  publicUrl: 'https://krishiv1stbirthday.shivaram.in',
  shareMessage:
    "You're invited to celebrate Manchala Sri Krishiv's first birthday! Saturday, 14 November 2026, 7 PM at VKB A/C Garden, Jagtial. Open the invitation for details, photos and RSVP:",

  theme: {
    primary: '#0754BB',
    navy: '#071B3D',
    gold: '#EAB95B',
    ivory: '#FFFAF0',
  },
};

export default eventConfig;
