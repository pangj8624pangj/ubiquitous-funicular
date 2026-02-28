import { Router } from 'express';
import crypto from 'crypto';
import { Workspaces, WebhookEvents } from '../db';
import { sse } from '../services/sse';
import { cache } from '../services/cache';

export const webhooksRouter = Router();

const WEBHOOK_SECRET = process.env.INTERCOM_WEBHOOK_SECRET;

/**
 * Verify the X-Hub-Signature header Intercom sends with every webhook POST.
 * If INTERCOM_WEBHOOK_SECRET is not configured, verification is skipped
 * (useful during local development).
 */
function verifySignature(rawBody: string, signature: string | undefined): boolean {
  if (!WEBHOOK_SECRET) return true; // skip in dev if secret not set
  if (!signature) return false;
  const expected = `sha1=${crypto.createHmac('sha1', WEBHOOK_SECRET).update(rawBody).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

interface IntercomWebhookPayload {
  type?: string;
  topic?: string;
  app_id?: string;
  data?: { item?: { app_id?: string } };
}

// POST /api/webhooks/intercom
//
// Intercom calls this URL when conversation events occur (open, close, assign…).
// Configure the URL in the Intercom Developer Hub → Webhooks.
// Required topics: conversation.created, conversation.admin.replied,
//                  conversation.admin.assigned, conversation.admin.closed
webhooksRouter.post('/intercom', (req, res) => {
  const rawBody  = JSON.stringify(req.body);
  const signature = req.headers['x-hub-signature'] as string | undefined;

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const payload = req.body as IntercomWebhookPayload;
  const appId   = payload.app_id ?? payload.data?.item?.app_id;

  if (!appId) {
    return res.status(400).json({ error: 'No app_id in webhook payload' });
  }

  // Look up which user owns this Intercom workspace
  const ws = Workspaces.findByIntercomId(appId);
  if (ws) {
    // Persist the event for audit / analytics
    WebhookEvents.insert(ws.user_id, payload.topic ?? 'unknown', payload);

    // Invalidate the conversations cache so the next poll gets fresh data
    cache.delPattern(`intercom:${ws.user_id}:/conversations`);

    // Push an SSE event to any open browser tabs for this user
    // so IntercomLive re-fetches immediately instead of waiting 30s
    sse.broadcast(ws.user_id, 'intercom:event', {
      topic:      payload.topic,
      receivedAt: Date.now(),
    });
  }

  // Always respond 200 quickly so Intercom does not retry
  res.status(200).json({ ok: true });
});
