import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { MetricCard as MetricCardType } from '../../types';

const riskBorder: Record<string, string> = {
  low: 'border-emerald-500/20',
  medium: 'border-amber-500/30',
  high: 'border-red-500/40',
  critical: 'border-red-600/60',
};

const riskBadge: Record<string, string> = {
  low: 'badge-green',
  medium: 'badge-yellow',
  high: 'badge-red',
  critical: 'badge-red',
};

export default function MetricCardComponent({ metric }: { metric: MetricCardType }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.risk === 'low'
    ? 'text-emerald-400'
    : metric.risk === 'medium'
    ? 'text-amber-400'
    : 'text-red-400';

  return (
    <div className={`metric-card border ${riskBorder[metric.risk]} relative overflow-visible group`}>
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{metric.label}</span>
        <div className="flex items-center gap-2">
          <span className={riskBadge[metric.risk]}>
            {metric.risk === 'low' ? '✓ On Track' : metric.risk === 'medium' ? '⚠ Watch' : '✕ At Risk'}
          </span>
          <button
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info size={13} className="text-gray-600 hover:text-gray-400 transition-colors" />
            {showTooltip && (
              <div className="absolute right-0 top-6 z-50 bg-[#0f1117] border border-[#2a2d3e] text-gray-300 text-xs rounded-lg px-3 py-2 shadow-2xl w-56 pointer-events-none animate-fade-in">
                <p className="font-medium text-white mb-1">{metric.label}</p>
                <p>{metric.tooltip}</p>
                {metric.target && (
                  <p className="mt-1 text-gray-500">Target: <span className="text-blue-400">{metric.target}</span></p>
                )}
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="stat-value">
            {metric.value}
            {metric.unit && <span className="text-lg text-gray-400 ml-0.5">{metric.unit}</span>}
          </div>
          {metric.target && (
            <div className="text-gray-500 text-xs mt-0.5">
              Target: <span className="text-gray-400">{metric.target}</span>
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-sm font-medium">
            {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit === '%' ? 'pp' : metric.unit ? metric.unit : ''}
          </span>
        </div>
      </div>

      {/* Progress bar for percentage metrics */}
      {metric.unit === '%' && (
        <div className="mt-3">
          <div className="h-1 bg-[#2a2d3e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metric.risk === 'low' ? 'bg-emerald-500' :
                metric.risk === 'medium' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(Number(metric.value), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
