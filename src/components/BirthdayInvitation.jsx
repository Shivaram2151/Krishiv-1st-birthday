import { motion } from 'framer-motion';
import { CalendarDays, Clock3, MapPin, ArrowRight } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { formattedDate, formattedTime, fullAddress } from '../utils/event';
import { scrollToSection } from '../data/navigation';
import { Decor } from './Ambient';

const TBA = 'To be announced';

/** Screen 4 — the invitation card. */
export default function BirthdayInvitation() {
  const rows = [
    { icon: CalendarDays, label: 'Date', value: formattedDate() },
    { icon: Clock3, label: 'Time', value: formattedTime() },
    { icon: MapPin, label: 'Venue', value: fullAddress() || null },
  ];

  return (
    <section id="invitation" className="section section--ivory invitation" aria-labelledby="invitation-title">
      <Decor src={assets.balloonBlue} className="inv-balloon l anim-sway" />
      <Decor src={assets.balloonGold} className="inv-balloon r anim-sway" />
      <Decor src={assets.star5} className="inv-star s1 anim-float" />
      <Decor src={assets.star5} className="inv-star s2 anim-float" />

      <div className="container container--narrow">
        <motion.article
          className="invite-card gold-frame"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img className="invite-crown" src={assets.crown} alt="" aria-hidden="true" width="84" height="63" />
          <span className="eyebrow">Our Little Prince</span>
          <h2 id="invitation-title" className="invite-title">
            You&rsquo;re Cordially Invited
          </h2>
          <p className="invite-lead">To celebrate the first birthday of our little bundle of joy.</p>
          <img className="ornament" src={assets.ornament} alt="" aria-hidden="true" width="200" height="20" />
          <p className="invite-name script">{eventConfig.childName}</p>
          <p className="invite-body">
            One year of tiny hands, little smiles and endless happiness! We would be delighted to celebrate this
            special milestone with you and your family.
          </p>

          <dl className="invite-details">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="invite-row">
                <span className="invite-icon">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <dt>{label}</dt>
                  <dd className={value ? '' : 'is-tba'}>{value || TBA}</dd>
                </div>
              </div>
            ))}
          </dl>

          <button type="button" className="btn btn-blue" onClick={() => scrollToSection('details')}>
            View Event Details <ArrowRight aria-hidden="true" />
          </button>
        </motion.article>
      </div>
    </section>
  );
}
