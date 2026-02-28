import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, AlertTriangle, Users, X, Check } from 'lucide-react';
import MetricCardComponent from '../components/UI/MetricCard';
import StatusBadge from '../components/UI/StatusBadge';
import IntercomLive from '../components/IntercomLive';
import { intercomService } from '../services/intercom';
import { metrics, forecastData, slaMetrics, teams, agents, channelDistribution } from '../data/mockData';
import type { RiskLevel, AgentStatus } from '../types';

const riskColor: Record<RiskLevel, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
  critical: 'text-red-600',
};

const riskBg: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/10 border-emerald-500/20',
  medium: 'bg-amber-500/10 border-amber-500/20',
  high: 'bg-red-500/10 border-red-500/20',
  critical: 'bg-red-600/10 border-red-600/20',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-3 shadow-xl text-xs">
        <p className="text-gray-400 mb-2 font-medium">{label}</p>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-400">{p.name}:</span>
            <span className="text-white font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const statusOptions: AgentStatus[] = ['available', 'busy', 'break', 'training', 'meeting', 'offline'];

export default function CommandCenter() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState('Today');
  const [overrideAgent, setOverrideAgent] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<AgentStatus>('available');
  const [overrideComment, setOverrideComment] = useState('');
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState(metrics);
  const [agentList, setAgentList] = useState(agents);
  const [intercomConnected, setIntercomConnected] = useState(false);

  // Check once on mount whether the Intercom proxy has a live token
  useEffect(() => {
    intercomService.getStatus().then(setIntercomConnected);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      setLiveMetrics(prev => prev.map(m => {
        const base = parseFloat(String(m.value));
        if (isNaN(base)) return m;
        const volatility = m.id === 'm4' ? 9 : m.id === 'm2' ? 1.5 : 0.25;
        const delta = (Math.random() - 0.45) * volatility;
        const raw = Math.max(0, base + delta);
        const value = m.unit === '%'
          ? String(Math.min(100, raw).toFixed(1))
          : m.unit === 'min'
          ? String(raw.toFixed(1))
          : String(Math.round(raw));
        return { ...m, value };
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const atRiskTeams = teams.filter(t => t.risk === 'high' || t.risk === 'critical');

  const handleOverride = () => {
    const agent = agentList.find(a => a.id === overrideAgent);
    if (!agent) return;
    setAgentList(prev => prev.map(a => a.id === overrideAgent ? { ...a, status: overrideStatus } : a));
    setOverrideSuccess(`Status override applied for ${agent.name} → ${overrideStatus}`);
    setOverrideAgent(null);
    setOverrideComment('');
    setTimeout(() => setOverrideSuccess(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Override modal */}
      {overrideAgent && (() => {
        const agent = agents.find(a => a.id === overrideAgent);
        if (!agent) return null;
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Override Agent Status</h3>
                <button onClick={() => setOverrideAgent(null)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#22253a] rounded-lg">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                  {agent.avatar}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{agent.name}</div>
                  <div className="text-gray-500 text-xs">{agent.team} · Current: <span className="text-amber-400">{agent.status}</span></div>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Override Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {statusOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setOverrideStatus(s)}
                      className={`text-xs py-1.5 rounded-lg border transition-colors capitalize ${overrideStatus === s ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'border-[#2a2d3e] text-gray-500 hover:text-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Reason / Comment</label>
                <input
                  type="text"
                  placeholder="e.g. Confirmed break via phone"
                  className="input w-full text-sm h-9"
                  value={overrideComment}
                  onChange={e => setOverrideComment(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleOverride} className="btn-primary flex-1 justify-center text-sm">
                  <Check size={14} />
                  Apply Override
                </button>
                <button onClick={() => setOverrideAgent(null)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
              </div>
              <p className="text-gray-600 text-xs mt-2 text-center">Override will be logged to the audit trail</p>
            </div>
          </div>
        );
      })()}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Live Command Center</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString()} &middot; Auto-refresh every 10s
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[#22253a] border border-[#2a2d3e] rounded-lg px-3 py-1.5">
            {['Today', '7D', '30D'].map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${timeRange === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn-secondary h-9">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="btn-secondary h-9">
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Override success banner */}
      {overrideSuccess && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 animate-fade-in">
          <Check size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm">{overrideSuccess} — logged to audit trail.</p>
        </div>
      )}

      {/* Risk alerts */}
      {atRiskTeams.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">SLA Risk Alert</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {atRiskTeams.map(t => t.name).join(', ')} {atRiskTeams.length === 1 ? 'is' : 'are'} at high risk. Immediate attention required.
            </p>
          </div>
          <button className="ml-auto btn-secondary text-xs h-7 px-3 flex-shrink-0">View Teams</button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {liveMetrics.map(metric => (
          <MetricCardComponent key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Volume forecast chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Volume: Actual vs Forecast</h3>
              <p className="text-gray-500 text-xs mt-0.5">30-minute intervals · Confidence band shown</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-300"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />Actual</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 bg-gray-600 inline-block border-dashed border" />Forecast</span>
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-3 h-0.5 bg-emerald-600 inline-block rounded" />Staffed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={forecastData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d6bff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3d6bff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#forecastBand)" name="Upper bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#0f1117" name="Lower bound" />
              <Area type="monotone" dataKey="actual" stroke="#3d6bff" strokeWidth={2} fill="url(#actualGrad)" name="Actual" dot={false} />
              <Area type="monotone" dataKey="forecast" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Forecast" dot={false} />
              <Area type="monotone" dataKey="staffed" stroke="#10b981" strokeWidth={1.5} fill="none" name="Staffed" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel distribution */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Channel Split</h3>
              <p className="text-gray-500 text-xs mt-0.5">Current volume distribution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={channelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                dataKey="value"
                strokeWidth={0}
              >
                {channelDistribution.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {channelDistribution.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-gray-400 text-xs">{c.name}</span>
                </div>
                <span className="text-white text-xs font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA by channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">SLA Performance by Channel</h3>
              <p className="text-gray-500 text-xs">Real-time vs targets</p>
            </div>
          </div>
          <div className="space-y-3">
            {slaMetrics.map(sla => (
              <div key={sla.channel} className={`flex items-center gap-3 p-3 rounded-lg border ${riskBg[sla.risk]}`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-sm font-medium">{sla.channel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{sla.volume} vol</span>
                      <span className={`font-bold text-sm ${riskColor[sla.risk]}`}>{sla.actual}%</span>
                      <span className="text-gray-600 text-xs">/ {sla.target}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sla.risk === 'low' ? 'bg-emerald-500' :
                        sla.risk === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${sla.actual}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team comparison */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Team Health Overview</h3>
              <p className="text-gray-500 text-xs">Up to 8 teams · Click for Quick View</p>
            </div>
            <button className="btn-secondary text-xs h-7 px-2.5">
              <Users size={12} />
              Compare
            </button>
          </div>
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#22253a] transition-colors cursor-pointer group">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  team.risk === 'low' ? 'bg-emerald-400' :
                  team.risk === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium truncate">{team.name}</span>
                    <span className={`text-xs font-bold ${riskColor[team.risk]}`}>{team.slaScore}%</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-500 text-xs">{team.activeAgents}/{team.agents} agents</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{team.adherenceScore}% adh.</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{team.site}</span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 btn-secondary text-xs h-6 px-2 transition-opacity">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intercom live panel — only renders when the proxy server is connected */}
      {intercomConnected && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[#2a2d3e]" />
            <span className="text-gray-600 text-xs font-medium uppercase tracking-widest px-2">Intercom</span>
            <div className="h-px flex-1 bg-[#2a2d3e]" />
          </div>
          <IntercomLive />
        </div>
      )}

      {/* Live agent roster */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2d3e]">
          <div>
            <h3 className="text-white font-semibold">Live Agent Roster</h3>
            <p className="text-gray-500 text-xs mt-0.5">Real-time adherence · API-synced · Click Override to correct status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">{agentList.length} agents shown</span>
            <button className="btn-secondary text-xs h-7 px-2.5">
              <Filter size={12} />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2d3e]">
                {['Agent', 'Team', 'Status', 'Scheduled', 'Adherence', 'Tickets', 'AHT', 'SLA Impact', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentList.map(agent => {
                const isNonAdherent = agent.status !== agent.scheduledStatus;
                return (
                  <tr key={agent.id} className={`table-row ${isNonAdherent ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                          {agent.avatar}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium whitespace-nowrap">{agent.name}</div>
                          <div className="text-gray-500 text-xs">{agent.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{agent.team}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <StatusBadge status={agent.status} />
                        {isNonAdherent && (
                          <span className="text-amber-400 text-[10px] flex items-center gap-0.5">
                            <AlertTriangle size={9} />
                            Not adherent
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={agent.scheduledStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${agent.adherenceScore >= 90 ? 'bg-emerald-500' : agent.adherenceScore >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${agent.adherenceScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${agent.adherenceScore >= 90 ? 'text-emerald-400' : agent.adherenceScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                          {agent.adherenceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm text-center">{agent.currentTickets}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{agent.avgHandleTime} min</td>
                    <td className="px-4 py-3">
                      <span className={
                        agent.slaImpact === 'positive' ? 'badge-green' :
                        agent.slaImpact === 'negative' ? 'badge-red' : 'badge-blue'
                      }>
                        {agent.slaImpact === 'positive' ? '↑ Positive' : agent.slaImpact === 'negative' ? '↓ Negative' : '→ Neutral'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setOverrideAgent(agent.id); setOverrideStatus(agent.status); }}
                        className="btn-secondary text-xs h-7 px-2.5 whitespace-nowrap"
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
