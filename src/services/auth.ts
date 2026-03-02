/** Base URL for API calls. Empty string in dev (Vite proxies /api → port 3001). */
const API = import.meta.env.VITE_API_URL ?? '';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'pulseops_token';
const MOCK_USERS_KEY = 'pulseops_mock_users';

// ── Mock auth (used when the API server is not available, e.g. GitHub Pages) ──

type MockUsers = Record<string, { id: string; passwordHash: string }>;

function mockUsers(): MockUsers {
  try { return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) ?? '{}'); } catch { return {}; }
}

function saveMockUsers(u: MockUsers) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(u));
}

/** Minimal hash — good enough for a client-side demo, not for production. */
async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function makeMockToken(id: string, email: string): string {
  const header  = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ userId: id, email, iat: Date.now() / 1000 | 0, exp: (Date.now() / 1000 | 0) + 604800 }));
  return `${header}.${payload}.mock`;
}

async function mockRegister(email: string, password: string): Promise<AuthResponse> {
  const users = mockUsers();
  if (users[email]) throw new Error('An account with this email already exists');
  const id = crypto.randomUUID();
  users[email] = { id, passwordHash: await hashPassword(password) };
  saveMockUsers(users);
  const token = makeMockToken(id, email);
  return { token, user: { id, email } };
}

async function mockLogin(email: string, password: string): Promise<AuthResponse> {
  const users = mockUsers();
  const record = users[email];
  if (!record) throw new Error('No account found with this email');
  if (record.passwordHash !== await hashPassword(password)) throw new Error('Incorrect password');
  const token = makeMockToken(record.id, email);
  return { token, user: { id: record.id, email } };
}

// ── Real API helpers ───────────────────────────────────────────────────────────

/** Parse response JSON, with a fallback when the API is unreachable. */
async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Unexpected server response');
  }
}

/** Returns true if the API is available (i.e. not a static-only host). */
async function apiReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/health`, { method: 'GET' });
    const text = await res.text();
    return !text.trimStart().startsWith('<');
  } catch {
    return false;
  }
}

// ── Public service ─────────────────────────────────────────────────────────────

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /** Returns true when a non-expired JWT is stored. */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  /** Decode the stored token and return basic user info — no network call. */
  getUserFromToken(): AuthUser | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { userId: string; email: string; exp: number };
      if (payload.exp * 1000 <= Date.now()) return null;
      return { id: payload.userId, email: payload.email };
    } catch {
      return null;
    }
  },

  /** Attach the stored Bearer token to a headers object. */
  authHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    if (!await apiReachable()) {
      const data = await mockRegister(email, password);
      this.setToken(data.token);
      return data;
    }
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJson<AuthResponse & { error?: string }>(res);
    if (!res.ok) throw new Error(data.error ?? `Registration failed (${res.status})`);
    this.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!await apiReachable()) {
      const data = await mockLogin(email, password);
      this.setToken(data.token);
      return data;
    }
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJson<AuthResponse & { error?: string }>(res);
    if (!res.ok) throw new Error(data.error ?? `Login failed (${res.status})`);
    this.setToken(data.token);
    return data;
  },

  logout(): void {
    this.clearToken();
  },
};
