import { useState, useRef } from 'react';
import { Calendar, Plus, Check, X, AlertTriangle, Download, Filter, Clock, ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { shiftSwaps, scheduleData } from '../data/mockData';
import type { ShiftSwapRequest } from '../types';

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

type ScheduleShift = { agent: string; start: number; end: number; team: string; color: string };
type ScheduleDay = { day: string; shifts: ScheduleShift[] };

interface DraggableShiftProps {
  id: string;
  shift: ScheduleShift;
  topPx: number;
}

function DraggableShift({ id, shift, topPx }: DraggableShiftProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const startPct = ((shift.start - 7) / 16) * 100;
  const widthPct = ((shift.end - shift.start) / 16) * 100;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute h-5 rounded border text-[10px] font-medium px-1.5 flex items-center gap-1 select-none truncate
        ${shiftColors[shift.team] || 'bg-gray-600/60 border-gray-500/40 text-gray-200'}
        ${isDragging ? 'opacity-60 shadow-xl z-50 cursor-grabbing' : 'cursor-grab hover:brightness-110'}`}
      style={{
        left: `${startPct}%`,
        width: `${widthPct}%`,
        top: topPx,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 50 : undefined,
        touchAction: 'none',
      }}
      title={`${shift.agent} · ${shift.start}:00–${shift.end}:00 · ${shift.team}`}
    >
      <GripHorizontal size={9} className="opacity-50 flex-shrink-0" />
      {shift.agent.split(' ')[0]}
    </div>
  );
}

export default function Scheduling() {
  const [view, setView] = useState<'schedule' | 'swaps'>('schedule');
  const [swapList, setSwapList] = useState<ShiftSwapRequest[]>(shiftSwaps);
  const [weekOffset, setWeekOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [schedule, setSchedule] = useState<ScheduleDay[]>(() =>
    scheduleData.map(d => ({ ...d, shifts: d.shifts.map(s => ({ ...s })) }))
  );
  const [dragToast, setDragToast] = useState<string | null>(null);
  const gridContentRef = useRef<HTMLDivElement | null>(null);

  const handleSwap = (id: string, action: 'approved' | 'rejected') => {
    setSwapList(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
  };

  const handleUndo = (id: string) => {
    setSwapList(prev => prev.map(s => s.id === id ? { ...s, status: 'pending' } : s));
  };

  const handleBulkApprove = () => {
    setSwapList(prev =>
      prev.map(s => (s.status === 'pending' && s.complianceOk) ? { ...s, status: 'approved' } : s)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active || !delta.x) return;

    const gridWidth = gridContentRef.current?.offsetWidth ?? 780;
    const rawHours = (delta.x / gridWidth) * 16;
    const snapped = Math.round(rawHours * 2) / 2; // snap to 30-minute increments
    if (snapped === 0) return;

    const [dayStr, shiftStr] = (active.id as string).split('-');
    const dayIdx = parseInt(dayStr);
    const shiftIdx = parseInt(shiftStr);

    setSchedule(prev => prev.map((day, di) => {
      if (di !== dayIdx) return day;
      return {
        ...day,
        shifts: day.shifts.map((sh, si) => {
          if (si !== shiftIdx) return sh;
          const duration = sh.end - sh.start;
          const newStart = Math.max(7, Math.min(23 - duration, sh.start + snapped));
          const newEnd = newStart + duration;
          // Show a brief toast with the new time
          setDragToast(`${sh.agent.split(' ')[0]}: ${newStart}:00–${newEnd}:00`);
          setTimeout(() => setDragToast(null), 2500);
          return { ...sh, start: newStart, end: newEnd };
        }),
      };
    }));
  };

  const pendingCount = swapList.filter(s => s.status === 'pending').length;
  const compliancePendingCount = swapList.filter(s => s.status === 'pending' && s.complianceOk).length;

  const filteredSwaps = swapList.filter(s =>
    statusFilter === 'All Status' || s.status === statusFilter.toLowerCase()
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Drag toast */}
      {dragToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1d27] border border-blue-500/30 text-blue-300 text-xs px-4 py-2 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2">
          <Clock size={12} />
          Rescheduled — {dragToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            Schedule Manager
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Visual schedule · Drag shifts to reschedule · Compliance-locked swaps</p>
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
                <DndContext onDragEnd={handleDragEnd}>
                  {schedule.map(({ day, shifts }, dayIdx) => (
                    <div key={day}>
                      <div className="border-b border-[#2a2d3e] hover:bg-[#1e2130] transition-colors">
                        <div className="grid" style={{ gridTemplateColumns: '120px 1fr' }}>
                          <div className="p-3 border-r border-[#2a2d3e] flex items-center">
                            <div>
                              <div className="text-white text-sm font-semibold">{day}</div>
                              <div className="text-gray-500 text-[10px]">{shifts.length} shifts</div>
                            </div>
                          </div>
                          <div
                            ref={dayIdx === 0 ? gridContentRef : undefined}
                            className="relative py-2 px-1"
                            style={{ height: 56 }}
                          >
                            {/* Hour grid lines */}
                            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
                              {hours.map(h => (
                                <div key={h} className="border-r border-[#2a2d3e]/40 last:border-r-0 h-full" />
                              ))}
                            </div>
                            {/* Draggable shift bars — top row (idx 0-2), bottom row (idx 3+) */}
                            {shifts.map((shift, shiftIdx) => (
                              <DraggableShift
                                key={`${day}-${shift.agent}-${shiftIdx}`}
                                id={`${dayIdx}-${shiftIdx}`}
                                shift={shift}
                                topPx={shiftIdx < 3 ? 4 : 26}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </DndContext>
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
            <span className="text-gray-600 text-xs ml-auto flex items-center gap-1">
              <GripHorizontal size={11} />
              Drag shifts left/right to reschedule
            </span>
          </div>
        </div>
      )}

      {view === 'swaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{swapList.length} total requests</span>
              <span className="badge-yellow">{pendingCount} pending</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={compliancePendingCount === 0}
                className="btn-secondary text-xs h-8 disabled:opacity-40 disabled:cursor-not-allowed"
                title={compliancePendingCount === 0 ? 'No compliant pending swaps' : `Approve ${compliancePendingCount} compliant swap(s)`}
              >
                <Check size={12} />
                Bulk Approve ({compliancePendingCount})
              </button>
              <select
                className="input text-xs h-8 px-2"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
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
                {filteredSwaps.map(swap => (
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
                        <span className="badge-red">
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
                            disabled={!swap.complianceOk}
                            className="h-7 px-2.5 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={!swap.complianceOk ? 'Compliance violation – cannot approve' : 'Approve swap'}
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
                        <button
                          onClick={() => handleUndo(swap.id)}
                          className="btn-secondary text-xs h-7 px-2.5"
                        >
                          Undo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSwaps.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                      No swap requests match the current filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
