import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, FlaskConical, Heart, Hourglass, RefreshCw, Send } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { fetchWishes, isBackendConfigured, submitWish } from '../services/api';
import { LIMITS, storage, validateLength, validateName } from '../utils/validation';
import SectionHeading from './SectionHeading';
import { Decor } from './Ambient';

const SENT_KEY = 'krishiv-wishes-sent-v1';

function WishCard({ wish, i, pending = false }) {
  return (
    <motion.li
      className={`wish-card ${pending ? 'is-pending' : ''}`}
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="wish-heart" aria-hidden="true">
        <Heart />
      </span>
      {/* Rendered as text by React — user content is never injected as HTML. */}
      <p className="wish-text">{wish.message}</p>
      <p className="wish-from">— {wish.name}</p>
      {pending && (
        <p className="wish-pending">
          <Hourglass aria-hidden="true" /> Awaiting the family&rsquo;s approval
        </p>
      )}
    </motion.li>
  );
}

/** Screen 9 — birthday wishes (moderated before public display). */
export default function BirthdayWishes() {
  const [wishes, setWishes] = useState([]);
  const [loadState, setLoadState] = useState(isBackendConfigured ? 'loading' : 'idle'); // loading | idle | error
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | demo
  const [serverError, setServerError] = useState('');
  const [mine, setMine] = useState(() => storage.get(SENT_KEY) || []);
  const lastSent = useRef('');

  const load = async () => {
    if (!isBackendConfigured) return;
    setLoadState('loading');
    try {
      const data = await fetchWishes();
      setWishes(Array.isArray(data?.wishes) ? data.wishes : []);
      setLoadState('idle');
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validate = () => {
    const e = {};
    const n = validateName(name);
    if (n) e.name = n;
    if (!message.trim()) e.message = 'Please write a wish for Krishiv.';
    else if (message.trim().length < 2) e.message = 'Your wish looks a little short.';
    else {
      const l = validateLength(message, LIMITS.wish, 'Wish');
      if (l) e.message = l;
    }
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(errs.name ? 'wish-name' : 'wish-message')?.focus();
      return;
    }
    const fingerprint = `${name.trim().toLowerCase()}|${message.trim().toLowerCase()}`;
    if (fingerprint === lastSent.current) {
      setServerError('This wish has already been sent. Thank you!');
      return;
    }
    if (!isBackendConfigured) {
      setStatus('demo');
      return;
    }
    setStatus('sending');
    try {
      const res = await submitWish({ name: name.trim(), message: message.trim() });
      lastSent.current = fingerprint;
      const entry = { id: res.id, name: name.trim(), message: message.trim(), approved: Boolean(res.approved) };
      if (res.approved) {
        setWishes((w) => [entry, ...w.filter((x) => x.id !== entry.id)]);
      } else {
        const next = [entry, ...mine.filter((x) => x.id !== entry.id)].slice(0, 5);
        setMine(next);
        storage.set(SENT_KEY, next);
      }
      setMessage('');
      setStatus('sent');
    } catch (err) {
      setServerError(err.message);
      if (err.fields) setErrors(err.fields);
      setStatus('idle');
    }
  };

  // Hide locally-remembered pending wishes once they have been approved & appear publicly.
  const publicIds = new Set(wishes.map((w) => w.id));
  const myPending = mine.filter((w) => !publicIds.has(w.id));

  return (
    <section id="wishes" className="section section--white wishes" aria-labelledby="wishes-title">
      <Decor src={assets.teddy} className="wishes-teddy anim-float-slow" />
      <div className="container">
        <SectionHeading
          id="wishes-title"
          eyebrow="From Your Heart"
          title={`Birthday Wishes for ${eventConfig.childName}`}
          subtitle="Leave a special message for our little one!"
        />

        <div className="wishes-layout">
          <form className="wish-form card form" onSubmit={onSubmit} noValidate>
            {!isBackendConfigured && (
              <p className="notice notice--demo">
                <FlaskConical aria-hidden="true" />
                <span>
                  <span className="badge badge--demo">DEMO</span> Wishes aren&rsquo;t connected yet — they are{' '}
                  <strong>not saved</strong>.
                </span>
              </p>
            )}
            <div className="field">
              <label htmlFor="wish-name">
                Your name<span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="wish-name"
                className="input"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                maxLength={LIMITS.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'err-wname' : undefined}
              />
              {errors.name && (
                <p className="field-error" id="err-wname">
                  <AlertCircle aria-hidden="true" /> {errors.name}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="wish-message">
                Your birthday wish<span className="req" aria-hidden="true">*</span>
              </label>
              <textarea
                id="wish-message"
                className="textarea"
                rows={3}
                maxLength={LIMITS.wish}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status === 'sent' || status === 'demo') setStatus('idle');
                }}
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={`${errors.message ? 'err-wmsg ' : ''}count-wish`}
              />
              <span className="char-count" id="count-wish">
                {message.length}/{LIMITS.wish}
              </span>
              {errors.message && (
                <p className="field-error" id="err-wmsg">
                  <AlertCircle aria-hidden="true" /> {errors.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="notice notice--error" role="alert">
                <AlertCircle aria-hidden="true" /> {serverError}
              </p>
            )}

            <AnimatePresence>
              {status === 'sent' && (
                <motion.p
                  className="notice notice--info"
                  role="status"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Heart aria-hidden="true" /> Thank you! Your wish was sent and will appear here once the family approves
                  it.
                </motion.p>
              )}
              {status === 'demo' && (
                <motion.p
                  className="notice notice--demo"
                  role="status"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FlaskConical aria-hidden="true" /> Demo preview — your wish looks lovely, but it was not sent or saved.
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-blue btn-block" disabled={status === 'sending'} aria-busy={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Sending…
                </>
              ) : (
                <>
                  <Send aria-hidden="true" /> Send Wish
                </>
              )}
            </button>
          </form>

          <div className="wish-wall" aria-live="polite">
            {loadState === 'loading' && (
              <ul className="wish-list" aria-label="Loading wishes">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="wish-card skeleton" aria-hidden="true" />
                ))}
              </ul>
            )}
            {loadState === 'error' && (
              <div className="wish-empty">
                <p>We couldn&rsquo;t load the wishes right now.</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={load}>
                  <RefreshCw aria-hidden="true" /> Try again
                </button>
              </div>
            )}
            {loadState === 'idle' && (
              <>
                {myPending.length > 0 || wishes.length > 0 ? (
                  <ul className="wish-list">
                    {myPending.map((w, i) => (
                      <WishCard key={`p-${w.id}`} wish={w} i={i} pending />
                    ))}
                    {wishes.map((w, i) => (
                      <WishCard key={w.id} wish={w} i={i} />
                    ))}
                  </ul>
                ) : (
                  <div className="wish-empty">
                    <img src={assets.crown} alt="" aria-hidden="true" width="56" height="42" />
                    <p>
                      {isBackendConfigured
                        ? `Be the first to send ${eventConfig.childName} a birthday wish!`
                        : 'Approved birthday wishes will appear here once wish storage is connected.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
