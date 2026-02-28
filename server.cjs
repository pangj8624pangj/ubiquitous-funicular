/**
 * PulseOps – Intercom proxy server
 *
 * Runs alongside the Vite dev server so that browser-side code can call
 * Intercom's REST API without hitting CORS restrictions.  The Vite config
 * forwards every /api/* request here.
 *
 * Usage:
 *   npm run server          # proxy only
 *   npm run dev:full        # proxy + Vite together (via concurrently)
 */

const https = require('https');
const express = require('express');

const app = express();
app.use(express.json());

// Allow the Vite dev server origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Token store (in-memory; survives restarts via the localStorage flag on
//    the frontend but the server needs a fresh token after restart) ──────────
let accessToken = null;

// POST /api/intercom/auth  { access_token: "..." }
app.post('/api/intercom/auth', (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: 'access_token required' });
  accessToken = access_token;
  console.log('[Intercom] Token stored successfully.');
  res.json({ ok: true });
});

// GET /api/intercom/status
app.get('/api/intercom/status', (req, res) => {
  res.json({ connected: !!accessToken });
});

// DELETE /api/intercom/auth
app.delete('/api/intercom/auth', (req, res) => {
  accessToken = null;
  console.log('[Intercom] Token cleared.');
  res.json({ ok: true });
});

// ── Generic Intercom REST proxy ───────────────────────────────────────────────
// Mounts at /api/intercom/proxy – req.url is relative to that mount point
// e.g. GET /api/intercom/proxy/conversations?per_page=50
//   → GET https://api.intercom.io/conversations?per_page=50
app.use('/api/intercom/proxy', (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET is supported via proxy' });
  }
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated – store a token via POST /api/intercom/auth' });
  }

  // req.url is already relative to the mount point and includes the querystring
  const fullPath = req.url; // e.g. /conversations?per_page=50
  console.log(`[Intercom] → GET ${fullPath}`);

  const options = {
    hostname: 'api.intercom.io',
    path: fullPath,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Intercom-Version': '2.10',
    },
  };

  const intercomReq = https.request(options, (intercomRes) => {
    let data = '';
    intercomRes.on('data', (chunk) => { data += chunk; });
    intercomRes.on('end', () => {
      res
        .status(intercomRes.statusCode)
        .set('Content-Type', 'application/json')
        .send(data);
    });
  });

  intercomReq.on('error', (err) => {
    console.error('[Intercom] Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  });

  intercomReq.end();
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nPulseOps proxy server listening on :${PORT}`);
  console.log('Open http://localhost:5173 → Settings → Integrations → Intercom → Connect\n');
});
