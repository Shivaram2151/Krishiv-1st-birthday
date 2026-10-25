import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Music2, Crown, CalendarDays, Clock3, MapPin, Heart, Send, ChevronDown, Sparkles, Gift, Camera, CheckCircle2, Navigation, Share2, Volume2 } from 'lucide-react';
import './styles.css';

const EVENT_DATE = '2026-12-15T11:00:00'; // Update with your actual date and time
const EVENT_LABEL = 'Tuesday, 15 December 2026'; // Update this label too
const EVENT_TIME = '11:00 AM onwards';
const VENUE = 'Your Birthday Venue, Jagtial, Telangana'; // Replace with the actual venue
const MAPS_URL = 'https://maps.google.com/?q=Jagtial,Telangana'; // Replace with exact venue directions
const babyPhoto = 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=85';
const gallery = [
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=85'
];

function App() {
  const [opened, setOpened] = useState(false);
  const [menu, setMenu] = useState(false);
  const [music, setMusic] = useState(false);
  const [timeLeft, setTimeLeft] = useState({days:'--',hours:'--',minutes:'--',seconds:'--'});
  const [wishes, setWishes] = useState([{name:'Priya & Family',text:'Happy 1st birthday, Krishiv! May your life always be filled with love and happiness. 💙'},{name:'Anand',text:'Lots of love and blessings to our little prince! 👑'}]);
  const [wishText, setWishText] = useState('');
  const [wishName, setWishName] = useState('');
  const [rsvp, setRsvp] = useState({name:'',phone:'',guests:'1',attending:'yes',message:''});
  const [rsvpSent, setRsvpSent] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(EVENT_DATE).getTime() - Date.now());
      setTimeLeft({days:String(Math.floor(diff/86400000)).padStart(2,'0'),hours:String(Math.floor(diff/3600000)%24).padStart(2,'0'),minutes:String(Math.floor(diff/60000)%60).padStart(2,'0'),seconds:String(Math.floor(diff/1000)%60).padStart(2,'0')});
    };
    tick(); const timer = setInterval(tick,1000); return () => clearInterval(timer);
  }, []);

  const jump = (id) => { setMenu(false); document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); };
  const share = async () => {
    const data = {title:"Krishiv Turns One!",text:"You're invited to celebrate Krishiv's first birthday!",url:window.location.href};
    if (navigator.share) { try { await navigator.share(data); } catch(e){} }
    else { try { await navigator.clipboard.writeText(window.location.href); alert('Invitation link copied!'); } catch(e) { alert(window.location.href); } }
  };
  const submitWish = (e) => { e.preventDefault(); if(!wishText.trim()) return; setWishes([{name:wishName.trim()||'A well-wisher',text:wishText.trim()},...wishes]); setWishName(''); setWishText(''); };
  const submitRsvp = (e) => { e.preventDefault(); setRsvpSent(true); };

  return <div className="app-shell">
    {!opened ? <motion.div className="envelope-screen" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="stars" aria-hidden="true">{Array.from({length:22},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*23)%76}%`,animationDelay:`${(i%6)*.35}s`}}>✦</i>)}</div>
      <div className="moon-glow" />
      <div className="envelope-content">
        <Crown className="gold-crown" size={32} />
        <p className="eyebrow light">A SPECIAL INVITATION</p>
        <h1>Our Little Prince<br/><em>Krishiv</em></h1>
        <p className="intro-light">is turning one</p>
        <motion.div className="envelope-card" whileHover={{y:-5,rotate:-1}} transition={{type:'spring',stiffness:180}}>
          <div className="seal"><Crown size={22}/></div>
          <span>With love,</span><strong>Krishiv's Family</strong>
          <div className="envelope-flap" />
        </motion.div>
        <p className="tap-hint">A little magic is waiting inside</p>
        <button className="button gold-button" onClick={()=>setOpened(true)}>Open invitation <Sparkles size={17}/></button>
      </div>
      <div className="cloud cloud-left"/><div className="cloud cloud-right"/>
      <p className="bottom-note">ONE YEAR OF LOVE, LAUGHTER & LITTLE MIRACLES</p>
    </motion.div> :
    <AnimatePresence mode="wait">
      <motion.div className="site" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
        <header className="topbar">
          <button className="icon-btn" aria-label="Open menu" onClick={()=>setMenu(true)}><Menu/></button>
          <a className="brand" href="#home" onClick={e=>{e.preventDefault();jump('home')}}><Crown size={20}/> Krishiv <span>Turns One</span></a>
          <button className={`icon-btn ${music?'active':''}`} aria-label="Toggle music" onClick={()=>setMusic(!music)}><Music2/></button>
        </header>
        <section className="hero section" id="home">
          <div className="hero-sparkles">✦　✧　✦</div>
          <div className="hero-copy">
            <span className="eyebrow"><Crown size={15}/> OUR LITTLE PRINCE</span>
            <h1>Krishiv<br/><span>turns</span> <b>ONE</b></h1>
            <p>A year of love, laughter<br/>and little adventures.</p>
            <button className="button primary-button" onClick={()=>jump('invitation')}>You're invited <ChevronDown size={17}/></button>
          </div>
          <div className="hero-art">
            <div className="halo"/><div className="castle">🏰</div>
            <div className="balloon balloon-a">🎈</div><div className="balloon balloon-b">🎈</div>
            <div className="photo-frame"><img src={babyPhoto} alt="Baby photo placeholder for Krishiv"/><div className="photo-crown">♛</div></div>
            <div className="teddy">🧸</div><div className="gift">🎁</div>
          </div>
          <div className="hero-bottom">A tiny hand, a year so grand <span>✦</span></div>
        </section>
        <section className="section invitation-section" id="invitation">
          <SectionHeading overline="A NOTE FROM OUR FAMILY" title="You are cordially invited" text="To celebrate one whole year of tiny hands, big smiles, and endless happiness."/>
          <div className="invite-card">
            <div className="ornament">✦　♛　✦</div><h3>Krishiv</h3><p className="script-line">is turning ONE!</p>
            <p className="body-copy">We would be delighted to celebrate this special milestone with you and your family.</p>
            <div className="detail-row"><CalendarDays/><div><small>DATE</small><strong>{EVENT_LABEL}</strong></div></div>
            <div className="detail-row"><Clock3/><div><small>TIME</small><strong>{EVENT_TIME}</strong></div></div>
            <div className="detail-row"><MapPin/><div><small>VENUE</small><strong>{VENUE}</strong></div></div>
            <div className="ornament bottom-ornament">✦　✦　✦</div>
          </div>
        </section>
        <section className="section countdown-section" id="countdown">
          <SectionHeading overline="THE BIG DAY IS COMING" title="Countdown to the celebration" text="We can't wait to celebrate with you!"/>
          <div className="countdown-grid">{[['days','Days'],['hours','Hours'],['minutes','Minutes'],['seconds','Seconds']].map(([key,label])=><div className="time-card" key={key}><strong>{timeLeft[key]}</strong><span>{label}</span></div>)}</div>
          <p className="countdown-quote">“Big things often have small beginnings.”<br/>Our little prince's big day is almost here!</p>
        </section>
        <section className="section gallery-section" id="memories">
          <SectionHeading overline="LITTLE MOMENTS, BIG MEMORIES" title="Krishiv's first-year memories" text="A little collection of the moments that made our hearts grow."/>
          <div className="gallery-grid">{gallery.map((src,i)=><button className={`gallery-item gallery-${i+1}`} key={src+i} onClick={()=>setLightbox(src)} aria-label={`View memory ${i+1}`}><img src={src} alt={`Memory ${i+1} placeholder`}/><span>✦</span></button>)}</div>
          <p className="small-note">Replace these sample images with your own baby photos before publishing.</p>
        </section>
        <section className="section details-section" id="details">
          <SectionHeading overline="SAVE THE DATE" title="Event details" text="Everything you need to join our little celebration."/>
          <div className="details-panel">
            <div className="detail-row"><CalendarDays/><div><small>DATE</small><strong>{EVENT_LABEL}</strong></div></div>
            <div className="detail-row"><Clock3/><div><small>TIME</small><strong>{EVENT_TIME}</strong></div></div>
            <div className="detail-row"><MapPin/><div><small>VENUE</small><strong>{VENUE}</strong></div></div>
            <div className="map-preview"><div className="map-lines"/><span className="map-pin"><MapPin size={27}/></span><div className="map-label">Birthday celebration<br/><small>Jagtial, Telangana</small></div></div>
            <a className="button primary-button full-button" href={MAPS_URL} target="_blank" rel="noreferrer"><Navigation size={17}/> Get directions</a>
            <button className="button outline-button full-button" onClick={()=>{const d=new Date(EVENT_DATE);const end=new Date(d.getTime()+2*60*60*1000);const fmt=x=>x.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Krishiv's 1st Birthday")}&dates=${fmt(d)}/${fmt(end)}&details=${encodeURIComponent("Come celebrate Krishiv's first birthday!")}&location=${encodeURIComponent(VENUE)}`;window.open(url,'_blank')}}><CalendarDays size={17}/> Add to calendar</button>
          </div>
        </section>
        <section className="section rsvp-section" id="rsvp">
          <SectionHeading overline="YOUR PRESENCE IS OUR PRESENT" title="Will you join us?" text="Please let us know if you'll be part of Krishiv's special day."/>
          {rsvpSent ? <div className="success-card"><CheckCircle2 size={42}/><h3>Thank you!</h3><p>Your RSVP has been prepared. Please contact the family to confirm it was received.</p><button className="button primary-button" onClick={()=>setRsvpSent(false)}>Edit response</button></div> :
          <form className="form-card" onSubmit={submitRsvp}>
            <label>Your name <em>*</em><input required value={rsvp.name} onChange={e=>setRsvp({...rsvp,name:e.target.value})} placeholder="Enter your name"/></label>
            <label>Mobile number (optional)<input type="tel" value={rsvp.phone} onChange={e=>setRsvp({...rsvp,phone:e.target.value})} placeholder="Enter mobile number"/></label>
            <label>Number of guests<select value={rsvp.guests} onChange={e=>setRsvp({...rsvp,guests:e.target.value})}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>)}</select></label>
            <div className="radio-group"><span>Will you attend?</span><label><input type="radio" name="attending" checked={rsvp.attending==='yes'} onChange={()=>setRsvp({...rsvp,attending:'yes'})}/> Yes, we'll be there! 🎉</label><label><input type="radio" name="attending" checked={rsvp.attending==='no'} onChange={()=>setRsvp({...rsvp,attending:'no'})}/> Sorry, we can't make it.</label></div>
            <label>Message for Krishiv (optional)<textarea rows="3" value={rsvp.message} onChange={e=>setRsvp({...rsvp,message:e.target.value})} placeholder="Your loving message..."/></label>
            <button className="button primary-button full-button" type="submit"><Heart size={17} fill="currentColor"/> Confirm attendance</button>
            <p className="small-note">Demo form: responses are not saved or sent to the family yet.</p>
          </form>}
        </section>
        <section className="section wishes-section" id="wishes">
          <SectionHeading overline="SEND A LITTLE LOVE" title="Birthday wishes for Krishiv" text="Leave a special message for our little one!"/>
          <form className="wish-form" onSubmit={submitWish}><input value={wishName} onChange={e=>setWishName(e.target.value)} placeholder="Your name (optional)"/><textarea required rows="3" value={wishText} onChange={e=>setWishText(e.target.value)} placeholder="Write your wishes..."/><button className="button primary-button full-button"><Send size={16}/> Send a wish</button></form>
          <div className="wish-list">{wishes.map((w,i)=><article className="wish-card" key={i}><div className="wish-heart"><Heart size={17} fill="currentColor"/></div><p>{w.text}</p><small>— {w.name}</small></article>)}</div>
        </section>
        <section className="final-section">
          <div className="final-stars">✦ ✧ ✦ ✧ ✦</div><Crown size={36} className="gold-crown"/><p className="eyebrow light">ONE LITTLE STAR, ONE BIG CELEBRATION</p><h2>Thank you for being<br/>part of our journey</h2><div className="big-one">1</div><p>With love,</p><h3>Krishiv & Family 💙</h3><button className="button gold-button" onClick={share}><Share2 size={17}/> Share invitation</button>
        </section>
        <footer>Made with <Heart size={13} fill="currentColor"/> for Krishiv's first birthday</footer>
      </motion.div>
    </AnimatePresence>}
    <AnimatePresence>{menu&&<motion.div className="menu-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="menu-panel" initial={{x:-40}} animate={{x:0}} exit={{x:-40}}><button className="close-btn" onClick={()=>setMenu(false)}><X/></button><Crown className="gold-crown"/><h2>Krishiv</h2><p className="menu-sub">Our Little Prince</p>{[['home','Home'],['invitation','Invitation'],['memories','Memories'],['details','Event details'],['rsvp','RSVP'],['wishes','Birthday wishes']].map(([id,label])=><button className="menu-link" key={id} onClick={()=>jump(id)}><span>✦</span>{label}</button>)}<button className="menu-link" onClick={()=>setMusic(!music)}><Volume2/>{music?'Music toggle: on':'Background music: off'}</button><p className="small-note">Music control is a visual demo until an audio file is added.</p></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{lightbox&&<motion.div className="lightbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(null)}><button className="lightbox-close"><X/></button><motion.img src={lightbox} alt="Selected memory" initial={{scale:.9}} animate={{scale:1}}/></motion.div>}</AnimatePresence>
  </div>;
}

function SectionHeading({overline,title,text}) { return <div className="section-heading"><span className="eyebrow"><Sparkles size={13}/>{overline}</span><h2>{title}</h2>{text&&<p>{text}</p>}<div className="divider">✦ ───── ✦</div></div> }

createRoot(document.getElementById('root')).render(<App/>);
