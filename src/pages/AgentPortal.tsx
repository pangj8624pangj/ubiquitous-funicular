import { useState, useEffect } from 'react';
import { Calendar, ArrowLeftRight, Bell, Award, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { agentBadges, adherenceTimeline, shiftSwaps } from '../data/mockData';
import type { ShiftSwapRequest } from '../types';

const mySchedule = [
  { day: 'Mon Mar 3', shift: '9:00 AM – 5:00 PM', status: 'Confirmed', type: 'Regular' },
  { day: 'Tue Mar 4', shift: '9:00 AM – 5:00 PM', status: 'Confirmed', type: 'Regular' },
  { day: 'Wed Mar 5', shift: '10:00 AM – 6:00 PM', status: 'Modified', type: 'Swap Approved' },
  { day: 'Thu Mar 6', shift: '9:00 AM – 5:00 PM', status: 'Confirmed', type: 'Regular' },
  { day: 'Fri Mar 7', shift: '9:00 AM – 5:00 PM', status: 'Confirmed', type: 'Regular' },
  { day: 'Sat Mar 8', shift: '—', status: 'Off', type: 'Day Off' },
  { day: 'Sun Mar 9', shift: '—', status: 'Off', type: 'Day Off' },
];

const myKPIs = [
  { label: 'Adherence Score', value: '97%', change: '+2pp', positive: true, target: '90%' },
  { label: 'Avg Handle Time', value: '4.2 min', change: '-0.3m', positive: true, target: '< 8 min' },
  { label: 'CSAT Score', value: '4.8/5', change: '+0.2', positive: true, target: '> 4.5' },
  { label: 'SLA Contribution', value: 'Positive', change: '+12 tickets', positive: true, target: 'Positive' },
];

const initialMySwaps = shiftSwaps.filter(s => s.agentId === 'a1');

export default function AgentPortal() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'kpi' | 'swaps' | 'badges'>('schedule');
  const [swapOpen, setSwapOpen] = useState(false);
  const [mySwaps, setMySwaps] = useState<ShiftSwapRequest[]>(() => {
    try {
      const stored = localStorage.getItem('pulseops_my_swaps');
      return stored ? JSON.parse(stored) : initialMySwaps;
    } catch {
      return initialMySwaps;
    }
  });
  const [swapForm, setSwapForm] = useState({ myShift: '', swapWith: '', reason: '' });
  const [swapSubmitted, setSwapSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('pulseops_my_swaps', JSON.stringify(mySwaps));
    } catch {}
  }, [mySwaps]);

  const streakDays = 12;
  const adherenceToday = 97;

  const handleSubmitSwap = () => {
    if (!swapForm.reason.trim()) return;
    const newSwap: ShiftSwapRequest = {
      id: `sw-${Date.now()}`,
      agentName: 'Sarah Chen',
      agentId: 'a1',
      fromShift: swapForm.myShift || 'Mon Mar 3 · 9AM–5PM',
      toShift: swapForm.swapWith || 'Marcus Rivera · Wed 10AM–6PM',
      date: '2026-03-09',
      reason: swapForm.reason,
      status: 'pending',
      complianceOk: true,
    };
    setMySwaps(prev => [newSwap, ...prev]);
    setSwapForm({ myShift: '', swapWith: '', reason: '' });
    setSwapOpen(false);
    setSwapSubmitted(true);
    setTimeout(() => setSwapSubmitted(false), 4000);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Agent hero */}
      <div className="card p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/10 border-blue-500/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              SC
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Sarah Chen</h2>
              <p className="text-gray-400 text-sm">Tier 1 Support · HQ · Chat, Email, Billing</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge-green">
                  <span className="live-dot" />
                  Available
                </span>
                <span className="text-gray-500 text-xs">Shift ends in 2h 18m</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{streakDays}</div>
              <div className="text-gray-500 text-xs">Day streak 🔥</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{adherenceToday}%</div>
              <div className="text-gray-500 text-xs">Adherence today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{agentBadges.filter(b => b.earned).length}</div>
              <div className="text-gray-500 text-xs">Badges earned</div>
            </div>
          </div>
        </div>

        {/* Today's adherence bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-400 text-xs font-medium">Today's Adherence Progress</span>
            <span className="text-emerald-400 text-xs font-bold">{adherenceToday}% / 90% target</span>
          </div>
          <div className="h-2.5 bg-[#1a1d27] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full" style={{ width: `${adherenceToday}%` }} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {swapSubmitted && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 animate-fade-in">
            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-sm flex-1">Shift swap request submitted. Compliance check passed. Pending manager review.</p>
          </div>
        )}
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
          <Bell size={14} className="text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-sm flex-1">Your shift swap request for Tue Mar 4 was <strong>approved</strong></p>
          <button onClick={() => setActiveTab('swaps')} className="text-blue-400 text-xs hover:text-blue-300">View</button>
        </div>
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <Award size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm flex-1">New badge unlocked: <strong>Perfect Week</strong> 🎯</p>
          <button onClick={() => setActiveTab('badges')} className="text-emerald-400 text-xs hover:text-emerald-300">View</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#22253a] border border-[#2a2d3e] rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'schedule', label: 'My Schedule', icon: Calendar },
          { id: 'kpi', label: 'My KPIs', icon: TrendingUp },
          { id: 'swaps', label: 'Shift Swaps', icon: ArrowLeftRight },
          { id: 'badges', label: 'Badges', icon: Award },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Schedule tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Week of Mar 3, 2026</h3>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-xs h-7 px-2.5">← Prev</button>
              <button className="btn-secondary text-xs h-7 px-2.5">Next →</button>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2d3e]">
                  {['Day', 'Shift', 'Type', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mySchedule.map(row => (
                  <tr key={row.day} className="table-row">
                    <td className="px-4 py-3 text-white font-medium text-sm">{row.day}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                        <Clock size={12} className="text-gray-500" />
                        {row.shift}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={row.type === 'Swap Approved' ? 'badge-green' : 'badge-blue'}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.status === 'Off'
                        ? <span className="text-gray-500 text-xs">—</span>
                        : <span className={row.status === 'Modified' ? 'badge-yellow' : 'badge-green'}>{row.status}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Adherence timeline */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">Today's Adherence Timeline</h4>
              <span className="badge-green">{adherenceToday}% adherent</span>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
              {adherenceTimeline.map((entry, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                    entry.match ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-amber-500/20 border border-amber-500/40'
                  }`}
                  title={`${entry.time}: ${entry.actual}${!entry.match ? ` (scheduled: ${entry.scheduled})` : ''}`}
                >
                  <span className="text-[9px] text-gray-500">{entry.time.split(':')[0]}</span>
                  {entry.match
                    ? <CheckCircle size={12} className="text-emerald-400" />
                    : <AlertCircle size={12} className="text-amber-400" />
                  }
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-500 text-xs">Adherent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-500 text-xs">Non-adherent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI tab */}
      {activeTab === 'kpi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myKPIs.map(kpi => (
              <div key={kpi.label} className="metric-card border border-[#2a2d3e]">
                <div className="stat-label mb-2">{kpi.label}</div>
                <div className="stat-value">{kpi.value}</div>
                <div className={`text-xs mt-1 ${kpi.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.change} vs last week
                </div>
                <div className="text-gray-600 text-xs mt-0.5">Target: {kpi.target}</div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h4 className="text-white font-semibold text-sm mb-4">Performance vs Team Average</h4>
            <div className="space-y-4">
              {[
                { label: 'Adherence', mine: 97, team: 88 },
                { label: 'CSAT', mine: 96, team: 84 },
                { label: 'SLA Contribution', mine: 94, team: 91 },
                { label: 'Handle Time Efficiency', mine: 88, team: 79 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-400 text-xs">{m.label}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-blue-400 font-medium">Me: {m.mine}%</span>
                      <span className="text-gray-500">Team avg: {m.team}%</span>
                    </div>
                  </div>
                  {/* Track: gray bg = full bar, blue fill = my score, white line = team marker */}
                  <div className="h-2 bg-[#2a2d3e] rounded-full overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                      style={{ width: `${m.mine}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-gray-300 z-10"
                      style={{ left: `${m.team}%` }}
                      title={`Team avg: ${m.team}%`}
                    />
                  </div>
                  <div className="flex items-center justify-end mt-0.5">
                    <span className="text-gray-600 text-[10px]">▲ team avg at {m.team}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swaps tab */}
      {activeTab === 'swaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">My Shift Swap Requests</h3>
            <button onClick={() => setSwapOpen(!swapOpen)} className="btn-primary h-9 text-sm">
              <ArrowLeftRight size={14} />
              Request Swap
            </button>
          </div>

          {swapOpen && (
            <div className="card p-5 border-blue-500/20 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold text-sm">New Shift Swap Request</h4>
                <button onClick={() => setSwapOpen(false)} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1">My Shift</label>
                  <select
                    className="input w-full text-sm h-9"
                    value={swapForm.myShift}
                    onChange={e => setSwapForm(f => ({ ...f, myShift: e.target.value }))}
                  >
                    <option value="">Mon Mar 3 · 9AM–5PM</option>
                    <option value="Tue Mar 4 · 9AM–5PM">Tue Mar 4 · 9AM–5PM</option>
                    <option value="Thu Mar 6 · 9AM–5PM">Thu Mar 6 · 9AM–5PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1">Swap With</label>
                  <select
                    className="input w-full text-sm h-9"
                    value={swapForm.swapWith}
                    onChange={e => setSwapForm(f => ({ ...f, swapWith: e.target.value }))}
                  >
                    <option value="">Marcus Rivera · Wed 10AM–6PM</option>
                    <option value="Aisha Thompson · Fri 9AM–5PM">Aisha Thompson · Fri 9AM–5PM</option>
                    <option value="Carlos Mendez · Thu 12PM–8PM">Carlos Mendez · Thu 12PM–8PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1">
                    Reason <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brief reason..."
                    className="input w-full text-sm h-9"
                    value={swapForm.reason}
                    onChange={e => setSwapForm(f => ({ ...f, reason: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmitSwap}
                  disabled={!swapForm.reason.trim()}
                  className="btn-primary text-xs h-8 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
                <button onClick={() => setSwapOpen(false)} className="btn-secondary text-xs h-8">Cancel</button>
                <span className="text-gray-500 text-xs">Compliance check runs automatically</span>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            {mySwaps.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No swap requests yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2d3e]">
                    {['From Shift', 'To Shift', 'Date', 'Reason', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mySwaps.map(swap => (
                    <tr key={swap.id} className="table-row">
                      <td className="px-4 py-3 text-gray-300 text-sm">{swap.fromShift}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{swap.toShift}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{swap.date}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm max-w-[200px] truncate">{swap.reason}</td>
                      <td className="px-4 py-3">
                        <span className={swap.status === 'approved' ? 'badge-green' : swap.status === 'rejected' ? 'badge-red' : 'badge-yellow'}>
                          {swap.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Badges tab */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Achievement Badges</h3>
            <span className="badge-blue">{agentBadges.filter(b => b.earned).length}/{agentBadges.length} earned</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agentBadges.map(badge => (
              <div
                key={badge.label}
                className={`card p-5 flex items-center gap-4 ${badge.earned ? 'border-blue-500/20 bg-blue-500/5' : 'opacity-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${badge.earned ? 'bg-blue-600/20' : 'bg-[#22253a]'}`}>
                  {badge.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{badge.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{badge.description}</div>
                  {badge.earned
                    ? <span className="badge-green mt-1.5">Earned</span>
                    : <span className="text-gray-600 text-xs mt-1 block">Locked</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Streak progress */}
          <div className="card p-5 bg-gradient-to-r from-orange-500/10 to-red-500/5 border-orange-500/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔥</span>
              <div>
                <h4 className="text-white font-semibold">{streakDays}-Day Adherence Streak!</h4>
                <p className="text-gray-400 text-xs">Keep it up to unlock the 90-Day Streak badge</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-500 text-xs">Progress to 90-Day Streak</span>
              <span className="text-orange-400 text-xs font-medium">{streakDays}/90 days</span>
            </div>
            <div className="h-2 bg-[#1a1d27] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${(streakDays / 90) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
