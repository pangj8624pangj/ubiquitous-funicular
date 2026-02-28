// ── Intercom REST API types ───────────────────────────────────────────────────

export interface IntercomMe {
  id: string;
  name: string;
  email: string;
  app: { name: string; id_code: string; created_at: number };
}

export interface IntercomAdmin {
  id: string;
  type: string;
  name: string;
  email: string;
  job_title?: string;
  away_mode_enabled: boolean;
  away_mode_reassign: boolean;
  has_inbox_seat: boolean;
  avatar?: { image_url: string };
}

export interface IntercomTeam {
  id: string;
  type: string;
  name: string;
  admin_ids: string[];
}

export interface IntercomConversation {
  id: string;
  type: string;
  created_at: number;
  updated_at: number;
  state: 'open' | 'closed' | 'snoozed';
  read: boolean;
  admin_assignee_id: string | null;
  team_assignee_id: string | null;
  source?: {
    type: string;
    author: { id: string; name: string; type: string };
    delivered_as?: string;
    subject?: string;
  };
  contacts?: {
    contacts: Array<{ id: string; name?: string; email?: string }>;
  };
  statistics?: {
    time_to_assignment_in_seconds?: number | null;
    time_to_admin_reply_in_seconds?: number | null;
    time_to_first_close_in_seconds?: number | null;
    first_contact_reply_at?: number | null;
    first_admin_reply_at?: number | null;
    last_contact_reply_at?: number | null;
    last_admin_reply_at?: number | null;
  } | null;
}

export interface IntercomConversationsResponse {
  type: string;
  conversations: IntercomConversation[];
  pages: {
    type: string;
    page: number;
    per_page: number;
    total_count: number;
  };
}

export interface IntercomAdminsResponse {
  type: string;
  admins: IntercomAdmin[];
}

export interface IntercomTeamsResponse {
  type: string;
  teams: IntercomTeam[];
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

const PROXY = '/api/intercom';

async function proxyGet<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const qs = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  const res = await fetch(`${PROXY}/proxy/${endpoint}${qs}`);

  if (res.status === 401) {
    throw new Error('Not authenticated – connect Intercom in Settings first');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Intercom API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Public service ────────────────────────────────────────────────────────────

export const intercomService = {
  /** Store a Personal Access Token on the proxy server. */
  async setToken(token: string): Promise<void> {
    const res = await fetch(`${PROXY}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token }),
    });
    if (!res.ok) throw new Error('Failed to store token on proxy server');
  },

  /** Returns true if the proxy server is running AND has a stored token. */
  async getStatus(): Promise<boolean> {
    try {
      const res = await fetch(`${PROXY}/status`, {
        signal: AbortSignal.timeout(1500),
      });
      if (!res.ok) return false;
      const d = await res.json() as { connected: boolean };
      return d.connected;
    } catch {
      return false;
    }
  },

  /** Returns true if the proxy server process is reachable at all. */
  async isServerReachable(): Promise<boolean> {
    try {
      const res = await fetch(`${PROXY}/status`, {
        signal: AbortSignal.timeout(1500),
      });
      return res.status < 500;
    } catch {
      return false;
    }
  },

  /** Clear the stored token. */
  async disconnect(): Promise<void> {
    await fetch(`${PROXY}/auth`, { method: 'DELETE' });
  },

  // ── Data endpoints ──────────────────────────────────────────────────────────

  getMe: () =>
    proxyGet<IntercomMe>('me'),

  getAdmins: () =>
    proxyGet<IntercomAdminsResponse>('admins'),

  getTeams: () =>
    proxyGet<IntercomTeamsResponse>('admins/teams'),

  getConversations: (params: Record<string, string> = {}) =>
    proxyGet<IntercomConversationsResponse>('conversations', {
      per_page: '50',
      ...params,
    }),
};
