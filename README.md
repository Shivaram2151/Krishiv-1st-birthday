# Krishiv Turns One: Birthday Invitation Website

A royal blue and champagne-gold animated invitation for Krishiv's first birthday. It is built for phones first. Guests open an envelope, see the invitation and a live countdown, browse photos, get directions, add the event to their calendar, RSVP and leave birthday wishes.

- **Frontend:** React 18, Vite, Framer Motion, Lucide icons and plain CSS (`/`)
- **Backend:** Node.js, Express, Prisma and PostgreSQL (`/server`). It stores RSVPs and wishes and includes a private organizer dashboard.

---

## 1. Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/
npm run preview      # preview the production build
```

The site runs without the backend. In that case the RSVP and Wishes forms display a **DEMO** label and say clearly that nothing was sent or saved.

## 2. Add the event details (one file)

Edit **`src/data/eventConfig.js`**. Leave a field as `""` until it is confirmed. The site shows "To be announced" for that field and keeps the feature that depends on it switched off.

| Field | Example | Unlocks |
|---|---|---|
| `birthdayDate` | `"2026-12-15"` | Countdown, calendar, dates on the page |
| `birthdayTime` / `endTime` | `"11:00"` / `"15:00"` | Countdown, calendar |
| `timezone` / `utcOffset` | `"Asia/Kolkata"` / `"+05:30"` | Correct times for guests in any timezone |
| `venueName`, `venueAddress` | | Directions, embedded map, copy address |
| `mapsUrl` or `coordinates` | Google Maps share link or `{ lat, lng }` | Exact pin for directions (recommended) |
| `parkingInfo`, `landmarks`, `dressCode`, `organizerContact` | | Optional cards and lines |
| `publicUrl` | `"https://krishiv.example.com"` | Link used by Share Invitation |

## 3. Add real photos and music

- **Portrait:** put the photo at `public/assets/baby/krishiv.webp`, then set `portrait.src: "/assets/baby/krishiv.webp"`.
- **Gallery:** put photos in `public/assets/gallery/` and set each item's `src` in `gallery` (you can add more items). Items without a photo show a placeholder.
- **Videos (optional):** add `{ src, poster, title }` entries to `videos`. A Photos/Videos switch appears automatically.
- **Music (optional):** add a licensed instrumental track to `public/assets/audio/` and set `musicUrl`. The music toggle only appears when this is set. Music starts only after the guest taps "Tap to Open" and never plays on its own before that.
- Use WebP or JPEG files about 1200 px on the longest side and under 300 KB each.
- To restyle the illustrations, replace the files in `public/assets/decorations` and `public/assets/castle`, keeping the same names. Their paths are listed in `src/data/assets.js`.

## 4. Turn on RSVPs and wishes (backend)

```bash
cd server
cp .env.example .env         # fill in DATABASE_URL, ADMIN_TOKEN, ALLOWED_ORIGINS
npm install                  # also runs `prisma generate`
npm run db:deploy            # creates the tables (or `npm run db:migrate` during development)
npm run dev                  # http://localhost:4000
```

Then in the project root:

```bash
cp .env.example .env         # set VITE_API_BASE_URL=http://localhost:4000
npm run dev
```

**What gets stored:**

- **RSVPs:** name, phone (optional), number of guests, attending, message and timestamps.
- **Wishes:** name, message, approval status and timestamps.

**Privacy and safety:**

- RSVPs are never public. Only the organizer can see them.
- Wishes stay hidden until the organizer approves them, unless `AUTO_APPROVE_WISHES=true`.
- Guests can edit their own RSVP from the same device. This uses a private edit token, which the database stores only as a hash.
- All input is validated on the server and the request size is limited.
- Each IP address is limited to 30 submissions every 15 minutes.
- Only sites listed in `ALLOWED_ORIGINS` can call the API.
- Repeated identical wishes are saved once.
- User text is always displayed as plain text, never as HTML.
- The CSV export is protected against spreadsheet formula injection.

**Organizer dashboard:** open `https://<your-api>/admin` and enter your `ADMIN_TOKEN`. From there you can:

- see the RSVP totals
- download the RSVPs as a CSV file
- approve, unpublish or delete wishes

**Admin API** (send `Authorization: Bearer <ADMIN_TOKEN>`):

- `GET /api/admin/rsvps`
- `GET /api/admin/rsvps.csv`
- `GET /api/admin/wishes?status=pending|approved|all`
- `PATCH /api/admin/wishes/:id` with body `{ "approved": true }`
- `DELETE /api/admin/wishes/:id`
- `DELETE /api/admin/rsvps/:id`

> Never commit `.env` files. Only `VITE_*` variables reach the browser, and the frontend needs only the public API URL.

## 5. Deploy

**Database:** any managed PostgreSQL works, for example Neon, Supabase, Railway or Render. Copy its connection string into `DATABASE_URL`.

**Backend (Render, Railway, Fly and similar):**

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install && npm run db:deploy` |
| Start command | `npm start` |

Set these environment variables: `DATABASE_URL`, `ADMIN_TOKEN`, `ALLOWED_ORIGINS=https://<your-site>`, `TRUST_PROXY=1`.

**Frontend (Vercel or Netlify):**

- Import the repository. `vercel.json` and `netlify.toml` are already set up.
- Set `VITE_API_BASE_URL=https://<your-api>`.
- Redeploy after changing any `VITE_*` variable.

**After deploying:**

- Set `publicUrl` in `eventConfig.js`.
- In `index.html`, replace `/og-image.jpg` with the full URL, e.g. `https://<your-site>/og-image.jpg`. WhatsApp and Facebook previews need a full URL.

## 6. Project structure

```
public/assets/{baby,gallery,decorations,castle,audio}   replaceable images and audio
public/og-image.jpg, favicon.svg, apple-touch-icon.png   sharing and icons
src/data/eventConfig.js    ← all event details, photos and music
src/data/assets.js         decoration image paths
src/components/            EnvelopeOpening, HeroSection, BirthdayInvitation, Countdown,
                           PhotoGallery, EventDetails, RSVPForm, BirthdayWishes, VenueMap,
                           FinalSection, Navbar, NavigationMenu (+ shared helpers)
src/services/api.js        API client (demo mode when no API URL is set)
src/utils/                 dates, calendar (.ics / Google), maps, validation
src/styles/                global, animations, envelope, sections, responsive
server/                    Express API, Prisma schema and migrations, organizer dashboard
```

## 7. Accessibility and performance

- Respects the "reduce motion" setting. With it on, the envelope opens instantly and the guest continues with one tap, and ambient effects are turned off.
- Menu, lightbox and envelope keep keyboard focus inside them and close with Esc.
- Visible focus rings, labelled form fields, error messages placed next to each field, and buttons at least 44 px tall.
- Animations use only transform and opacity. Low-powered devices get fewer particles.
- Images load lazily and are given fixed dimensions so the page doesn't jump while loading.
- Supports safe areas on notched phones. No horizontal scrolling from 360 px up to desktop, in portrait or landscape.
