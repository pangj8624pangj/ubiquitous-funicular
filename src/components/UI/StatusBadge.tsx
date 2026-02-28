import type { AgentStatus } from '../../types';

const statusConfig: Record<AgentStatus, { label: string; color: string; dot: string }> = {
  available: { label: 'Available', color: 'text-emerald-400 bg-emerald-500/15', dot: 'bg-emerald-400' },
  busy: { label: 'Busy', color: 'text-blue-400 bg-blue-500/15', dot: 'bg-blue-400' },
  break: { label: 'On Break', color: 'text-amber-400 bg-amber-500/15', dot: 'bg-amber-400' },
  offline: { label: 'Offline', color: 'text-gray-500 bg-gray-500/15', dot: 'bg-gray-500' },
  training: { label: 'Training', color: 'text-purple-400 bg-purple-500/15', dot: 'bg-purple-400' },
  meeting: { label: 'Meeting', color: 'text-indigo-400 bg-indigo-500/15', dot: 'bg-indigo-400' },
};

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
