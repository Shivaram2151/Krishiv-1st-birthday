import { Copy, Navigation, ParkingCircle, Landmark, MapPin } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { directionsUrl, fullAddress, mapEmbedUrl, copyText } from '../utils/event';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { MapIllustration } from './EventDetails';
import { useToast } from './Toast';

/** Screen 10 — venue location with map, directions and copy-address. */
export default function VenueMap() {
  const toast = useToast();
  const dirUrl = directionsUrl();
  const embed = mapEmbedUrl();
  const address = fullAddress();
  const configured = Boolean(address);

  const copy = async () => {
    const ok = await copyText(address);
    toast(ok ? 'Address copied' : 'Could not copy — please copy it manually');
  };

  return (
    <section id="venue" className="section section--ivory venue" aria-labelledby="venue-title">
      <div className="container container--narrow">
        <SectionHeading id="venue-title" eyebrow="Getting There" title="Venue Location" subtitle="Find your way to the celebration." />

        <Reveal className="venue-card card gold-frame">
          <div className="venue-map">
            {embed ? (
              <iframe
                title={`Map showing ${eventConfig.venueName || 'the venue'}`}
                src={embed}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : eventConfig.venuePhoto ? (
              <img src={eventConfig.venuePhoto} alt={`${eventConfig.venueName || 'Venue'} photo`} loading="lazy" />
            ) : (
              <MapIllustration label={eventConfig.venueName?.trim() || null} />
            )}
          </div>

          <div className="venue-body">
            <div className="venue-title-row">
              <span className="info-icon">
                <MapPin aria-hidden="true" />
              </span>
              <div>
                <h3 className="venue-name">{eventConfig.venueName?.trim() || 'Venue to be announced'}</h3>
                <p className="venue-address">
                  {eventConfig.venueAddress?.trim() || 'The full address will be shared here soon.'}
                </p>
              </div>
            </div>

            {(eventConfig.parkingInfo || eventConfig.landmarks) && (
              <ul className="venue-extras">
                {eventConfig.parkingInfo && (
                  <li>
                    <ParkingCircle aria-hidden="true" />
                    <span>
                      <strong>Parking:</strong> {eventConfig.parkingInfo}
                    </span>
                  </li>
                )}
                {eventConfig.landmarks && (
                  <li>
                    <Landmark aria-hidden="true" />
                    <span>
                      <strong>Landmarks:</strong> {eventConfig.landmarks}
                    </span>
                  </li>
                )}
              </ul>
            )}

            <div className="btn-row venue-actions">
              {dirUrl ? (
                <a className="btn btn-blue" href={dirUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation aria-hidden="true" /> Directions
                </a>
              ) : (
                <button type="button" className="btn btn-blue" disabled>
                  <Navigation aria-hidden="true" /> Directions
                </button>
              )}
              <button type="button" className="btn btn-outline" onClick={copy} disabled={!configured}>
                <Copy aria-hidden="true" /> Copy Address
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
