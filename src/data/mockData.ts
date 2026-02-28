import type { Agent, MetricCard, ForecastPoint, SLAMetric, Team, ShiftSwapRequest, ReportTemplate, Notification } from '../types';

export const agents: Agent[] = [
  { id: 'a1', name: 'Sarah Chen', avatar: 'SC', team: 'Tier 1 Support', skills: ['Chat', 'Email', 'Billing'], status: 'available', scheduledStatus: 'available', adherenceScore: 97, shift: '9:00 AM – 5:00 PM', location: 'US East', site: 'HQ', lastActivity: '2m ago', currentTickets: 3, avgHandleTime: 4.2, slaImpact: 'positive' },
  { id: 'a2', name: 'Marcus Rivera', avatar: 'MR', team: 'Tier 2 Support', skills: ['Chat', 'Phone', 'Technical'], status: 'busy', scheduledStatus: 'busy', adherenceScore: 92, shift: '10:00 AM – 6:00 PM', location: 'US West', site: 'LA Office', lastActivity: 'now', currentTickets: 5, avgHandleTime: 7.1, slaImpact: 'neutral' },
  { id: 'a3', name: 'Priya Sharma', avatar: 'PS', team: 'Tier 1 Support', skills: ['Email', 'Social'], status: 'break', scheduledStatus: 'available', adherenceScore: 78, shift: '8:00 AM – 4:00 PM', location: 'EMEA', site: 'London', lastActivity: '18m ago', currentTickets: 0, avgHandleTime: 5.8, slaImpact: 'negative' },
  { id: 'a4', name: 'James Kim', avatar: 'JK', team: 'Escalations', skills: ['Phone', 'Technical', 'Billing'], status: 'available', scheduledStatus: 'available', adherenceScore: 99, shift: '11:00 AM – 7:00 PM', location: 'US East', site: 'HQ', lastActivity: '1m ago', currentTickets: 2, avgHandleTime: 12.4, slaImpact: 'positive' },
  { id: 'a5', name: 'Aisha Thompson', avatar: 'AT', team: 'Tier 1 Support', skills: ['Chat', 'Email'], status: 'training', scheduledStatus: 'training', adherenceScore: 100, shift: '9:00 AM – 5:00 PM', location: 'US East', site: 'HQ', lastActivity: '5m ago', currentTickets: 0, avgHandleTime: 3.9, slaImpact: 'neutral' },
  { id: 'a6', name: 'David Park', avatar: 'DP', team: 'Tier 2 Support', skills: ['Technical', 'Chat'], status: 'offline', scheduledStatus: 'available', adherenceScore: 61, shift: '9:00 AM – 5:00 PM', location: 'APAC', site: 'Singapore', lastActivity: '45m ago', currentTickets: 0, avgHandleTime: 8.3, slaImpact: 'negative' },
  { id: 'a7', name: 'Lena Fischer', avatar: 'LF', team: 'Escalations', skills: ['Email', 'Billing', 'Technical'], status: 'busy', scheduledStatus: 'busy', adherenceScore: 95, shift: '8:00 AM – 4:00 PM', location: 'EMEA', site: 'Berlin', lastActivity: 'now', currentTickets: 4, avgHandleTime: 9.2, slaImpact: 'positive' },
  { id: 'a8', name: 'Carlos Mendez', avatar: 'CM', team: 'Tier 1 Support', skills: ['Chat', 'Social', 'Email'], status: 'available', scheduledStatus: 'available', adherenceScore: 88, shift: '12:00 PM – 8:00 PM', location: 'LATAM', site: 'Bogotá', lastActivity: '3m ago', currentTickets: 6, avgHandleTime: 4.7, slaImpact: 'positive' },
];

export const metrics: MetricCard[] = [
  { id: 'm1', label: 'SLA Attainment', value: '94.2', unit: '%', change: 1.8, trend: 'up', risk: 'low', tooltip: 'Percentage of tickets resolved within target response time. Target: >95%', target: '95%' },
  { id: 'm2', label: 'Agents Online', value: '147', change: -3, trend: 'down', risk: 'medium', tooltip: 'Total agents currently clocked in and active across all channels', target: '150' },
  { id: 'm3', label: 'Adherence Rate', value: '88.5', unit: '%', change: -2.1, trend: 'down', risk: 'medium', tooltip: 'Average percentage of time agents are in their scheduled activity state. Target: >90%', target: '90%' },
  { id: 'm4', label: 'Queue Volume', value: '342', change: 28, trend: 'up', risk: 'high', tooltip: 'Total open conversations across all channels awaiting agent response', target: '250' },
  { id: 'm5', label: 'Avg Handle Time', value: '6.8', unit: 'min', change: -0.4, trend: 'down', risk: 'low', tooltip: 'Mean time from conversation start to resolution. Target: <8 min', target: '8 min' },
  { id: 'm6', label: 'Forecast Accuracy', value: '92.1', unit: '%', change: 3.2, trend: 'up', risk: 'low', tooltip: 'How closely actual volume matched today\'s AI forecast. Target: >90%', target: '90%' },
];

export const forecastData: ForecastPoint[] = [
  { time: '8:00', actual: 45, forecast: 42, upper: 52, lower: 35, staffed: 48 },
  { time: '8:30', actual: 58, forecast: 55, upper: 65, lower: 48, staffed: 60 },
  { time: '9:00', actual: 82, forecast: 78, upper: 90, lower: 68, staffed: 85 },
  { time: '9:30', actual: 105, forecast: 98, upper: 112, lower: 86, staffed: 100 },
  { time: '10:00', actual: 128, forecast: 125, upper: 140, lower: 110, staffed: 130 },
  { time: '10:30', actual: 142, forecast: 138, upper: 155, lower: 122, staffed: 145 },
  { time: '11:00', actual: 157, forecast: 152, upper: 168, lower: 138, staffed: 155 },
  { time: '11:30', actual: 168, forecast: 160, upper: 178, lower: 144, staffed: 165 },
  { time: '12:00', actual: 145, forecast: 148, upper: 165, lower: 132, staffed: 150 },
  { time: '12:30', actual: 132, forecast: 140, upper: 158, lower: 124, staffed: 140 },
  { time: '13:00', actual: 120, forecast: 128, upper: 145, lower: 112, staffed: 130 },
  { time: '13:30', actual: 138, forecast: 135, upper: 152, lower: 120, staffed: 140 },
  { time: '14:00', actual: 152, forecast: 148, upper: 168, lower: 130, staffed: 155 },
  { time: '14:30', actual: 167, forecast: 158, upper: 178, lower: 140, staffed: 165 },
  { time: '15:00', actual: 174, forecast: 165, upper: 185, lower: 148, staffed: 170 },
  { time: '15:30', actual: 162, forecast: 158, upper: 178, lower: 140, staffed: 165 },
  { time: '16:00', actual: 148, forecast: 145, upper: 162, lower: 130, staffed: 150 },
  { time: '16:30', actual: 130, forecast: 132, upper: 148, lower: 118, staffed: 135 },
  { time: '17:00', actual: 112, forecast: 115, upper: 130, lower: 102, staffed: 118 },
  { time: '17:30', actual: 95, forecast: 98, upper: 112, lower: 86, staffed: 100 },
  { time: '18:00', actual: 78, forecast: 82, upper: 95, lower: 70, staffed: 85 },
  { time: '18:30', actual: 65, forecast: 68, upper: 80, lower: 58, staffed: 72 },
  { time: '19:00', actual: 52, forecast: 55, upper: 65, lower: 46, staffed: 58 },
  { time: '19:30', actual: null, forecast: 45, upper: 55, lower: 36, staffed: 48 },
];

export const weeklyForecast = [
  { day: 'Mon', volume: 1420, forecast: 1380, accuracy: 97.3 },
  { day: 'Tue', volume: 1650, forecast: 1620, accuracy: 98.2 },
  { day: 'Wed', volume: 1540, forecast: 1580, accuracy: 97.5 },
  { day: 'Thu', volume: 1780, forecast: 1750, accuracy: 98.3 },
  { day: 'Fri', volume: 1920, forecast: 1880, accuracy: 97.9 },
  { day: 'Sat', volume: 980, forecast: 1020, accuracy: 96.1 },
  { day: 'Sun', volume: 720, forecast: 690, accuracy: 95.8 },
];

export const slaMetrics: SLAMetric[] = [
  { channel: 'Live Chat', target: 95, actual: 97.2, risk: 'low', volume: 482 },
  { channel: 'Email', target: 90, actual: 88.4, risk: 'medium', volume: 1240 },
  { channel: 'Social', target: 85, actual: 79.1, risk: 'high', volume: 318 },
  { channel: 'Phone', target: 92, actual: 94.8, risk: 'low', volume: 204 },
];

export const teams: Team[] = [
  { id: 't1', name: 'Tier 1 Support', site: 'HQ', agents: 45, activeAgents: 42, slaScore: 97.2, adherenceScore: 91.4, forecastAccuracy: 94.2, risk: 'low' },
  { id: 't2', name: 'Tier 2 Support', site: 'LA Office', agents: 28, activeAgents: 25, slaScore: 93.8, adherenceScore: 88.9, forecastAccuracy: 92.1, risk: 'medium' },
  { id: 't3', name: 'Escalations', site: 'HQ + Berlin', agents: 12, activeAgents: 11, slaScore: 89.4, adherenceScore: 95.2, forecastAccuracy: 91.5, risk: 'medium' },
  { id: 't4', name: 'APAC Team', site: 'Singapore', agents: 22, activeAgents: 18, slaScore: 85.2, adherenceScore: 78.3, forecastAccuracy: 88.4, risk: 'high' },
  { id: 't5', name: 'EMEA Team', site: 'London + Berlin', agents: 31, activeAgents: 30, slaScore: 96.1, adherenceScore: 93.8, forecastAccuracy: 95.3, risk: 'low' },
  { id: 't6', name: 'LATAM BPO', site: 'Bogotá', agents: 18, activeAgents: 15, slaScore: 81.4, adherenceScore: 76.2, forecastAccuracy: 85.2, risk: 'high' },
];

export const shiftSwaps: ShiftSwapRequest[] = [
  { id: 'sw1', agentName: 'Sarah Chen', agentId: 'a1', fromShift: 'Tue 9AM–5PM', toShift: 'Tue 1PM–9PM', date: '2026-03-04', reason: 'Medical appointment', status: 'pending', complianceOk: true },
  { id: 'sw2', agentName: 'Marcus Rivera', agentId: 'a2', fromShift: 'Wed 10AM–6PM', toShift: 'Wed 8AM–4PM', date: '2026-03-05', reason: 'Family event', status: 'pending', complianceOk: true },
  { id: 'sw3', agentName: 'David Park', agentId: 'a6', fromShift: 'Mon 9AM–5PM', toShift: 'Mon 5PM–1AM', date: '2026-03-03', reason: 'Personal preference', status: 'pending', complianceOk: false },
  { id: 'sw4', agentName: 'Priya Sharma', agentId: 'a3', fromShift: 'Fri 8AM–4PM', toShift: 'Sat 8AM–4PM', date: '2026-03-06', reason: 'Personal errand', status: 'approved', complianceOk: true },
  { id: 'sw5', agentName: 'Carlos Mendez', agentId: 'a8', fromShift: 'Thu 12PM–8PM', toShift: 'Thu 8AM–4PM', date: '2026-03-07', reason: 'Course attendance', status: 'rejected', complianceOk: true },
];

export const reportTemplates: ReportTemplate[] = [
  { id: 'r1', name: 'Daily SLA Report', description: 'SLA attainment by channel, team, and interval', metrics: ['SLA %', 'Volume', 'AHT', 'CSAT'], lastRun: '2h ago', schedule: 'Daily 7:00 AM', category: 'SLA' },
  { id: 'r2', name: 'Agent Adherence Summary', description: 'Per-agent adherence breakdown with root causes', metrics: ['Adherence %', 'Non-adherence reason', 'Duration'], lastRun: '6h ago', schedule: 'Daily 9:00 AM', category: 'Adherence' },
  { id: 'r3', name: 'Weekly Forecast vs Actual', description: 'Forecast accuracy analysis across all teams', metrics: ['Forecast', 'Actual', 'Variance %', 'Confidence interval'], lastRun: '2d ago', schedule: 'Weekly Monday', category: 'Forecasting' },
  { id: 'r4', name: 'BPO Performance Dashboard', description: 'Vendor/BPO comparison with cost per ticket', metrics: ['SLA %', 'Cost/ticket', 'Volume', 'Adherence'], lastRun: '1d ago', category: 'BPO' },
  { id: 'r5', name: 'Scheduling Efficiency', description: 'Overstaffing and understaffing analysis by interval', metrics: ['Scheduled agents', 'Required agents', 'Gap', 'OT impact'], lastRun: '4h ago', schedule: 'Daily 8:00 AM', category: 'Scheduling' },
  { id: 'r6', name: 'Cost per Interaction', description: 'Cost breakdown by channel, skill, site, and vendor', metrics: ['Cost/chat', 'Cost/email', 'Cost/call', 'Total labor cost'], lastRun: '3d ago', schedule: 'Weekly Friday', category: 'Finance' },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'warning', message: 'APAC Team adherence dropped below 80% — 4 agents offline', time: '3m ago', read: false },
  { id: 'n2', type: 'error', message: 'Social channel SLA at risk: 79.1% vs 85% target', time: '8m ago', read: false },
  { id: 'n3', type: 'info', message: '3 shift swap requests pending approval', time: '15m ago', read: false },
  { id: 'n4', type: 'warning', message: 'Queue volume 37% above forecast — consider overflow routing', time: '22m ago', read: true },
  { id: 'n5', type: 'success', message: 'Email SLA recovered to 92% after routing adjustment', time: '45m ago', read: true },
  { id: 'n6', type: 'info', message: 'Weekly forecast model retrained with latest 30-day data', time: '2h ago', read: true },
];

export const adherenceTimeline = [
  { time: '08:00', scheduled: 'Available', actual: 'Available', match: true },
  { time: '08:30', scheduled: 'Available', actual: 'Available', match: true },
  { time: '09:00', scheduled: 'Busy', actual: 'Busy', match: true },
  { time: '09:30', scheduled: 'Busy', actual: 'Break', match: false },
  { time: '10:00', scheduled: 'Available', actual: 'Available', match: true },
  { time: '10:30', scheduled: 'Available', actual: 'Available', match: true },
  { time: '11:00', scheduled: 'Break', actual: 'Break', match: true },
  { time: '11:30', scheduled: 'Available', actual: 'Available', match: true },
  { time: '12:00', scheduled: 'Meeting', actual: 'Meeting', match: true },
  { time: '12:30', scheduled: 'Lunch', actual: 'Lunch', match: true },
  { time: '13:00', scheduled: 'Available', actual: 'Offline', match: false },
  { time: '13:30', scheduled: 'Available', actual: 'Available', match: true },
];

export const channelDistribution = [
  { name: 'Live Chat', value: 42, color: '#3d6bff' },
  { name: 'Email', value: 31, color: '#6366f1' },
  { name: 'Social', value: 17, color: '#8b5cf6' },
  { name: 'Phone', value: 10, color: '#a78bfa' },
];

export const agentBadges = [
  { icon: '🎯', label: 'Perfect Week', description: '100% adherence for 5 days', earned: true },
  { icon: '⚡', label: 'Fast Responder', description: 'Sub-3min AHT for 30+ chats', earned: true },
  { icon: '🤝', label: 'Team Player', description: 'Accepted 5+ shift swaps', earned: true },
  { icon: '🌟', label: '90-Day Streak', description: 'Adherence >90% for 90 days', earned: false },
  { icon: '🏆', label: 'SLA Champion', description: 'Personal SLA >98% for a month', earned: false },
];

export const scheduleData = Array.from({ length: 7 }, (_, dayIndex) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shifts = [
    { agent: 'Sarah Chen', start: 9, end: 17, team: 'Tier 1', color: 'bg-blue-600/70' },
    { agent: 'Marcus Rivera', start: 10, end: 18, team: 'Tier 2', color: 'bg-purple-600/70' },
    { agent: 'James Kim', start: 11, end: 19, team: 'Escalations', color: 'bg-emerald-600/70' },
    { agent: 'Aisha Thompson', start: 9, end: 17, team: 'Tier 1', color: 'bg-blue-600/70' },
    { agent: 'Carlos Mendez', start: 12, end: 20, team: 'Tier 1', color: 'bg-blue-600/70' },
    { agent: 'Lena Fischer', start: 8, end: 16, team: 'Escalations', color: 'bg-emerald-600/70' },
  ];
  return { day: days[dayIndex], shifts };
});
