export type AgentStatus = 'available' | 'busy' | 'break' | 'offline' | 'training' | 'meeting';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Channel = 'chat' | 'email' | 'phone' | 'social';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  team: string;
  skills: string[];
  status: AgentStatus;
  scheduledStatus: AgentStatus;
  adherenceScore: number;
  shift: string;
  location: string;
  site: string;
  lastActivity: string;
  currentTickets: number;
  avgHandleTime: number;
  slaImpact: 'positive' | 'neutral' | 'negative';
}

export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  risk: RiskLevel;
  tooltip: string;
  target?: string | number;
}

export interface ForecastPoint {
  time: string;
  actual: number | null;
  forecast: number;
  upper: number;
  lower: number;
  staffed: number;
}

export interface SLAMetric {
  channel: string;
  target: number;
  actual: number;
  risk: RiskLevel;
  volume: number;
}

export interface Team {
  id: string;
  name: string;
  site: string;
  agents: number;
  activeAgents: number;
  slaScore: number;
  adherenceScore: number;
  forecastAccuracy: number;
  risk: RiskLevel;
}

export interface ShiftSwapRequest {
  id: string;
  agentName: string;
  agentId: string;
  fromShift: string;
  toShift: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  complianceOk: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  lastRun: string;
  schedule?: string;
  category: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
  read: boolean;
}
