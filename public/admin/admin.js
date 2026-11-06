/* Organizer dashboard — vanilla JS. All user content is inserted with textContent (never innerHTML). */
(() => {
  // ponytail: static file, cannot read VITE_API_BASE_URL; change here if the API moves.
  const API = 'https://krishiv-1st-birthday.onrender.com';
  const $ = (id) => document.getElementById(id);
  let token = sessionStorage.getItem('krishiv-admin') || '';
  let tab = 'rsvps';
  let items = []; // rows of the current tab, filtered by the search box

  const el = (tag, props = {}, ...children) => {
    const n = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    children.flat().forEach((c) => n.append(c instanceof Node ? c : document.createTextNode(c ?? '')));
    return n;
  };

  async function api(path, opts = {}) {
    let res;
    try {
      res = await fetch(`${API}/api/admin${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
      });
    } catch {
      throw new Error('Could not reach the server. It may be waking up — try again in a minute.');
    }
    if (res.status === 401) throw Object.assign(new Error('Wrong password.'), { auth: true });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return res.status === 204 ? null : res;
  }

  const fmt = (d) =>
    new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const showError = (id, msg) => {
    $(id).textContent = msg;
    $(id).classList.toggle('hidden', !msg);
  };
  let toastTimer;
  const toast = (msg) => {
    $('toast').textContent = msg;
    $('toast').classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 2500);
  };

  /* ── Cards ─────────────────────────────────────────────── */
  const rsvpCard = (r) =>
    el(
      'article',
      { class: 'item' },
      el(
        'div',
        { class: 'item-top' },
        el('h3', {}, r.name),
        el('span', { class: `pill ${r.attending ? 'yes' : 'no'}` }, r.attending ? 'Attending' : 'Declined'),
      ),
      el(
        'div',
        { class: 'meta' },
        r.attending ? el('span', {}, `👥 ${r.guests} guest${r.guests === 1 ? '' : 's'}`) : '',
        r.phone ? el('a', { href: `tel:${r.phone}` }, `📞 ${r.phone}`) : '',
        el('span', {}, fmt(r.updatedAt)),
      ),
      r.message ? el('p', { class: 'msg' }, r.message) : '',
      el(
        'div',
        { class: 'actions' },
        el('button', { class: 'danger sm', type: 'button', onclick: () => removeRsvp(r) }, 'Delete'),
      ),
    );

  const wishCard = (w) =>
    el(
      'article',
      { class: 'item' },
      el(
        'div',
        { class: 'item-top' },
        el('h3', {}, w.name),
        el('span', { class: `pill ${w.approved ? 'yes' : 'wait'}` }, w.approved ? 'Published' : 'Waiting'),
      ),
      el('p', { class: 'msg' }, w.message),
      el('div', { class: 'meta' }, el('span', {}, fmt(w.createdAt))),
      el(
        'div',
        { class: 'actions' },
        w.approved
          ? el('button', { class: 'ghost sm', type: 'button', onclick: () => setApproved(w, false) }, 'Unpublish')
          : el('button', { class: 'primary sm', type: 'button', onclick: () => setApproved(w, true) }, 'Approve'),
        el('button', { class: 'danger sm', type: 'button', onclick: () => removeWish(w) }, 'Delete'),
      ),
    );

  function paint() {
    const q = $('search').value.trim().toLowerCase();
    const shown = q
      ? items.filter((x) => [x.name, x.phone, x.message].some((v) => v && String(v).toLowerCase().includes(q)))
      : items;
    $('list').replaceChildren(...shown.map(tab === 'rsvps' ? rsvpCard : wishCard));
    const emptyText = q
      ? 'No matches.'
      : { rsvps: 'No RSVPs yet.', pending: 'All caught up — no wishes waiting for approval.', approved: 'No published wishes yet.' }[tab];
    $('empty').textContent = emptyText;
    $('empty').classList.toggle('hidden', shown.length > 0);
  }

  /* ── Data ──────────────────────────────────────────────── */
  async function loadStats() {
    const [rs, pend] = await Promise.all([
      api('/rsvps').then((r) => r.json()),
      api('/wishes?status=pending').then((r) => r.json()),
    ]);
    const s = rs.summary;
    $('stats').replaceChildren(
      ...[
        ['Total guests', s.totalGuests, true],
        ['Attending', s.attendingResponses],
        ['Declined', s.declined],
        ['Responses', s.responses],
      ].map(([k, v, hl]) => el('div', { class: `stat${hl ? ' hl' : ''}` }, el('b', {}, String(v)), el('span', {}, k))),
    );
    $('pending-count').textContent = pend.wishes.length ? String(pend.wishes.length) : '';
    return { rsvps: rs.rsvps, pending: pend.wishes };
  }

  async function load() {
    const { rsvps, pending } = await loadStats();
    if (tab === 'rsvps') items = rsvps;
    else if (tab === 'pending') items = pending;
    else items = (await (await api('/wishes?status=approved')).json()).wishes;
    paint();
  }

  /* ── Actions ───────────────────────────────────────────── */
  async function run(fn) {
    showError('dash-error', '');
    $('dash').classList.add('loading');
    try {
      await fn();
    } catch (e) {
      if (e.auth) return lock(e.message);
      showError('dash-error', e.message);
    } finally {
      $('dash').classList.remove('loading');
    }
  }

  const removeRsvp = (r) => {
    if (!window.confirm(`Delete the RSVP from ${r.name}? This cannot be undone.`)) return;
    run(async () => {
      await api(`/rsvps/${encodeURIComponent(r.id)}`, { method: 'DELETE' });
      await load();
      toast('RSVP deleted');
    });
  };

  const setApproved = (w, approved) =>
    run(async () => {
      await api(`/wishes/${encodeURIComponent(w.id)}`, { method: 'PATCH', body: JSON.stringify({ approved }) });
      await load();
      toast(approved ? 'Wish published on the site' : 'Wish hidden from the site');
    });

  const removeWish = (w) => {
    if (!window.confirm('Delete this wish permanently?')) return;
    run(async () => {
      await api(`/wishes/${encodeURIComponent(w.id)}`, { method: 'DELETE' });
      await load();
      toast('Wish deleted');
    });
  };

  function render() {
    document.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $('csv').classList.toggle('hidden', tab !== 'rsvps');
    $('search').value = '';
    return run(load);
  }

  /* ── Login ─────────────────────────────────────────────── */
  function lock(msg = '') {
    token = '';
    sessionStorage.removeItem('krishiv-admin');
    $('dash').classList.add('hidden');
    $('logout').classList.add('hidden');
    $('login').classList.remove('hidden');
    showError('login-error', msg);
  }

  async function unlock() {
    $('login-btn').disabled = true;
    $('login-btn').textContent = 'Opening…';
    try {
      await api('/rsvps');
      sessionStorage.setItem('krishiv-admin', token);
      $('login').classList.add('hidden');
      $('dash').classList.remove('hidden');
      $('logout').classList.remove('hidden');
      showError('login-error', '');
      render();
    } catch (e) {
      lock(e.message);
    } finally {
      $('login-btn').disabled = false;
      $('login-btn').textContent = 'Open dashboard';
    }
  }

  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    token = $('token').value.trim();
    unlock();
  });
  $('logout').addEventListener('click', () => lock());
  $('refresh').addEventListener('click', () => run(async () => { await load(); toast('Updated'); }));
  $('search').addEventListener('input', paint);
  document.querySelectorAll('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab;
      render();
    }),
  );
  $('csv').addEventListener('click', () =>
    run(async () => {
      const blob = await (await api('/rsvps.csv')).blob();
      const a = el('a', { href: URL.createObjectURL(blob), download: 'krishiv-rsvps.csv' });
      document.body.append(a);
      a.click();
      a.remove();
    }),
  );

  if (token) unlock();
})();
