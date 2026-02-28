import type { Response } from 'express';

interface SSEClient {
  userId: string;
  res: Response;
}

/**
 * Server-Sent Events manager.
 *
 * Clients connect to GET /api/events?token=<jwt>.
 * When an Intercom webhook fires, the handler calls sse.broadcast(userId, ...)
 * which immediately pushes the event to every browser tab open for that user.
 *
 * Production upgrade: replace with Redis pub/sub so multiple API replicas can
 * all deliver events to their own connected clients.
 */
class SSEManager {
  private clients = new Map<string, SSEClient>();

  /**
   * Register a new SSE connection.
   * Automatically removes itself on socket close.
   */
  add(clientId: string, userId: string, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    res.flushHeaders();

    this.clients.set(clientId, { userId, res });
    this._send(clientId, 'connected', { clientId });

    // 30-second heartbeat keeps proxies from closing idle connections
    const heartbeat = setInterval(() => {
      if (this.clients.has(clientId)) {
        res.write(': heartbeat\n\n');
      } else {
        clearInterval(heartbeat);
      }
    }, 30_000);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(clientId);
    });
  }

  /** Send an event to a single client by ID. */
  private _send(clientId: string, event: string, data: unknown): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  /** Broadcast an event to ALL connected clients belonging to a user. */
  broadcast(userId: string, event: string, data: unknown): void {
    for (const [clientId, client] of this.clients) {
      if (client.userId === userId) this._send(clientId, event, data);
    }
  }

  get activeCount(): number {
    return this.clients.size;
  }
}

export const sse = new SSEManager();
