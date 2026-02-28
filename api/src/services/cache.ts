/**
 * In-memory cache with TTL.
 *
 * Designed as a drop-in-replaceable interface: swap this for an ioredis client
 * in production by implementing the same get/set/del/delPattern methods.
 *
 * Production swap:
 *   import Redis from 'ioredis';
 *   export const cache = new Redis(process.env.REDIS_URL);
 *   // ioredis supports get/set/del natively; add delPattern via SCAN.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, Entry<unknown>>();
  private readonly cleanup: NodeJS.Timeout;

  constructor() {
    // Prune expired entries every 60 s to avoid unbounded memory growth
    this.cleanup = setInterval(() => {
      const now = Date.now();
      for (const [k, e] of this.store) {
        if (now > e.expiresAt) this.store.delete(k);
      }
    }, 60_000).unref(); // unref so the timer doesn't keep the process alive
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.value as T;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  /** Delete all keys that start with the given prefix. */
  delPattern(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

export const cache = new MemoryCache();

/** TTL constants (milliseconds). */
export const TTL = {
  /** Live conversation data — refresh often. */
  INTERCOM_SHORT: 30_000,
  /** Slow-changing data: workspace info, teams, admin lists. */
  INTERCOM_LONG: 300_000,
  /** OAuth state nonce — expire after 10 minutes. */
  OAUTH_STATE: 600_000,
} as const;
