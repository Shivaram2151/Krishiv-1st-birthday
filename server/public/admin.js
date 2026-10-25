/* Organizer dashboard — vanilla JS. All user content is inserted with textContent (never innerHTML). */
(() => {
  const $ = (id) => document.getElementById(id);
  let token = sessionStorage.getItem('krishiv-admin') || '';
  let tab = 'rsvps';

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
    const res = await fetch(`/api/admin${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    if (res.status === 401) throw Object.assign(new Error('Invalid admin token.'), { auth: true });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return res.status === 204 ? null : res;
  }

  const fmt = (d) => new Date(d).toLocaleString();
  const showError = (id, msg) => {
    $(id).textContent = msg;
    $(id).classList.toggle('hidden', !msg);
  };

  async function loadRsvps() {
    const data = await (await api('/rsvps')).json();
    const s = data.summary;
    $('stats').replaceChildren(
      ...[
        ['Responses', s.responses],
        ['Attending', s.attendingResponses],
        ['Declined', s.declined],
        ['Total guests', s.totalGuests],
      ].map(([k, v]) => el('div', { class: 'stat' }, el('b', {}, String(v)), k)),
    );
    $('rsvp-rows').replaceChildren(
      ...data.rsvps.map((r) =>
        el(
          'tr',
          {},
          el('td', {}, r.name),
          el('td', {}, el('span', { class: `pill ${r.attending ? 'yes' : 'no'}` }, r.attending ? 'Attending' : 'Declined')),
          el('td', {}, String(r.guests)),
          el('td', {}, r.phone ? el('a', { href: `tel:${r.phone}` }, r.phone) : '—'),
          el('td', {}, r.message || '—'),
          el('td', { class: 'muted' }, fmt(r.updatedAt)),
          el('td', {}, el('button', { class: 'danger', type: 'button', onclick: () => removeRsvp(r) }, 'Delete')),
        ),
      ),
    );
    $('rsvp-empty').classList.toggle('hidden', data.rsvps.length > 0);
  }

  async function removeRsvp(r) {
    if (!window.confirm(`Delete the RSVP from ${r.name}? This cannot be undone.`)) return;
    await run(() => api(`/rsvps/${encodeURIComponent(r.id)}`, { method: 'DELETE' }).then(loadRsvps));
  }

  async function loadWishes(status) {
    const { wishes } = await (await api(`/wishes?status=${status}`)).json();
    $('wish-list').replaceChildren(
      ...wishes.map((w) =>
        el(
          'div',
          { class: 'wish' },
          el('p', {}, w.message),
          el('p', { class: 'muted' }, `— ${w.name} · ${fmt(w.createdAt)}`),
          el(
            'div',
            { class: 'row' },
            w.approved
              ? el('button', { class: 'ghost', type: 'button', onclick: () => setApproved(w, false) }, 'Unpublish')
              : el('button', { class: 'primary', type: 'button', onclick: () => setApproved(w, true) }, 'Approve & publish'),
            el('button', { class: 'danger', type: 'button', onclick: () => removeWish(w) }, 'Delete'),
          ),
        ),
      ),
    );
    $('wish-empty').classList.toggle('hidden', wishes.length > 0);
  }

  const setApproved = (w, approved) =>
    run(() => api(`/wishes/${encodeURIComponent(w.id)}`, { method: 'PATCH', body: JSON.stringify({ approved }) }).then(render));

  const removeWish = (w) => {
    if (!window.confirm('Delete this wish permanently?')) return;
    run(() => api(`/wishes/${encodeURIComponent(w.id)}`, { method: 'DELETE' }).then(render));
  };

  async function run(fn) {
    showError('dash-error', '');
    try {
      await fn();
    } catch (e) {
      if (e.auth) return lock(e.message);
      showError('dash-error', e.message);
    }
  }

  function render() {
    document.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $('tab-rsvps').classList.toggle('hidden', tab !== 'rsvps');
    $('tab-wishes').classList.toggle('hidden', tab === 'rsvps');
    return run(() => (tab === 'rsvps' ? loadRsvps() : loadWishes(tab)));
  }

  function lock(msg = '') {
    token = '';
    sessionStorage.removeItem('krishiv-admin');
    $('dash').classList.add('hidden');
    $('login').classList.remove('hidden');
    showError('login-error', msg);
  }

  async function unlock() {
    try {
      await api('/rsvps');
      sessionStorage.setItem('krishiv-admin', token);
      $('login').classList.add('hidden');
      $('dash').classList.remove('hidden');
      showError('login-error', '');
      render();
    } catch (e) {
      lock(e.message);
    }
  }

  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    token = $('token').value.trim();
    unlock();
  });
  $('logout').addEventListener('click', () => lock());
  $('refresh').addEventListener('click', render);
  document.querySelectorAll('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab;
      render();
    }),
  );
  $('csv').addEventListener('click', () =>
    run(async () => {
      const res = await api('/rsvps.csv');
      const blob = await res.blob();
      const a = el('a', { href: URL.createObjectURL(blob), download: 'krishiv-rsvps.csv' });
      document.body.append(a);
      a.click();
      a.remove();
    }),
  );

  if (token) unlock();
})();
