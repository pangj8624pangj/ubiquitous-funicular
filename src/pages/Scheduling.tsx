import { useState } from 'react';
import { Calendar, Plus, Check, X, AlertTriangle, Download, Filter, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { shiftSwaps, scheduleData } from '../data/mockData';

const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7AM–10PM

const shiftColors: Record<string, string> = {
  'Tier 1': 'bg-blue-600/60 border-blue-500/40 text-blue-200',
  'Tier 2': 'bg-purple-600/60 border-purple-500/40 text-purple-200',
  'Escalations': 'bg-emerald-600/60 border-emerald-500/40 text-emerald-200',
};

const statusBadge: Record<string, string> = {
  pending: 'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function Scheduling() {
  const [view, setView] = useState<'schedule' | 'swaps'>('schedule');
  const [swapList, setSwapList] = useState(shiftSwaps);
  const [weekOffset, setWeekOffset] = useState(0);

  const handleSwap = (id: string, action: 'approved' | 'rejected') => {
    setSwapList(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
  };

  const pendingCount = swapList.filter(s => s.status === 'pending').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            Schedule Manager
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Drag-and-drop scheduling · Compliance-locked swaps · Bulk changes</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9">
            <Download size={14} />
            Export
          </button>
          <button className="btn-primary h-9">
            <Plus size={14} />
            New Shift
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 bg-[#22253a] border border-[#2a2d3e] rounded-xl p-1 w-fit">
        <button
          onClick={() => setView('schedule')}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${view === 'schedule' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Weekly Schedule
        </button>
        <button
          onClick={() => setView('swaps')}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'swaps' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Shift Swaps
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {view === 'schedule' && (
        <div className="space-y-4">
          {/* Week nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setWeekOffset(w => w - 1)} className="btn-secondary h-8 w-8 p-0 justify-center">
                <ChevronLeft size={14} />
              </button>
              <span className="text-white font-medium text-sm">
                Week of Mar {3 + weekOffset * 7}, 2026
              </span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="btn-secondary h-8 w-8 p-0 justify-center">
                <ChevronRight size={14} />
              </button>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="text-blue-400 text-xs hover:text-blue-300">
                  Today
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select className="input text-xs h-8 px-2">
                <option>All Teams</option>
                <option>Tier 1 Support</option>
                <option>Tier 2 Support</option>
                <option>Escalations</option>
              </select>
              <button className="btn-secondary h-8 text-xs">
                <Filter size={12} />
                Filter
              </button>
            </div>
          </div>

          {/* Schedule grid */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: 900 }}>
                {/* Hour ruler */}
                <div className="grid border-b border-[#2a2d3e] bg-[#13151f]" style={{ gridTemplateColumns: '120px repeat(16, 1fr)' }}>
                  <div className="p-3 border-r border-[#2a2d3e]">
                    <span className="text-gray-600 text-xs font-medium">Agent / Day</span>
                  </div>
                  {hours.map(h => (
                    <div key={h} className="p-2 text-center border-r border-[#2a2d3e] last:border-r-0">
                      <span className="text-gray-600 text-[10px]">{h > 12 ? `${h - 12}PM` : h === 12 ? '12PM' : `${h}AM`}</span>
                    </div>
                  ))}
                </div>

                {/* Schedule rows */}
                {scheduleData.map(({ day, shifts }) => (
                  <div key={day}>
                    <div className="border-b border-[#2a2d3e] hover:bg-[#1e2130] transition-colors">
                      {/* Day header */}
                      <div className="grid" style={{ gridTemplateColumns: '120px 1fr' }}>
                        <div className="p-3 border-r border-[#2a2d3e] flex items-center">
                          <div>
                            <div className="text-white text-sm font-semibold">{day}</div>
                            <div className="text-gray-500 text-[10px]">{shifts.length} shifts</div>
                          </div>
                        </div>
                        <div className="relative py-2 px-1" style={{ height: 56 }}>
                          {/* Hour grid lines */}
                          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
                            {hours.map(h => (
                              <div key={h} className="border-r border-[#2a2d3e]/40 last:border-r-0 h-full" />
                            ))}
                          </div>
                          {/* Shift bars */}
                          {shifts.map((shift, idx) => {
                            const startPct = ((shift.start - 7) / 16) * 100;
                            const widthPct = ((shift.end - shift.start) / 16) * 100;
                            const topPct = (idx % 2) * 48;
                            return (
                              <div
                                key={idx}
                                className={`absolute h-5 rounded border text-[10px] font-medium px-1.5 flex items-center cursor-pointer hover:brightness-110 transition-all truncate ${shiftColors[shift.team] || 'bg-gray-600/60 border-gray-500/40 text-gray-200'}`}
                                style={{
                                  left: `${startPct}%`,
                                  width: `${widthPct}%`,
                                  top: idx < 3 ? 4 : 26,
                                }}
                                title={`${shift.agent} · ${shift.start}:00–${shift.end}:00 · ${shift.team}`}
                              >
                                {shift.agent.split(' ')[0]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(shiftColors).map(([team, cls]) => (
              <div key={team} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded border ${cls}`} />
                <span className="text-gray-400 text-xs">{team}</span>
              </div>
            ))}
            <span className="text-gray-600 text-xs ml-auto">Click a shift to edit · Drag to move</span>
          </div>
        </div>
      )}

      {view === 'swaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{swapList.length} total requests</span>
              <span className="badge-yellow">{pendingCount} pending</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-xs h-8">Bulk Approve</button>
              <select className="input text-xs h-8 px-2">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2d3e]">
                  {['Agent', 'From Shift', 'To Shift', 'Date', 'Reason', 'Compliance', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {swapList.map(swap => (
                  <tr key={swap.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                          {swap.agentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-white text-sm font-medium whitespace-nowrap">{swap.agentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-400 text-xs whitespace-nowrap">
                        <Clock size={11} />
                        {swap.fromShift}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-300 text-xs whitespace-nowrap">
                        <Clock size={11} />
                        {swap.toShift}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{swap.date}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px] truncate">{swap.reason}</td>
                    <td className="px-4 py-3">
                      {swap.complianceOk ? (
                        <span className="badge-green"><Check size={10} />OK</span>
                      ) : (
                        <span className="badge-red flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Violation
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge[swap.status]}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {swap.status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSwap(swap.id, 'approved')}
                            className="h-7 px-2.5 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check size={11} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleSwap(swap.id, 'rejected')}
                            className="h-7 px-2.5 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X size={11} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button className="btn-secondary text-xs h-7 px-2.5">Undo</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
