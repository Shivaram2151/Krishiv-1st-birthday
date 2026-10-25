import Reveal from './Reveal';
import { assets } from '../data/assets';

export default function SectionHeading({ eyebrow, title, subtitle, id }) {
  return (
    <Reveal className="section-heading">
      {eyebrow && (
        <span className="eyebrow">
          <img src={assets.star} alt="" aria-hidden="true" width="12" height="12" />
          {eyebrow}
          <img src={assets.star} alt="" aria-hidden="true" width="12" height="12" />
        </span>
      )}
      <h2 id={id}>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <img className="ornament" src={assets.ornament} alt="" aria-hidden="true" width="200" height="20" />
    </Reveal>
  );
}
