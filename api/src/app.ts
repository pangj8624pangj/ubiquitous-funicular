import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

import { authRouter }    from './routes/auth';
import { intercomRouter } from './routes/intercom';
import { webhooksRouter } from './routes/webhooks';
import { requireAuth }   from './middleware/auth';
import { sse }           from './services/sse';
import { WebhookEvents } from './db';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

const app = express();

// ── Webhook route: parse raw body first so we can verify HMAC signatures ──────
app.use('/api/webhooks', (req, _res, next) => {
  let raw = '';
  req.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
  req.on('end', () => {
    try { req.body = JSON.parse(raw || '{}'); } catch { req.body = {}; }
    next();
  });
});

// ── Standard middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/intercom', intercomRouter);
app.use('/api/webhooks', webhooksRouter);

// GET /api/events — SSE stream (local dev only; Vercel serverless will time out)
app.get('/api/events', requireAuth, (req, res) => {
  sse.add(randomUUID(), req.user!.userId, res);
});

// GET /api/events/poll — short-polling endpoint (works on Vercel and locally)
// Query: since=<unix epoch seconds> — only returns events newer than this value
app.get('/api/events/poll', requireAuth, (req, res) => {
  const since = req.query.since ? parseInt(req.query.since as string, 10) : 0;
  const events = WebhookEvents.recent(req.user!.userId, 50);
  const filtered = since > 0 ? events.filter(e => e.received_at > since) : events;
  res.json({ events: filtered, timestamp: Math.floor(Date.now() / 1000) });
});

// GET /api/health — public
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

export default app;
