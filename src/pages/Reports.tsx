import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { BarChart3, Plus, Play, Download, Clock, RefreshCw, Save, X, GripVertical } from 'lucide-react';
import { reportTemplates, weeklyForecast, slaMetrics } from '../data/mockData';

const availableMetrics = [
  'SLA %', 'Adherence %', 'AHT (min)', 'Volume', 'Cost/ticket',
  'Agent utilization', 'Forecast accuracy', 'Overtime hours',
  'CSAT score', 'First contact resolution', 'Escalation rate', 'Handle time',
];

const availableDimensions = [
  'Team', 'Agent', 'Skill', 'Channel', 'Site', 'Time (15m)',
  'Time (hourly)', 'Day', 'Week', 'BPO Vendor',
];

const sampleData = slaMetrics.map(s => ({
  name: s.channel,
  'SLA %': s.actual,
  Volume: s.volume,
  Target: s.target,
}));

const trendData = weeklyForecast.map(w => ({
  day: w.day,
  'Adherence %': 88 + Math.random() * 8,
  'SLA %': 90 + Math.random() * 7,
  Volume: w.volume / 20,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-3 shadow-xl text-xs">
        <p className="text-gray-400 mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-400">{p.name}:</span>
            <span className="text-white font-semibold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const categoryColors: Record<string, string> = {
  SLA: 'badge-blue',
  Adherence: 'badge-green',
  Forecasting: 'badge-purple',
  BPO: 'badge-yellow',
  Scheduling: 'badge-blue',
  Finance: 'badge-green',
};

export default function Reports() {
  const [view, setView] = useState<'templates' | 'builder'>('templates');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['SLA %', 'Volume']);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['Channel', 'Day']);
  const [reportType, setReportType] = useState('Bar Chart');

  const toggleMetric = (m: string) => {
    setSelectedMetrics(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const toggleDimension = (d: string) => {
    setSelectedDimensions(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-400" />
            Reports & Analytics
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Drag-and-drop builder · Scheduled exports · BI connectors</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9">
            <Download size={14} />
            Export All
          </button>
          <button className="btn-primary h-9" onClick={() => setView('builder')}>
            <Plus size={14} />
            New Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#22253a] border border-[#2a2d3e] rounded-xl p-1 w-fit">
        <button
          onClick={() => setView('templates')}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${view === 'templates' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Report Library
        </button>
        <button
          onClick={() => setView('builder')}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${view === 'builder' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Custom Builder
        </button>
      </div>

      {view === 'templates' && (
        <div className="space-y-6">
          {/* Report grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reportTemplates.map(report => (
              <div key={report.id} className="card p-5 hover:bg-[#22253a] transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={categoryColors[report.category] || 'badge-blue'}>{report.category}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{report.name}</h3>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-3">{report.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {report.metrics.map(m => (
                    <span key={m} className="bg-[#2a2d3e] text-gray-400 text-[10px] px-1.5 py-0.5 rounded">{m}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#2a2d3e]">
                  <div className="flex items-center gap-2">
                    <Clock size={11} className="text-gray-600" />
                    <span className="text-gray-500 text-xs">Last run: {report.lastRun}</span>
                  </div>
                  {report.schedule && (
                    <div className="flex items-center gap-1">
                      <RefreshCw size={10} className="text-blue-400" />
                      <span className="text-blue-400 text-[10px]">{report.schedule}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn-primary text-xs h-7 flex-1">
                    <Play size={11} />
                    Run Now
                  </button>
                  <button className="btn-secondary text-xs h-7 flex-1">
                    <Download size={11} />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Preview charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">SLA by Channel</h3>
                  <p className="text-gray-500 text-xs">Today's attainment vs targets</p>
                </div>
                <button className="btn-secondary text-xs h-7 px-2.5">
                  <Download size={11} />
                  CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sampleData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="SLA %" fill="#3d6bff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="#6b7280" radius={[4, 4, 0, 0]} opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">Weekly Performance Trend</h3>
                  <p className="text-gray-500 text-xs">SLA % and Adherence % by day</p>
                </div>
                <button className="btn-secondary text-xs h-7 px-2.5">
                  <Download size={11} />
                  CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={[80, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="SLA %" stroke="#3d6bff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Adherence %" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {view === 'builder' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Builder sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Metrics picker */}
            <div className="card p-4">
              <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <GripVertical size={14} className="text-gray-500" />
                Metrics
              </h4>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {availableMetrics.map(m => (
                  <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleMetric(m)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                        selectedMetrics.includes(m)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-[#2a2d3e] group-hover:border-blue-500/50'
                      }`}
                    >
                      {selectedMetrics.includes(m) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-gray-400 text-xs group-hover:text-gray-200 transition-colors">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensions picker */}
            <div className="card p-4">
              <h4 className="text-white text-sm font-semibold mb-3">Dimensions</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {availableDimensions.map(d => (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleDimension(d)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                        selectedDimensions.includes(d)
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-[#2a2d3e] group-hover:border-purple-500/50'
                      }`}
                    >
                      {selectedDimensions.includes(d) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-gray-400 text-xs group-hover:text-gray-200 transition-colors">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chart type */}
            <div className="card p-4">
              <h4 className="text-white text-sm font-semibold mb-3">Chart Type</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {['Bar Chart', 'Line Chart', 'Area Chart', 'Table'].map(t => (
                  <button
                    key={t}
                    onClick={() => setReportType(t)}
                    className={`text-xs px-2 py-2 rounded-lg border transition-all ${
                      reportType === t
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                        : 'border-[#2a2d3e] text-gray-500 hover:text-gray-300 hover:border-[#3a3d50]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule export */}
            <div className="card p-4">
              <h4 className="text-white text-sm font-semibold mb-3">Schedule Export</h4>
              <select className="input w-full text-xs mb-2 h-8">
                <option>One-time export</option>
                <option>Daily</option>
                <option>Weekly (Monday)</option>
                <option>Monthly</option>
              </select>
              <select className="input w-full text-xs mb-3 h-8">
                <option>CSV</option>
                <option>XLSX</option>
                <option>PDF</option>
                <option>BigQuery push</option>
                <option>Snowflake push</option>
              </select>
              <div className="flex gap-2">
                <button className="btn-primary text-xs h-8 flex-1">
                  <Save size={11} />
                  Save
                </button>
                <button className="btn-secondary text-xs h-8 flex-1">
                  <Play size={11} />
                  Run Now
                </button>
              </div>
            </div>
          </div>

          {/* Builder preview */}
          <div className="xl:col-span-3 space-y-4">
            {/* Config summary */}
            <div className="card p-4 flex flex-wrap items-center gap-3">
              <div>
                <span className="text-gray-500 text-xs font-medium mr-2">Metrics:</span>
                {selectedMetrics.map(m => (
                  <span key={m} className="badge-blue mr-1 mb-1">
                    {m}
                    <button onClick={() => toggleMetric(m)} className="ml-1 hover:text-white"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div>
                <span className="text-gray-500 text-xs font-medium mr-2">By:</span>
                {selectedDimensions.map(d => (
                  <span key={d} className="badge-purple mr-1 mb-1">
                    {d}
                    <button onClick={() => toggleDimension(d)} className="ml-1 hover:text-white"><X size={10} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chart preview */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">Preview: {reportType}</h3>
                  <p className="text-gray-500 text-xs">Showing {selectedMetrics.join(', ')} by {selectedDimensions.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-xs h-7 px-2.5">
                    <RefreshCw size={11} />
                    Refresh
                  </button>
                  <button className="btn-secondary text-xs h-7 px-2.5">
                    <Download size={11} />
                    Export
                  </button>
                </div>
              </div>
              {reportType === 'Line Chart' ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                    <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {selectedMetrics.slice(0, 3).map((m, i) => (
                      <Line key={m} type="monotone" dataKey={m} stroke={['#3d6bff', '#10b981', '#f59e0b'][i]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={sampleData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {selectedMetrics.slice(0, 3).map((m, i) => (
                      <Bar key={m} dataKey={m} fill={['#3d6bff', '#10b981', '#f59e0b'][i]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Data table preview */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#2a2d3e]">
                <span className="text-white font-semibold text-sm">Data Table Preview</span>
                <span className="text-gray-500 text-xs">4 rows · {selectedMetrics.length} columns</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2d3e]">
                      <th className="px-4 py-2.5 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">Channel</th>
                      {selectedMetrics.map(m => (
                        <th key={m} className="px-4 py-2.5 text-right text-gray-500 text-xs font-medium uppercase tracking-wider">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slaMetrics.map(s => (
                      <tr key={s.channel} className="table-row">
                        <td className="px-4 py-2.5 text-gray-300 text-sm">{s.channel}</td>
                        {selectedMetrics.map(m => (
                          <td key={m} className="px-4 py-2.5 text-right text-white text-sm font-medium">
                            {m === 'SLA %' ? `${s.actual}%` : m === 'Volume' ? s.volume.toLocaleString() : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
