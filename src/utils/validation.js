export const LIMITS = { name: 80, message: 500, wish: 400 };

export const normalizePhone = (v) => (v || '').replace(/[\s\-().]/g, '');

export function validateName(v) {
  const s = (v || '').trim();
  if (!s) return 'Please enter your full name.';
  if (s.length < 2) return 'Name looks too short.';
  if (s.length > LIMITS.name) return `Please keep your name under ${LIMITS.name} characters.`;
  return null;
}

export function validatePhone(v) {
  const s = normalizePhone(v);
  if (!s) return null; // optional
  if (!/^\+?\d{10,15}$/.test(s)) return 'Please enter a valid mobile number (10–15 digits, e.g. +91 98765 43210).';
  return null;
}

export function validateLength(v, max, label = 'Message') {
  if ((v || '').trim().length > max) return `${label} must be under ${max} characters.`;
  return null;
}

/** Tiny safe localStorage wrapper (private mode / blocked storage safe). */
export const storage = {
  get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
