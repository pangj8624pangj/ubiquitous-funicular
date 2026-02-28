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
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as AuthResponse & { error?: string };
    if (!res.ok) throw new Error(data.error ?? `Registration failed (${res.status})`);
    this.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as AuthResponse & { error?: string };
    if (!res.ok) throw new Error(data.error ?? `Login failed (${res.status})`);
    this.setToken(data.token);
    return data;
  },

  logout(): void {
    this.clearToken();
  },
};
