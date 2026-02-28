import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Brain, Plus, Download, RefreshCw, ChevronRight, AlertTriangle, TrendingUp, Sliders, Save } from 'lucide-react';
import { forecastData, weeklyForecast } from '../data/mockData';

const scenarios = [
  { id: 's1', name: 'Baseline', description: 'Current AI forecast', active: true, accuracy: '92.1%', color: '#3d6bff' },
  { id: 's2', name: 'Product Launch +30%', description: 'Mar 15 campaign uplift', active: false, accuracy: '88.4%', color: '#8b5cf6' },
  { id: 's3', name: 'BPO Outage Scenario', description: 'Bogotá site offline', active: false, accuracy: '85.2%', color: '#f59e0b' },
];

const channelBreakdown = [
  { channel: 'Live Chat', today: 482, forecast: 510, wow: 12.4, trend: 'up' },
  { channel: 'Email', today: 1240, forecast: 1180, wow: -4.8, trend: 'down' },
  { channel: 'Social', today: 318, forecast: 350, wow: 10.1, trend: 'up' },
  { channel: 'Phone', today: 204, forecast: 195, wow: -4.4, trend: 'down' },
];

const features = [
  { name: 'Day of week', importance: 94 },
  { name: 'Trailing 4-week avg', importance: 87 },
  { name: 'Holiday proximity', importance: 71 },
  { name: 'Campaign activity', importance: 58 },
  { name: 'Product release', importance: 43 },
  { name: 'Weather events', importance: 21 },
];

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

export default function Forecasting() {
  const [activeScenario, setActiveScenario] = useState('s1');
  const [horizon, setHorizon] = useState('Day');
  const [granularity, setGranularity] = useState('30m');
  const [channel, setChannel] = useState('All Channels');
  const [showWhatIf, setShowWhatIf] = useState(false);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain size={20} className="text-blue-400" />
            AI Forecasting Engine
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Explainable forecasts · Scenario planning · Export-ready</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowWhatIf(!showWhatIf)} className="btn-secondary h-9">
            <Sliders size={14} />
            What-If Scenario
          </button>
          <button className="btn-primary h-9">
            <RefreshCw size={14} />
            Regenerate
          </button>
          <button className="btn-secondary h-9">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Horizon:</span>
          <div className="flex items-center gap-1 bg-[#22253a] rounded-lg p-1">
            {['Day', 'Week', 'Month'].map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${horizon === h ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Granularity:</span>
          <div className="flex items-center gap-1 bg-[#22253a] rounded-lg p-1">
            {['15m', '30m', '60m'].map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${granularity === g ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Channel:</span>
          <select
            className="input text-xs h-8 px-2 pr-7"
            value={channel}
            onChange={e => setChannel(e.target.value)}
          >
            {['All Channels', 'Live Chat', 'Email', 'Social', 'Phone'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="badge-green">Model accuracy: 92.1%</div>
          <div className="badge-blue">24mo training data</div>
        </div>
      </div>

      {/* What-If panel */}
      {showWhatIf && (
        <div className="card p-5 border-blue-500/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Sliders size={16} className="text-blue-400" />
              What-If Scenario Configurator
            </h3>
            <button onClick={() => setShowWhatIf(false)} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Event Type</label>
              <select className="input w-full text-sm">
                <option>Marketing Campaign</option>
                <option>Product Launch</option>
                <option>BPO Outage</option>
                <option>Holiday / Seasonal</option>
                <option>Custom Override</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Volume Impact</label>
              <div className="flex items-center gap-2">
                <input type="range" min="-50" max="100" defaultValue="30" className="flex-1" />
                <span className="text-blue-400 font-semibold text-sm w-12">+30%</span>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Date Range</label>
              <input type="date" className="input w-full text-sm" defaultValue="2026-03-15" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-primary h-8 text-xs">
              <RefreshCw size={12} />
              Apply &amp; Regenerate
            </button>
            <button className="btn-secondary h-8 text-xs">
              <Save size={12} />
              Save Scenario
            </button>
            <span className="text-gray-500 text-xs">Regeneration takes &lt;60 seconds</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main forecast chart */}
        <div className="card p-5 xl:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-white font-semibold">Inbound Volume Forecast</h3>
              <p className="text-gray-500 text-xs mt-0.5">Shaded area = 90% confidence interval</p>
            </div>
            <div className="flex items-center gap-1">
              {scenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    activeScenario === s.id
                      ? 'border-blue-500/40 bg-blue-500/10 text-white'
                      : 'border-[#2a2d3e] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={forecastData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d6bff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3d6bff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fgBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#fgBand)" name="Upper CI" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#0f1117" name="Lower CI" />
                <Area type="monotone" dataKey="forecast" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 3" fill="none" name="Forecast" dot={false} />
                <Area type="monotone" dataKey="actual" stroke="#3d6bff" strokeWidth={2} fill="url(#fg1)" name="Actual" dot={false} />
                <Area type="monotone" dataKey="staffed" stroke="#10b981" strokeWidth={1.5} fill="none" name="Required staff" dot={false} />
                <ReferenceLine x="19:30" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Now', fill: '#f59e0b', fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly bar */}
          <div className="mt-5 pt-4 border-t border-[#2a2d3e]">
            <p className="text-gray-400 text-xs font-medium mb-3">Weekly Volume Trend</p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={weeklyForecast} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#3d6bff" radius={[3, 3, 0, 0]} name="Actual" opacity={0.8} />
                <Bar dataKey="forecast" fill="#6b7280" radius={[3, 3, 0, 0]} name="Forecast" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side panel: explainability + channel */}
        <div className="space-y-4">
          {/* Model explainability */}
          <div className="card p-4">
            <h4 className="text-white text-sm font-semibold mb-1">Model Features</h4>
            <p className="text-gray-500 text-xs mb-3">Top contributing factors</p>
            <div className="space-y-2.5">
              {features.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">{f.name}</span>
                    <span className="text-gray-300 text-xs font-medium">{f.importance}%</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${f.importance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-xs font-medium">Anomaly detected</p>
              <p className="text-gray-400 text-xs mt-0.5">Email spike at 15:00 linked to product outage communication</p>
            </div>
          </div>

          {/* Channel breakdown */}
          <div className="card p-4">
            <h4 className="text-white text-sm font-semibold mb-3">Channel Forecast</h4>
            <div className="space-y-3">
              {channelBreakdown.map(c => (
                <div key={c.channel} className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-300 text-xs font-medium">{c.channel}</div>
                    <div className="text-gray-500 text-xs">{c.today} today</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">{c.forecast} fcst</div>
                    <div className={`text-xs ${c.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {c.wow > 0 ? '+' : ''}{c.wow}% WoW
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white text-sm font-semibold">Scenarios</h4>
              <button className="text-blue-400 text-xs hover:text-blue-300">+ New</button>
            </div>
            <div className="space-y-2">
              {scenarios.map(s => (
                <div
                  key={s.id}
                  onClick={() => setActiveScenario(s.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer border transition-all ${
                    activeScenario === s.id ? 'bg-blue-500/10 border-blue-500/30' : 'border-transparent hover:bg-[#22253a]'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: s.color }} />
                  <div className="flex-1">
                    <div className="text-white text-xs font-medium">{s.name}</div>
                    <div className="text-gray-500 text-xs">{s.description}</div>
                  </div>
                  <div className="badge-blue text-[10px]">{s.accuracy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
