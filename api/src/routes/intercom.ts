import { Router } from 'express';
import https from 'https';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth';
import { Workspaces } from '../db';
import { cache, TTL } from '../services/cache';

export const intercomRouter = Router();

const INTERCOM_VERSION = '2.10';
const CLIENT_ID     = process.env.INTERCOM_CLIENT_ID;
const CLIENT_SECRET = process.env.INTERCOM_CLIENT_SECRET;
const REDIRECT_URI  = process.env.OAUTH_REDIRECT_URI ?? 'http://localhost:3001/api/intercom/oauth/callback';
const FRONTEND_URL  = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Make an authenticated GET request to api.intercom.io. */
function intercomGet(token: string, path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.intercom.io',
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Intercom-Version': INTERCOM_VERSION,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk: string) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode ?? 200, body }));
      },
    );
    req.on('error', reject);
    req.end();
  });
}

/** Verify a token by calling /me and return workspace info. */
async function verifyAndFetchMe(token: string) {
  const { status, body } = await intercomGet(token, '/me');
  if (status === 401) throw new Error('Intercom rejected this token — check it is valid and not revoked');
  if (status !== 200) throw new Error(`Intercom returned status ${status}`);
  return JSON.parse(body) as { name?: string; app?: { name?: string; id_code?: string } };
}

// ── OAuth flow ────────────────────────────────────────────────────────────────

// GET /api/intercom/oauth/start  → redirect browser to Intercom consent page
intercomRouter.get('/oauth/start', requireAuth, (req, res) => {
  if (!CLIENT_ID) {
    return res.status(501).json({
      error: 'INTERCOM_CLIENT_ID not set — register an OAuth app in the Intercom Developer Hub first',
    });
  }
  const state = randomUUID();
  cache.set(`oauth:${state}`, req.user!.userId, TTL.OAUTH_STATE);
  const url = `https://app.intercom.com/oauth?client_id=${CLIENT_ID}&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(url);
});

// GET /api/intercom/oauth/callback  ← Intercom redirects here after consent
intercomRouter.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state) return res.status(400).send('Missing code or state parameter');

  const userId = cache.get<string>(`oauth:${state}`);
  if (!userId) return res.status(400).send('OAuth state expired or invalid — please try again');
  cache.del(`oauth:${state}`);

  try {
    const tokenRes = await fetch('https://api.intercom.io/auth/eagle/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) throw new Error(tokenData.error ?? 'No access token returned');

    const me = await verifyAndFetchMe(tokenData.access_token);

    Workspaces.upsert(userId, {
      intercom_access_token:    tokenData.access_token,
      intercom_workspace_name:  me.app?.name ?? 'Intercom',
      intercom_admin_name:      me.name ?? 'Unknown',
      intercom_workspace_id:    me.app?.id_code ?? null,
      connected_at:             Math.floor(Date.now() / 1000),
    });

    res.redirect(`${FRONTEND_URL}?intercom_connected=1`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OAuth exchange failed';
    res.redirect(`${FRONTEND_URL}?intercom_error=${encodeURIComponent(msg)}`);
  }
});

// ── Personal Access Token flow ────────────────────────────────────────────────

// POST /api/intercom/auth  { token: string }
intercomRouter.post('/auth', requireAuth, async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token?.trim()) return res.status(400).json({ error: 'token is required' });

  try {
    const me = await verifyAndFetchMe(token.trim());
    Workspaces.upsert(req.user!.userId, {
      intercom_access_token:    token.trim(),
      intercom_workspace_name:  me.app?.name ?? 'Intercom',
      intercom_admin_name:      me.name ?? 'Unknown',
      intercom_workspace_id:    me.app?.id_code ?? null,
      connected_at:             Math.floor(Date.now() / 1000),
    });
    res.json({ workspace: me.app?.name, admin: me.name });
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Token verification failed' });
  }
});

// GET /api/intercom/status
intercomRouter.get('/status', requireAuth, (req, res) => {
  const ws = Workspaces.findByUserId(req.user!.userId);
  if (ws?.intercom_access_token) {
    res.json({ connected: true, workspace: ws.intercom_workspace_name, admin: ws.intercom_admin_name });
  } else {
    res.json({ connected: false });
  }
});

// DELETE /api/intercom/disconnect
intercomRouter.delete('/disconnect', requireAuth, (req, res) => {
  Workspaces.disconnect(req.user!.userId);
  cache.delPattern(`intercom:${req.user!.userId}:`);
  res.json({ ok: true });
});

// ── Authenticated proxy with response caching ─────────────────────────────────

// GET /api/intercom/proxy/*
intercomRouter.get('/proxy/*', requireAuth, async (req, res) => {
  const ws = Workspaces.findByUserId(req.user!.userId);
  if (!ws?.intercom_access_token) {
    return res.status(401).json({ error: 'Intercom not connected for this account' });
  }

  // Reconstruct the full Intercom path including query string
  const tail = (req.params as Record<string, string>)['0'] ?? '';
  const qs   = new URLSearchParams(req.query as Record<string, string>).toString();
  const upstreamPath = `/${tail}${qs ? '?' + qs : ''}`;

  // Serve from cache if available
  const cacheKey = `intercom:${req.user!.userId}:${upstreamPath}`;
  const cached   = cache.get<string>(cacheKey);
  if (cached) {
    return res.status(200).set('Content-Type', 'application/json').set('X-Cache', 'HIT').send(cached);
  }

  try {
    const { status, body } = await intercomGet(ws.intercom_access_token, upstreamPath);

    // Cache successful 2xx responses
    if (status >= 200 && status < 300) {
      const ttl = upstreamPath.includes('conversations') ? TTL.INTERCOM_SHORT : TTL.INTERCOM_LONG;
      cache.set(cacheKey, body, ttl);
    }

    res.status(status).set('Content-Type', 'application/json').set('X-Cache', 'MISS').send(body);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Upstream request failed' });
  }
});
