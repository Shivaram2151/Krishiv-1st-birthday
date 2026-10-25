import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, CheckCircle2, FlaskConical, HeartHandshake, PartyPopper, PencilLine, Send, Heart } from 'lucide-react';
import { eventConfig } from '../data/eventConfig';
import { assets } from '../data/assets';
import { isBackendConfigured, submitRsvp, updateRsvp } from '../services/api';
import { LIMITS, normalizePhone, storage, validateLength, validateName, validatePhone } from '../utils/validation';
import SectionHeading from './SectionHeading';
import { Decor } from './Ambient';

const STORE_KEY = 'krishiv-rsvp-v1';
const empty = { name: '', phone: '', guests: '1', attending: '', message: '' };

function validate(v) {
  const e = {};
  const n = validateName(v.name);
  if (n) e.name = n;
  const p = validatePhone(v.phone);
  if (p) e.phone = p;
  if (!v.attending) e.attending = 'Please let us know if you can make it.';
  if (v.attending === 'yes') {
    const g = Number(v.guests);
    if (!Number.isInteger(g) || g < 1 || g > eventConfig.maxGuestsPerRsvp) e.guests = 'Please choose the number of guests.';
  }
  const m = validateLength(v.message, LIMITS.message);
  if (m) e.message = m;
  return e;
}

function FieldError({ id, msg }) {
  if (!msg) return null;
  return (
    <p className="field-error" id={id}>
      <AlertCircle aria-hidden="true" /> {msg}
    </p>
  );
}

/** Screen 8 — RSVP form (stored by the backend, or clearly-labelled demo). */
export default function RSVPForm() {
  const saved = useRef(storage.get(STORE_KEY));
  const [values, setValues] = useState(() => ({ ...empty, ...(saved.current?.data || {}) }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState(saved.current && isBackendConfigured ? 'success' : 'idle'); // idle | submitting | success | demo
  const [serverError, setServerError] = useState('');
  const [record, setRecord] = useState(saved.current);
  const formRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if ((status === 'success' || status === 'demo') && resultRef.current) resultRef.current.focus({ preventScroll: false });
  }, [status]);

  const set = (key) => (e) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key] || errors[key]) setErrors(validate(next));
  };
  const blur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return; // guard against double taps
    setServerError('');
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, phone: true, attending: true, guests: true, message: true });
    if (Object.keys(errs).length) {
      const first = formRef.current?.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }

    const payload = {
      name: values.name.trim(),
      phone: normalizePhone(values.phone) || null,
      attending: values.attending === 'yes',
      guests: values.attending === 'yes' ? Number(values.guests) : 0,
      message: values.message.trim() || null,
    };

    if (!isBackendConfigured) {
      setStatus('demo');
      return;
    }

    setStatus('submitting');
    try {
      const res = record?.id && record?.editToken
        ? await updateRsvp(record.id, record.editToken, payload)
        : await submitRsvp(payload);
      const rec = { id: res.id, editToken: res.editToken || record?.editToken, data: values, savedAt: res.updatedAt || new Date().toISOString() };
      storage.set(STORE_KEY, rec);
      setRecord(rec);
      setStatus('success');
    } catch (err) {
      if (err.status === 404 || err.status === 403) {
        // Stored edit link no longer valid — submit as a fresh response next time.
        storage.remove(STORE_KEY);
        setRecord(null);
      }
      setServerError(err.message);
      if (err.fields) setErrors((x) => ({ ...x, ...err.fields }));
      setStatus('idle');
    }
  };

  const edit = () => {
    setStatus('idle');
    setTimeout(() => formRef.current?.querySelector('input')?.focus(), 50);
  };

  const attendingYes = values.attending === 'yes';
  const submitting = status === 'submitting';
  const showResult = status === 'success' || status === 'demo';

  return (
    <section id="rsvp" className="section section--sky rsvp" aria-labelledby="rsvp-title">
      <Decor src={assets.balloonBlue} className="rsvp-balloon anim-sway" />
      <Decor src={assets.giftGold} className="rsvp-gift" />
      <div className="container container--narrow">
        <SectionHeading
          id="rsvp-title"
          eyebrow="Kindly Respond"
          title="Will You Join Us?"
          subtitle={`Please let us know if you'll be part of ${eventConfig.childName}'s special day.`}
        />

        <div className="rsvp-card card">
          <AnimatePresence mode="wait" initial={false}>
            {showResult ? (
              <motion.div
                key="result"
                ref={resultRef}
                tabIndex={-1}
                className="rsvp-result"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                role="status"
              >
                {status === 'success' ? (
                  <>
                    <motion.span
                      className="result-icon"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 14 }}
                    >
                      <CheckCircle2 aria-hidden="true" />
                    </motion.span>
                    <h3>Thank You!</h3>
                    <p>Your response means a lot to our family.</p>
                    {record?.data && (
                      <p className="result-summary">
                        {record.data.attending === 'yes'
                          ? `We've noted ${record.data.guests} ${Number(record.data.guests) === 1 ? 'guest' : 'guests'} for ${record.data.name}.`
                          : `We'll miss you, ${record.data.name}. Thank you for letting us know.`}
                      </p>
                    )}
                    <button type="button" className="btn btn-outline btn-sm" onClick={edit}>
                      <PencilLine aria-hidden="true" /> Edit my response
                    </button>
                  </>
                ) : (
                  <>
                    <span className="result-icon result-icon--demo">
                      <FlaskConical aria-hidden="true" />
                    </span>
                    <h3>Demo preview</h3>
                    <p>
                      Your form was filled in correctly, but <strong>this response was not sent</strong> — the RSVP
                      service hasn&rsquo;t been connected yet.
                    </p>
                    {eventConfig.organizerContact && (
                      <p className="result-summary">
                        Please confirm directly with the family:{' '}
                        <a href={`tel:${eventConfig.organizerContact.replace(/[^\d+]/g, '')}`}>{eventConfig.organizerContact}</a>
                      </p>
                    )}
                    <button type="button" className="btn btn-outline btn-sm" onClick={edit}>
                      <PencilLine aria-hidden="true" /> Back to the form
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                className="form"
                onSubmit={onSubmit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                aria-describedby={!isBackendConfigured ? 'rsvp-demo' : undefined}
              >
                {!isBackendConfigured && (
                  <p className="notice notice--demo" id="rsvp-demo">
                    <FlaskConical aria-hidden="true" />
                    <span>
                      <span className="badge badge--demo">DEMO</span> RSVP isn&rsquo;t connected yet — responses are{' '}
                      <strong>not sent</strong>.
                    </span>
                  </p>
                )}
                {record && isBackendConfigured && (
                  <p className="notice notice--info">
                    <PencilLine aria-hidden="true" /> You&rsquo;re updating the response you sent earlier.
                  </p>
                )}

                <div className="field">
                  <label htmlFor="rsvp-name">
                    Full name<span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="rsvp-name"
                    className="input"
                    type="text"
                    autoComplete="name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    maxLength={LIMITS.name}
                    value={values.name}
                    onChange={set('name')}
                    onBlur={blur('name')}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(touched.name && errors.name)}
                    aria-describedby={touched.name && errors.name ? 'err-name' : undefined}
                  />
                  <FieldError id="err-name" msg={touched.name && errors.name} />
                </div>

                <fieldset className="choices field" aria-describedby={touched.attending && errors.attending ? 'err-att' : undefined}>
                  <legend>
                    Will you attend?<span className="req" aria-hidden="true">*</span>
                  </legend>
                  {[
                    { value: 'yes', label: 'Yes, we\u2019ll be there!', icon: PartyPopper, tone: 'yes' },
                    { value: 'no', label: 'Sorry, we can\u2019t make it.', icon: HeartHandshake, tone: 'no' },
                  ].map(({ value, label, icon: Icon, tone }) => (
                    <label key={value} className={`attend-tile attend-tile--${tone}`}>
                      <input
                        type="radio"
                        name="attending"
                        value={value}
                        checked={values.attending === value}
                        onChange={set('attending')}
                        aria-invalid={Boolean(touched.attending && errors.attending)}
                      />
                      <span className="attend-check" aria-hidden="true">
                        <Check />
                      </span>
                      <span className="attend-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="attend-label">{label}</span>
                    </label>
                  ))}
                  <FieldError id="err-att" msg={touched.attending && errors.attending} />
                </fieldset>

                <div className={`field-row ${attendingYes ? 'has-guests' : ''}`}>
                <div className="field">
                  <label htmlFor="rsvp-phone">
                    Mobile number<span className="opt">(optional, private)</span>
                  </label>
                  <input
                    id="rsvp-phone"
                    className="input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    placeholder="+91 98765 43210"
                    maxLength={20}
                    value={values.phone}
                    onChange={set('phone')}
                    onBlur={blur('phone')}
                    aria-invalid={Boolean(touched.phone && errors.phone)}
                    aria-describedby={touched.phone && errors.phone ? 'err-phone' : undefined}
                  />
                  <FieldError id="err-phone" msg={touched.phone && errors.phone} />
                </div>

                {/* No exit animation: the row drops to one column instantly, so a fading-out
                    guests field would wrap below the phone input before vanishing. */}
                {attendingYes && (
                    <motion.div
                      className="field"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label htmlFor="rsvp-guests">Guests</label>
                      <select
                        id="rsvp-guests"
                        className="select"
                        value={values.guests}
                        onChange={set('guests')}
                        aria-invalid={Boolean(touched.guests && errors.guests)}
                        aria-describedby={touched.guests && errors.guests ? 'err-guests' : undefined}
                      >
                        {Array.from({ length: eventConfig.maxGuestsPerRsvp }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={String(n)}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <FieldError id="err-guests" msg={touched.guests && errors.guests} />
                    </motion.div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="rsvp-message">
                    A message for {eventConfig.childName}
                    <span className="opt">(optional)</span>
                  </label>
                  <textarea
                    id="rsvp-message"
                    className="textarea"
                    rows={2}
                    maxLength={LIMITS.message}
                    value={values.message}
                    onChange={set('message')}
                    onBlur={blur('message')}
                    aria-invalid={Boolean(touched.message && errors.message)}
                    aria-describedby={touched.message && errors.message ? 'err-message' : undefined}
                  />
                  <FieldError id="err-message" msg={touched.message && errors.message} />
                </div>

                {serverError && (
                  <p className="notice notice--error" role="alert">
                    <AlertCircle aria-hidden="true" /> {serverError}
                  </p>
                )}

                <button type="submit" className="btn btn-gold btn-block" disabled={submitting} aria-busy={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Sending…
                    </>
                  ) : (
                    <>
                      {record && isBackendConfigured ? <Send aria-hidden="true" /> : <Heart aria-hidden="true" />}
                      {record && isBackendConfigured ? 'Update Response' : 'Confirm Attendance'}
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
