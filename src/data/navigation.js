import { Home, Mail, Images, CalendarHeart, ClipboardCheck, Heart, MapPin } from 'lucide-react';

/** Section ids used for navigation and deep links (e.g. /#rsvp). */
export const navLinks = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'invitation', label: 'Invitation', icon: Mail },
  { id: 'memories', label: 'Memories', icon: Images },
  { id: 'details', label: 'Event Details', icon: CalendarHeart },
  { id: 'rsvp', label: 'RSVP', icon: ClipboardCheck },
  { id: 'wishes', label: 'Birthday Wishes', icon: Heart },
  { id: 'venue', label: 'Venue Location', icon: MapPin },
];

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  // Move focus for keyboard / screen-reader users without scrolling again.
  const heading = el.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}
