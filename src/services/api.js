/**
 * Small API client for the RSVP + wishes backend (see /server).
 *
 * Set VITE_API_BASE_URL in .env (e.g. https://krishiv-api.onrender.com).
 * When it is empty the site runs in clearly-labelled DEMO mode: nothing is
 * sent anywhere and the UI says so.
 */
const BASE = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const isBackendConfigured = BASE.length > 0;

export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, { method = 'GET', body, headers, timeout = 15000 } = {}) {
  if (!isBackendConfigured) throw new ApiError('The response service is not configured yet.', { status: 0 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'The request took too long. Please check your connection and try again.'
        : 'Could not reach the server. Please check your connection and try again.',
      { status: 0 },
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    throw new ApiError(data?.error || 'Something went wrong. Please try again.', {
      status: res.status,
      fields: data?.fields,
    });
  }
  return data;
}

/* ── RSVP ─────────────────────────────────────────────────── */
export const submitRsvp = (payload) => request('/api/rsvp', { method: 'POST', body: payload });

export const updateRsvp = (id, editToken, payload) =>
  request(`/api/rsvp/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: payload,
    headers: { 'X-Edit-Token': editToken },
  });

/* ── Wishes ───────────────────────────────────────────────── */
export const fetchWishes = () => request('/api/wishes');
export const submitWish = (payload) => request('/api/wishes', { method: 'POST', body: payload });
