import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

import { authRouter }     from './routes/auth';
import { intercomRouter } from './routes/intercom';
import { webhooksRouter } from './routes/webhooks';
import { requireAuth }    from './middleware/auth';
import { sse }            from './services/sse';

const PORT         = parseInt(process.env.PORT ?? '3001', 10);
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
app.use('/api/auth',      authRouter);
app.use('/api/intercom',  intercomRouter);
app.use('/api/webhooks',  webhooksRouter);

// GET /api/events — authenticated SSE stream
// Uses ?token= query param because EventSource cannot set Authorization headers
app.get('/api/events', requireAuth, (req, res) => {
  sse.add(randomUUID(), req.user!.userId, res);
});

// GET /api/health — public, used by the setup wizard to detect server presence
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), sseClients: sse.activeCount });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const env = process.env.NODE_ENV ?? 'development';
  console.log(`PulseOps API  [${env}]  port ${PORT}`);
  if (env === 'development') {
    console.log('  Auth:     POST /api/auth/register  |  POST /api/auth/login');
    console.log('  Intercom: GET  /api/intercom/status');
    console.log('  Webhooks: POST /api/webhooks/intercom');
    console.log('  SSE:      GET  /api/events?token=<jwt>');
    console.log('  Health:   GET  /api/health');
  }
});
