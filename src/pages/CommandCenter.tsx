import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { RefreshCw, Download, Filter, ChevronDown, AlertTriangle, TrendingUp, Users, Activity } from 'lucide-react';
import MetricCardComponent from '../components/UI/MetricCard';
import StatusBadge from '../components/UI/StatusBadge';
import { metrics, forecastData, slaMetrics, teams, agents, channelDistribution } from '../data/mockData';
import type { RiskLevel } from '../types';

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-3 shadow-xl text-xs">
        <p className="text-gray-400 mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
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

export default function CommandCenter() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState('Today');
  const [selectedTeams, setSelectedTeams] = useState<string[]>(['all']);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const atRiskTeams = teams.filter(t => t.risk === 'high' || t.risk === 'critical');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
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
        {metrics.map(metric => (
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
              <p className="text-gray-500 text-xs mt-0.5">15-minute intervals · Confidence band shown</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block" />Actual</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 bg-gray-600 inline-block border-dashed border" />Forecast</span>
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-3 h-0.5 bg-emerald-600 inline-block" />Staffed</span>
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
                {channelDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
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
                      style={{ width: `${(sla.actual / 100) * 100}%` }}
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

      {/* Live agent roster */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2d3e]">
          <div>
            <h3 className="text-white font-semibold">Live Agent Roster</h3>
            <p className="text-gray-500 text-xs mt-0.5">Real-time adherence · API-synced</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">{agents.length} agents shown</span>
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
              {agents.map(agent => {
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
                      <button className="btn-secondary text-xs h-7 px-2.5 whitespace-nowrap">Override</button>
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
