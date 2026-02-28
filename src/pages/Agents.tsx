import { useState } from 'react';
import { Users, Search, Filter, AlertTriangle, TrendingUp, CheckCircle, BarChart2, X } from 'lucide-react';
import StatusBadge from '../components/UI/StatusBadge';
import { agents, adherenceTimeline } from '../data/mockData';
import type { Agent, AgentStatus } from '../types';

export default function Agents() {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [selected, setSelected] = useState<Agent | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<AgentStatus>('available');
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  const handleOverrideApply = () => {
    setOverrideOpen(false);
    setOverrideSuccess(`Status set to "${overrideStatus}" for ${selected?.name ?? 'agent'}`);
    setTimeout(() => setOverrideSuccess(null), 3000);
  };

  const teams = ['All Teams', ...Array.from(new Set(agents.map(a => a.team)))];
  const filtered = agents.filter(a =>
    (teamFilter === 'All Teams' || a.team === teamFilter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) ||
     a.team.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    online: agents.filter(a => a.status !== 'offline').length,
    adherent: agents.filter(a => a.adherenceScore >= 90).length,
    atRisk: agents.filter(a => a.adherenceScore < 75).length,
    avgAdherence: Math.round(agents.reduce((s, a) => s + a.adherenceScore, 0) / agents.length),
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-blue-400" />
            Agent Management
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Real-time adherence · API-synced status · Audit trail</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9">
            <Filter size={14} />
            Bulk Action
          </button>
          <button className="btn-primary h-9">
            <Users size={14} />
            Add Agent
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Online Now', value: stats.online, total: agents.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Adherent (>90%)', value: stats.adherent, total: agents.length, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'At Risk (<75%)', value: stats.atRisk, total: agents.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Avg Adherence', value: `${stats.avgAdherence}%`, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(({ label, value, total, icon: Icon, color, bg }) => (
          <div key={label} className={`card p-4 border ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
              <Icon size={15} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">
              {value}
              {total && <span className="text-gray-500 text-base font-normal">/{total}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Agent table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#2a2d3e]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or team..."
                className="input pl-9 w-full text-xs h-8"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input text-xs h-8 px-2"
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
            >
              {teams.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2d3e]">
                  {['Agent', 'Status', 'Adherence', 'Skills', 'AHT', 'Tickets', 'SLA Impact'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(agent => {
                  const isNonAdherent = agent.status !== agent.scheduledStatus;
                  return (
                    <tr
                      key={agent.id}
                      onClick={() => setSelected(agent)}
                      className={`table-row cursor-pointer ${selected?.id === agent.id ? 'bg-blue-500/10' : isNonAdherent ? 'bg-amber-500/5' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0 relative">
                            {agent.avatar}
                            {isNonAdherent && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border border-[#1a1d27] flex items-center justify-center">
                                <AlertTriangle size={7} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium whitespace-nowrap">{agent.name}</div>
                            <div className="text-gray-500 text-xs">{agent.site}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={agent.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
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
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {agent.skills.slice(0, 2).map(s => (
                            <span key={s} className="bg-[#2a2d3e] text-gray-400 text-[10px] px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                          {agent.skills.length > 2 && (
                            <span className="bg-[#2a2d3e] text-gray-500 text-[10px] px-1.5 py-0.5 rounded">+{agent.skills.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{agent.avgHandleTime}m</td>
                      <td className="px-4 py-3 text-gray-300 text-sm text-center">{agent.currentTickets}</td>
                      <td className="px-4 py-3">
                        <span className={
                          agent.slaImpact === 'positive' ? 'badge-green' :
                          agent.slaImpact === 'negative' ? 'badge-red' : 'badge-blue'
                        }>
                          {agent.slaImpact === 'positive' ? '↑' : agent.slaImpact === 'negative' ? '↓' : '→'} {agent.slaImpact}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-500">No agents match your search</div>
            )}
          </div>
        </div>

        {/* Agent detail panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              {/* Agent profile */}
              <div className="card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-base font-bold text-blue-400 flex-shrink-0">
                    {selected.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{selected.name}</div>
                    <div className="text-gray-500 text-xs">{selected.team} · {selected.site}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={selected.status} />
                      {selected.status !== selected.scheduledStatus && (
                        <span className="badge-yellow">
                          <AlertTriangle size={9} />
                          Non-adherent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Adherence', value: `${selected.adherenceScore}%` },
                    { label: 'Avg Handle Time', value: `${selected.avgHandleTime}m` },
                    { label: 'Active Tickets', value: selected.currentTickets },
                    { label: 'Shift', value: selected.shift },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#22253a] rounded-lg p-2.5">
                      <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{label}</div>
                      <div className="text-white text-sm font-semibold mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map(s => (
                      <span key={s} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>

                {overrideSuccess && (
                  <div className="mb-3 px-3 py-2 bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                    {overrideSuccess}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setOverrideOpen(true)} className="btn-secondary text-xs h-8 flex-1">Override Status</button>
                  <button
                    onClick={() => {
                      setOverrideSuccess(`Viewing profile for ${selected.name}`);
                      setTimeout(() => setOverrideSuccess(null), 2000);
                    }}
                    className="btn-primary text-xs h-8 flex-1"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              {/* Adherence timeline */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-semibold">Adherence Timeline</h4>
                  <span className="text-gray-500 text-xs">Today</span>
                </div>
                <div className="space-y-1.5">
                  {adherenceTimeline.map((entry, i) => (
                    <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${!entry.match ? 'bg-amber-500/10 border border-amber-500/20' : ''}`}>
                      <span className="text-gray-500 w-10 flex-shrink-0">{entry.time}</span>
                      <span className={`flex-1 ${entry.match ? 'text-gray-400' : 'text-amber-400 font-medium'}`}>{entry.actual}</span>
                      {!entry.match && (
                        <span className="text-gray-500 text-[10px]">sched: {entry.scheduled}</span>
                      )}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.match ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center text-center">
              <Users size={32} className="text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm font-medium">Select an agent</p>
              <p className="text-gray-600 text-xs mt-1">Click a row to view detailed adherence, timeline, and override options</p>
            </div>
          )}
        </div>
      </div>

      {/* Override modal */}
      {overrideOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-2xl p-6 w-96 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Override Status — {selected.name}</h3>
              <button onClick={() => setOverrideOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-4">Select the new status to apply manually</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {(['available', 'busy', 'break', 'training', 'meeting', 'offline'] as AgentStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setOverrideStatus(s)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                    overrideStatus === s
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                      : 'border-[#2a2d3e] text-gray-400 hover:border-[#3a3d50] hover:text-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleOverrideApply} className="btn-primary text-xs h-8 flex-1">Apply Override</button>
              <button onClick={() => setOverrideOpen(false)} className="btn-secondary text-xs h-8 flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
