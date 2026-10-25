import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ── Helpers ─────────────────────────────────────────────── */
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// Strip control characters (keep newlines/tabs) and collapse runs of blank lines.
const clean = (s) =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const nameSchema = z
  .string({ required_error: 'Please enter your name.' })
  .transform(clean)
  .pipe(z.string().min(2, 'Name looks too short.').max(80, 'Name must be under 80 characters.'));

const phoneSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v ? v.replace(/[\s\-().]/g, '') : null))
  .refine((v) => v === null || /^\+?\d{10,15}$/.test(v), 'Please enter a valid mobile number.');

const optionalText = (max) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? clean(v) : null))
    .refine((v) => v === null || v.length <= max, `Must be under ${max} characters.`)
    .transform((v) => v || null);

export function buildSchemas(maxGuests) {
  const rsvp = z
    .object({
      name: nameSchema,
      phone: phoneSchema,
      attending: z.boolean({ required_error: 'Please tell us if you can attend.', invalid_type_error: 'Please tell us if you can attend.' }),
      guests: z.coerce.number().int().min(0).max(maxGuests, `Up to ${maxGuests} guests per response, please.`),
      message: optionalText(500),
    })
    .strict()
    .transform((v) => ({ ...v, guests: v.attending ? Math.max(1, v.guests) : 0 }));

  const wish = z
    .object({
      name: nameSchema,
      message: z
        .string({ required_error: 'Please write a wish.' })
        .transform(clean)
        .pipe(z.string().min(2, 'Your wish looks a little short.').max(400, 'Wish must be under 400 characters.')),
    })
    .strict();

  return { rsvp, wish };
}

function fieldErrors(zerr) {
  const fields = {};
  for (const issue of zerr.issues) {
    const k = issue.path[0] || '_';
    if (!fields[k]) fields[k] = issue.message;
  }
  return fields;
}

const csvCell = (v) => {
  if (v === null || v === undefined) return '';
  let s = String(v);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/* ── App factory ─────────────────────────────────────────── */
export function createApp({ prisma, config }) {
  const {
    adminToken = '',
    allowedOrigins = [],
    autoApproveWishes = false,
    maxGuests = 6,
    trustProxy = 0,
    rateLimitMax = 30,
  } = config;
  const schemas = buildSchemas(maxGuests);
  const app = express();

  app.disable('x-powered-by');
  if (trustProxy) app.set('trust proxy', trustProxy);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    '/api',
    cors({
      origin(origin, cb) {
        // Allow same-origin / server-to-server (no Origin header) and configured sites.
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Edit-Token'],
      maxAge: 86400,
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: rateLimitMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests — please wait a few minutes and try again.' },
  });
  const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false });

  const requireAdmin = (req, res, next) => {
    if (!adminToken || adminToken.length < 16) {
      return res.status(503).json({ error: 'Admin access is not configured (set ADMIN_TOKEN, 16+ characters).' });
    }
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token || !safeEqual(sha256(token), sha256(adminToken))) {
      return res.status(401).json({ error: 'Invalid admin token.' });
    }
    return next();
  };

  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  /* Health */
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  /* ── RSVP (public: create + edit own) ─────────────────── */
  app.post(
    '/api/rsvp',
    writeLimiter,
    wrap(async (req, res) => {
      const parsed = schemas.rsvp.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
      }
      const editToken = crypto.randomBytes(24).toString('base64url');
      const rec = await prisma.rsvp.create({
        data: { ...parsed.data, editTokenHash: sha256(editToken) },
        select: { id: true, updatedAt: true },
      });
      return res.status(201).json({ id: rec.id, editToken, updatedAt: rec.updatedAt });
    }),
  );

  app.put(
    '/api/rsvp/:id',
    writeLimiter,
    wrap(async (req, res) => {
      const token = req.get('x-edit-token') || '';
      const existing = await prisma.rsvp.findUnique({ where: { id: String(req.params.id) }, select: { id: true, editTokenHash: true } });
      if (!existing) return res.status(404).json({ error: 'We could not find your earlier response. Please submit it again.' });
      if (!token || !safeEqual(sha256(token), existing.editTokenHash)) {
        return res.status(403).json({ error: 'This response can only be edited from the device that sent it.' });
      }
      const parsed = schemas.rsvp.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
      }
      const rec = await prisma.rsvp.update({ where: { id: existing.id }, data: parsed.data, select: { id: true, updatedAt: true } });
      return res.json({ id: rec.id, updatedAt: rec.updatedAt });
    }),
  );

  /* ── Wishes (public: list approved + submit) ──────────── */
  app.get(
    '/api/wishes',
    wrap(async (_req, res) => {
      const wishes = await prisma.wish.findMany({
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: { id: true, name: true, message: true, createdAt: true },
      });
      res.set('Cache-Control', 'public, max-age=30');
      return res.json({ wishes });
    }),
  );

  app.post(
    '/api/wishes',
    writeLimiter,
    wrap(async (req, res) => {
      const parsed = schemas.wish.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
      }
      const { name, message } = parsed.data;
      // Duplicate guard: identical wish from the same name within 24h is not stored twice.
      const dupe = await prisma.wish.findFirst({
        where: { name, message, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
        select: { id: true, approved: true },
      });
      if (dupe) return res.status(200).json({ id: dupe.id, approved: dupe.approved, duplicate: true });

      const approved = Boolean(autoApproveWishes);
      const rec = await prisma.wish.create({
        data: { name, message, approved, approvedAt: approved ? new Date() : null },
        select: { id: true, approved: true },
      });
      return res.status(201).json({ id: rec.id, approved: rec.approved });
    }),
  );

  /* ── Admin (organizer only) ───────────────────────────── */
  const admin = express.Router();
  admin.use(adminLimiter, requireAdmin);

  admin.get(
    '/rsvps',
    wrap(async (_req, res) => {
      const rsvps = await prisma.rsvp.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, phone: true, guests: true, attending: true, message: true, createdAt: true, updatedAt: true },
      });
      const attending = rsvps.filter((r) => r.attending);
      res.set('Cache-Control', 'no-store');
      return res.json({
        summary: {
          responses: rsvps.length,
          attendingResponses: attending.length,
          declined: rsvps.length - attending.length,
          totalGuests: attending.reduce((n, r) => n + r.guests, 0),
        },
        rsvps,
      });
    }),
  );

  admin.get(
    '/rsvps.csv',
    wrap(async (_req, res) => {
      const rows = await prisma.rsvp.findMany({ orderBy: { createdAt: 'asc' } });
      const header = ['Name', 'Phone', 'Attending', 'Guests', 'Message', 'Submitted', 'Last updated'];
      const lines = [header.join(',')].concat(
        rows.map((r) =>
          [r.name, r.phone, r.attending ? 'Yes' : 'No', r.guests, r.message, r.createdAt.toISOString(), r.updatedAt.toISOString()]
            .map(csvCell)
            .join(','),
        ),
      );
      res.set('Cache-Control', 'no-store');
      res.attachment('krishiv-rsvps.csv');
      res.type('text/csv; charset=utf-8');
      return res.send(`﻿${lines.join('\r\n')}`);
    }),
  );

  admin.delete(
    '/rsvps/:id',
    wrap(async (req, res) => {
      await prisma.rsvp.delete({ where: { id: String(req.params.id) } });
      return res.status(204).end();
    }),
  );

  admin.get(
    '/wishes',
    wrap(async (req, res) => {
      const status = String(req.query.status || 'pending');
      const where = status === 'all' ? {} : { approved: status === 'approved' };
      const wishes = await prisma.wish.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
      res.set('Cache-Control', 'no-store');
      return res.json({ wishes });
    }),
  );

  admin.patch(
    '/wishes/:id',
    wrap(async (req, res) => {
      const parsed = z.object({ approved: z.boolean() }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Send { "approved": true | false }.' });
      const wish = await prisma.wish.update({
        where: { id: String(req.params.id) },
        data: { approved: parsed.data.approved, approvedAt: parsed.data.approved ? new Date() : null },
      });
      return res.json({ wish });
    }),
  );

  admin.delete(
    '/wishes/:id',
    wrap(async (req, res) => {
      await prisma.wish.delete({ where: { id: String(req.params.id) } });
      return res.status(204).end();
    }),
  );

  app.use('/api/admin', admin);

  /* Organizer dashboard (static page; data still requires the admin token). */
  app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));
  app.get('/admin.js', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.js')));

  /* 404 + errors */
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request body.' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Not found.' });
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong on our side. Please try again shortly.' });
  });

  return app;
}
