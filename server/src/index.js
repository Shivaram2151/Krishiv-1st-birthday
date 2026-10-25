import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';

const prisma = new PrismaClient();

const config = {
  adminToken: process.env.ADMIN_TOKEN || '',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  autoApproveWishes: process.env.AUTO_APPROVE_WISHES === 'true',
  maxGuests: Number(process.env.MAX_GUESTS_PER_RSVP || 6),
  trustProxy: Number(process.env.TRUST_PROXY || 0),
};

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!config.adminToken || config.adminToken.length < 16) {
  console.warn('⚠  ADMIN_TOKEN is missing or too short — the organizer dashboard will be disabled.');
}

const app = createApp({ prisma, config });
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => {
  console.log(`Krishiv birthday API listening on http://localhost:${port}`);
  console.log(`Organizer dashboard: http://localhost:${port}/admin`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
