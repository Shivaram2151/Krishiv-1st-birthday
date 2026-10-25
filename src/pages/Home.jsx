import HeroSection from '../components/HeroSection';
import BirthdayInvitation from '../components/BirthdayInvitation';
import Countdown from '../components/Countdown';
import PhotoGallery from '../components/PhotoGallery';
import EventDetails from '../components/EventDetails';
import RSVPForm from '../components/RSVPForm';
import BirthdayWishes from '../components/BirthdayWishes';
import VenueMap from '../components/VenueMap';
import FinalSection from '../components/FinalSection';
import { eventConfig } from '../data/eventConfig';

export default function Home() {
  return (
    <>
      <main id="main">
        <HeroSection />
        <BirthdayInvitation />
        <Countdown />
        <PhotoGallery />
        <EventDetails />
        <RSVPForm />
        <BirthdayWishes />
        <VenueMap />
        <FinalSection />
      </main>
      <footer className="site-footer">
        <p>
          {eventConfig.siteName} · {eventConfig.tagline}
        </p>
      </footer>
    </>
  );
}
