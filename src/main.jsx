import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Music2, CalendarDays, Clock3, MapPin, Heart, ArrowDown, Sparkles, Send, Volume2, VolumeX } from "lucide-react";
import "./styles.css";

const EVENT_DATE = "2026-12-15T11:00:00"; // Replace with the actual date and local time.
const VENUE = "Your Birthday Venue, Your City";
const MAP_QUERY = encodeURIComponent(VENUE);

function App() {
  const [opened, setOpened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState({days:"—",hours:"—",minutes:"—",seconds:"—"});
  const [rsvpSent, setRsvpSent] = useState(false);
  const [wishSent, setWishSent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(EVENT_DATE).getTime() - Date.now());
      setTimeLeft({
        days: String(Math.floor(diff / 86400000)).padStart(2,"0"),
        hours: String(Math.floor(diff / 3600000) % 24).padStart(2,"0"),
        minutes: String(Math.floor(diff / 60000) % 60).padStart(2,"0"),
        seconds: String(Math.floor(diff / 1000) % 60).padStart(2,"0")
      });
    };
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); setMenuOpen(false); };
  const submitRSVP = e => { e.preventDefault(); setRsvpSent(true); };
  const submitWish = e => { e.preventDefault(); setWishSent(true); };

  return <main>
    <AnimatePresence>
      {!opened && <motion.section className="envelope-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0, scale:1.04}} transition={{duration:.7}}>
        <div className="stars" aria-hidden="true">✦　⋆　✧　✦　⋆　✧　✦</div>
        <motion.div className="envelope-crown" animate={{y:[0,-8,0], rotate:[-3,3,-3]}} transition={{duration:3,repeat:Infinity}}>♛</motion.div>
        <p className="script gold">A special invitation</p>
        <h1 className="envelope-title">for you</h1>
        <motion.button className="envelope" onClick={() => setOpened(true)} whileHover={{scale:1.03}} whileTap={{scale:.97}} aria-label="Open birthday invitation">
          <span className="envelope-flap"></span><span className="seal">♛</span>
          <span className="envelope-name script">Krishiv</span>
          <span className="envelope-hint">Tap to open ✨</span>
        </motion.button>
        <p className="intro-small">A little prince is turning ONE</p>
      </motion.section>}
    </AnimatePresence>

    {opened && <>
      <header className="topbar">
        <button className="brand" onClick={() => scrollTo("home")}><span className="brand-crown">♛</span><span>Krishiv's <small>1st Birthday</small></span></button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          {["home","invitation","memories","details","rsvp","wishes"].map(id=><button key={id} onClick={()=>scrollTo(id)}>{id[0].toUpperCase()+id.slice(1)}</button>)}
        </nav>
        <button className="icon-btn menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen?<X/>:<Menu/>}</button>
        <button className="music-btn" onClick={()=>setMusicOn(!musicOn)} aria-label="Toggle music"><span>{musicOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</span>{musicOn?"Music on":"Music off"}</button>
      </header>

      <section className="hero section" id="home">
        <div className="floating-star star-one">✦</div><div className="floating-star star-two">✧</div><div className="floating-star star-three">✦</div>
        <div className="hero-copy">
          <p className="script gold">Our Little Prince</p>
          <p className="eyebrow">IS TURNING</p>
          <h1>Krishiv <span>ONE</span></h1>
          <p className="hero-sub">A year of love, laughter<br/>and little adventures.</p>
          <button className="primary-btn" onClick={()=>scrollTo("invitation")}>Explore the invitation <ArrowDown size={17}/></button>
        </div>
        <div className="hero-art" aria-label="Decorative birthday illustration">
          <div className="moon">☾</div><div className="castle">🏰</div><div className="balloon b1">🎈</div><div className="balloon b2">🎈</div>
          <div className="cloud cloud-a"></div><div className="cloud cloud-b"></div>
          <div className="baby-placeholder"><span>👑</span><strong>Baby<br/>Krishiv</strong><small>Add baby photo</small></div>
          <div className="teddy">🧸</div>
        </div>
        <div className="hero-bottom"><span>✦</span> One tiny hand, one big adventure <span>✦</span></div>
      </section>

      <section className="invitation section" id="invitation">
        <div className="section-kicker">YOU ARE CORDIALLY INVITED</div>
        <div className="ornament">✦ ── ♛ ── ✦</div>
        <h2>Baby <em>Krishiv</em></h2>
        <p className="body-copy">Our little bundle of joy is turning one!<br/>Please join us for a day filled with smiles, sweet memories and lots of love.</p>
        <div className="details-grid">
          <div className="detail-item"><CalendarDays/><div><b>Date</b><span>15 December 2026</span></div></div>
          <div className="detail-item"><Clock3/><div><b>Time</b><span>11:00 AM onwards</span></div></div>
          <div className="detail-item"><MapPin/><div><b>Venue</b><span>{VENUE}</span></div></div>
        </div>
        <a className="primary-btn map-btn" href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noreferrer"><MapPin size={17}/> Get directions</a>
        <p className="script signoff">Your presence will make our day magical!</p>
      </section>

      <section className="countdown section" id="countdown">
        <p className="script gold">The royal celebration begins in</p><h2>Countdown to the big day</h2>
        <div className="timer">{Object.entries(timeLeft).map(([label,value])=><div className="time-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
        <p className="tiny-note">Big things often have small beginnings ✨</p>
      </section>

      <section className="memories section" id="memories">
        <p className="section-kicker">LITTLE MOMENTS, BIG LOVE</p><h2>Krishiv's <em>First-Year Memories</em></h2>
        <p className="body-copy">A year of tiny hands, happy smiles and beautiful firsts.</p>
        <div className="gallery">
          {["Newborn days","First smiles","Little explorer","Family time"].map((label,i)=><div className={`photo-card photo-${i+1}`} key={label}><div className="photo-placeholder">{["☁️","🧸","⭐","💙"][i]}</div><span>{label}</span></div>)}
        </div>
        <p className="tiny-note">Replace these placeholders with your favourite photos of Krishiv.</p>
      </section>

      <section className="event section" id="details">
        <p className="section-kicker">SAVE THE DATE</p><h2>Celebrate with us</h2>
        <div className="event-card">
          <div className="event-icon">♛</div><h3>Krishiv's 1st Birthday</h3>
          <p><CalendarDays/> Tuesday, 15 December 2026</p><p><Clock3/> 11:00 AM onwards</p><p><MapPin/> {VENUE}</p>
          <a className="primary-btn" href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noreferrer"><MapPin size={17}/> Open in Google Maps</a>
        </div>
      </section>

      <section className="rsvp section" id="rsvp">
        <p className="section-kicker">WE HOPE YOU CAN JOIN</p><h2>Will you be there?</h2>
        {rsvpSent ? <div className="success"><span>💙</span><h3>Thank you!</h3><p>Your response has been noted in this demo.</p><small>To collect responses for real, connect this form to a backend or form service.</small></div> :
        <form className="form-card" onSubmit={submitRSVP}>
          <label>Your name<input required placeholder="Enter your name"/></label>
          <label>Mobile number (optional)<input type="tel" placeholder="Enter mobile number"/></label>
          <label>Number of guests<select defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></label>
          <fieldset><legend>Will you attend?</legend><label className="radio"><input type="radio" name="attendance" value="yes" defaultChecked/> Yes, we'll be there! 🎉</label><label className="radio"><input type="radio" name="attendance" value="no"/> Sorry, we can't make it.</label></fieldset>
          <label>Message for Krishiv (optional)<textarea placeholder="Write a little birthday message…"/></label>
          <button className="primary-btn full-btn" type="submit"><Heart size={17} fill="currentColor"/> Confirm attendance</button>
        </form>}
      </section>

      <section className="wishes section" id="wishes">
        <p className="section-kicker">SEND A LITTLE LOVE</p><h2>Birthday wishes <em>for Krishiv</em></h2>
        {wishSent ? <p className="success-inline">Your lovely wish has been added to this demo. 💙</p> : <form className="wish-form" onSubmit={submitWish}><input required placeholder="Your name"/><textarea required placeholder="Write a birthday wish for Krishiv…"/><button className="primary-btn" type="submit"><Send size={16}/> Send a wish</button></form>}
        <div className="wish-example"><span>“</span><p>May your world always be filled with wonder, laughter and love.</p><small>With love, family & friends</small></div>
      </section>

      <footer className="finale section">
        <div className="cake">🎂</div><p className="script gold">One little star, one big celebration!</p><h2>Thank you for being part of<br/><em>Krishiv's story.</em></h2><p>With love, Krishiv & Family 💙</p>
        <button className="share-btn" onClick={()=>navigator.share ? navigator.share({title:"Krishiv Turns One!",text:"You're invited to celebrate Krishiv's first birthday!",url:location.href}) : navigator.clipboard?.writeText(location.href)}>Share this invitation ↗</button>
      </footer>
    </>}
  </main>;
}

createRoot(document.getElementById("root")).render(<App/>);
