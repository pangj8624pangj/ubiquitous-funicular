import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Users, Clock, RefreshCw, AlertTriangle, ExternalLink, Zap } from 'lucide-react';
import {
  intercomService,
  type IntercomAdmin,
  type IntercomConversation,
} from '../services/intercom';
import { authService } from '../services/auth';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSeconds(s: number | null | undefined): string {
  if (!s || s <= 0) return '—';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${(s / 3600).toFixed(1)}h`;
}

function relativeTime(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface LiveData {
  workspaceName: string;
  adminName: string;
  admins: IntercomAdmin[];
  conversations: IntercomConversation[];
  totalConversations: number;
  fetchedAt: Date;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IntercomLive() {
  const [data, setData]       = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [pollActive, setPollActive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [meRes, adminsRes, convRes] = await Promise.all([
        intercomService.getMe(),
        intercomService.getAdmins(),
        intercomService.getConversations({ per_page: '50' }),
      ]);

      setData({
        workspaceName:      meRes.app?.name ?? 'Intercom Workspace',
        adminName:          meRes.name,
        admins:             adminsRes.admins ?? [],
        conversations:      convRes.conversations ?? [],
        totalConversations: convRes.pages?.total_count ?? (convRes.conversations?.length ?? 0),
        fetchedAt:          new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Intercom data');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Webhook event polling (5 s) ──────────────────────────────────────────────
  // Polls /api/events/poll for new webhook events. When the server reports new
  // events, triggers an immediate fetchData() so the dashboard reflects them.
  // Works on Vercel (short-lived requests) and local dev alike.

  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    const apiBase = import.meta.env.VITE_API_URL ?? '';
    let sinceTs = 0;
    let active = true;

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch(`${apiBase}/api/events/poll?since=${sinceTs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { events, timestamp } = await res.json() as { events: unknown[]; timestamp: number };
          setPollActive(true);
          if (events.length > 0) void fetchData();
          sinceTs = timestamp;
        }
      } catch {
        setPollActive(false);
      }
      if (active) setTimeout(poll, 5_000);
    };

    void poll();
    return () => { active = false; setPollActive(false); };
  }, [fetchData]);

  // ── Baseline refresh (30 s) ──────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="card p-6 flex items-center justify-center gap-3">
        <RefreshCw size={16} className="text-blue-400 animate-spin" />
        <span className="text-gray-400 text-sm">Loading Intercom data…</span>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="card p-5 flex items-start gap-3 border-amber-500/20 bg-amber-500/5">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 text-sm font-medium">Intercom sync error</p>
          <p className="text-gray-500 text-xs mt-0.5">{error}</p>
          <button onClick={fetchData} className="btn-secondary text-xs h-7 px-2.5 mt-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ── Derived metrics ─────────────────────────────────────────────────────────

  const openConvs  = data.conversations.filter(c => c.state === 'open');
  const unassigned = openConvs.filter(c => !c.admin_assignee_id);
  const snoozed    = data.conversations.filter(c => c.state === 'snoozed');

  const replyTimes = data.conversations
    .map(c => c.statistics?.time_to_admin_reply_in_seconds)
    .filter((t): t is number => typeof t === 'number' && t > 0);
  const avgReplyTime = replyTimes.length
    ? Math.round(replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length)
    : null;

  const workloadMap: Record<string, number> = {};
  openConvs.forEach(c => {
    if (c.admin_assignee_id) {
      workloadMap[c.admin_assignee_id] = (workloadMap[c.admin_assignee_id] ?? 0) + 1;
    }
  });
  const adminsWithLoad = data.admins
    .filter(a => a.has_inbox_seat)
    .map(a => ({ ...a, openCount: workloadMap[a.id] ?? 0 }))
    .sort((a, b) => b.openCount - a.openCount)
    .slice(0, 8);

  const recentConvs = data.conversations.slice(0, 8);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              {data.workspaceName}
              <span className="badge-green">
                <span className="live-dot" />
                Live
              </span>
              {pollActive && (
                <span className="badge-blue text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block mr-1" />
                  Polling
                </span>
              )}
            </h3>
            <p className="text-gray-500 text-xs">
              Connected as {data.adminName} · synced{' '}
              {relativeTime(Math.floor(data.fetchedAt.getTime() / 1000))}
              {pollActive ? ' · polling 5s' : ' · polling 30s'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-secondary text-xs h-7 px-2.5">
            <RefreshCw size={11} />
            Refresh
          </button>
          <a
            href="https://app.intercom.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs h-7 px-2.5"
          >
            <ExternalLink size={11} />
            Open Intercom
          </a>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Conversations', value: openConvs.length,        Icon: MessageCircle, color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Unassigned',         value: unassigned.length,       Icon: Users,         color: unassigned.length > 5 ? 'text-red-400' : 'text-amber-400', bg: unassigned.length > 5 ? 'bg-red-500/10' : 'bg-amber-500/10' },
          { label: 'Snoozed',            value: snoozed.length,          Icon: Clock,         color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Avg First Reply',    value: fmtSeconds(avgReplyTime), Icon: Zap,           color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="metric-card border border-[#2a2d3e]">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon size={16} className={color} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Two-column: recent conversations + agent workload */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent conversations */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a2d3e]">
            <span className="text-white font-semibold text-sm">Recent Conversations</span>
            <span className="text-gray-500 text-xs">{data.totalConversations} total</span>
          </div>
          {recentConvs.length === 0 ? (
            <p className="text-gray-500 text-sm p-6 text-center">No conversations found</p>
          ) : (
            <div className="divide-y divide-[#2a2d3e]">
              {recentConvs.map(conv => {
                const contact = conv.contacts?.contacts?.[0];
                const contactLabel = contact?.name ?? contact?.email ?? `#${conv.id}`;
                const assignedAdmin = data.admins.find(a => a.id === conv.admin_assignee_id);
                return (
                  <div key={conv.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#1e2130] transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      conv.state === 'open' ? 'bg-blue-500' : conv.state === 'snoozed' ? 'bg-purple-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-200 text-xs font-medium truncate">{contactLabel}</span>
                        <span className="text-gray-600 text-[10px] flex-shrink-0">{relativeTime(conv.updated_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-medium capitalize ${
                          conv.state === 'open' ? 'text-blue-400' : conv.state === 'snoozed' ? 'text-purple-400' : 'text-gray-500'
                        }`}>
                          {conv.state}
                        </span>
                        {assignedAdmin
                          ? <span className="text-gray-600 text-[10px]">→ {assignedAdmin.name}</span>
                          : <span className="text-amber-500 text-[10px]">unassigned</span>
                        }
                        {conv.source?.delivered_as && (
                          <span className="text-gray-600 text-[10px]">· {conv.source.delivered_as}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Agent workload */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a2d3e]">
            <span className="text-white font-semibold text-sm">Agent Workload</span>
            <span className="text-gray-500 text-xs">
              {data.admins.filter(a => a.has_inbox_seat).length} inbox seats
            </span>
          </div>
          {adminsWithLoad.length === 0 ? (
            <p className="text-gray-500 text-sm p-6 text-center">No admins found</p>
          ) : (
            <div className="divide-y divide-[#2a2d3e]">
              {adminsWithLoad.map(admin => (
                <div key={admin.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 bg-blue-600/20 border border-blue-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-400 flex-shrink-0">
                    {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 text-xs font-medium truncate">{admin.name}</div>
                    <div className="text-gray-600 text-[10px] truncate">{admin.email}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {admin.away_mode_enabled
                      ? <span className="badge-yellow">Away</span>
                      : <span className="badge-green">Online</span>
                    }
                    <span className={`text-xs font-semibold tabular-nums ${
                      admin.openCount > 10 ? 'text-red-400' : admin.openCount > 5 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {admin.openCount} open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
