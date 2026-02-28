import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import path from 'path';

// On Vercel the filesystem is read-only except /tmp; data is ephemeral across
// cold starts. For persistent storage, swap this for a Vercel Postgres adapter.
const DB_PATH = process.env.DATABASE_PATH ??
  (process.env.NODE_ENV === 'production'
    ? '/tmp/pulseops.db'
    : path.join(__dirname, '..', 'data', 'pulseops.db'));

// Ensure the data directory exists before opening the database
try { mkdirSync(path.dirname(DB_PATH), { recursive: true }); } catch {}

export const db = new Database(DB_PATH);

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT    PRIMARY KEY,
    email       TEXT    UNIQUE NOT NULL,
    password_hash TEXT  NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id                       TEXT PRIMARY KEY,
    user_id                  TEXT NOT NULL UNIQUE,
    intercom_access_token    TEXT,
    intercom_workspace_name  TEXT,
    intercom_admin_name      TEXT,
    intercom_workspace_id    TEXT,
    connected_at             INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_workspaces_intercom_id
    ON workspaces(intercom_workspace_id);

  CREATE TABLE IF NOT EXISTS webhook_events (
    id          TEXT    PRIMARY KEY,
    user_id     TEXT    NOT NULL,
    topic       TEXT    NOT NULL,
    payload     TEXT    NOT NULL,
    received_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_webhook_events_user_received
    ON webhook_events(user_id, received_at DESC);
`);

// ── Typed interfaces ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
}

export interface Workspace {
  id: string;
  user_id: string;
  intercom_access_token: string | null;
  intercom_workspace_name: string | null;
  intercom_admin_name: string | null;
  intercom_workspace_id: string | null;
  connected_at: number | null;
}

export interface WebhookEvent {
  id: string;
  user_id: string;
  topic: string;
  payload: string;
  received_at: number;
}

// ── Repository helpers ────────────────────────────────────────────────────────

export const Users = {
  findByEmail: (email: string) =>
    db.prepare<[string], User>('SELECT * FROM users WHERE email = ?').get(email),

  findById: (id: string) =>
    db.prepare<[string], User>('SELECT * FROM users WHERE id = ?').get(id),

  create: (email: string, passwordHash: string): string => {
    const id = randomUUID();
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(id, email, passwordHash);
    return id;
  },
};

export const Workspaces = {
  findByUserId: (userId: string) =>
    db.prepare<[string], Workspace>('SELECT * FROM workspaces WHERE user_id = ?').get(userId),

  findByIntercomId: (appId: string) =>
    db.prepare<[string], { user_id: string }>('SELECT user_id FROM workspaces WHERE intercom_workspace_id = ?').get(appId),

  upsert: (userId: string, data: Partial<Omit<Workspace, 'id' | 'user_id'>>) => {
    db.prepare(`
      INSERT INTO workspaces (id, user_id, intercom_access_token, intercom_workspace_name, intercom_admin_name, intercom_workspace_id, connected_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        intercom_access_token   = excluded.intercom_access_token,
        intercom_workspace_name = excluded.intercom_workspace_name,
        intercom_admin_name     = excluded.intercom_admin_name,
        intercom_workspace_id   = excluded.intercom_workspace_id,
        connected_at            = excluded.connected_at
    `).run(
      randomUUID(), userId,
      data.intercom_access_token   ?? null,
      data.intercom_workspace_name ?? null,
      data.intercom_admin_name     ?? null,
      data.intercom_workspace_id   ?? null,
      data.connected_at            ?? null,
    );
  },

  disconnect: (userId: string) => {
    db.prepare('UPDATE workspaces SET intercom_access_token = NULL, connected_at = NULL WHERE user_id = ?').run(userId);
  },
};

export const WebhookEvents = {
  insert: (userId: string, topic: string, payload: unknown): string => {
    const id = randomUUID();
    db.prepare('INSERT INTO webhook_events (id, user_id, topic, payload) VALUES (?, ?, ?, ?)').run(
      id, userId, topic, JSON.stringify(payload),
    );
    return id;
  },

  recent: (userId: string, limit = 50) =>
    db.prepare<[string, number], WebhookEvent>(
      'SELECT * FROM webhook_events WHERE user_id = ? ORDER BY received_at DESC LIMIT ?',
    ).all(userId, limit),
};
