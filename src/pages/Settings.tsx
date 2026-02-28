import { useState } from 'react';
import { Settings as SettingsIcon, Zap, Database, Bell, Shield, Users, Link, Check, AlertTriangle } from 'lucide-react';

type SettingsTab = 'Integrations' | 'Notifications' | 'Compliance Rules' | 'Team & Roles' | 'Data & Exports' | 'API & Webhooks';

const integrations = [
  { name: 'Intercom', description: 'Real-time agent state · Conversation sync', status: 'connected', icon: '💬' },
  { name: 'Google Calendar', description: 'Schedule sync · OOO import', status: 'connected', icon: '📅' },
  { name: 'Snowflake', description: 'Data warehouse export · Event streaming', status: 'connected', icon: '❄️' },
  { name: 'BigQuery', description: 'Analytics export · Scheduled push', status: 'disconnected', icon: '📊' },
  { name: 'Slack', description: 'Alert notifications · Schedule updates', status: 'disconnected', icon: '💡' },
  { name: 'Zendesk', description: 'Ticket data · CSAT import', status: 'disconnected', icon: '🎫' },
];

const complianceRules = [
  { label: 'Minimum break interval', value: '4 hours between shifts' },
  { label: 'Max consecutive working days', value: '5 days' },
  { label: 'Overtime cap (weekly)', value: '10 hours' },
  { label: 'Shift swap window', value: 'Same skill + Same week' },
  { label: 'Non-adherence alert threshold', value: '15 minutes' },
];

const notifSettings = [
  { label: 'SLA risk alerts', description: 'Notify when SLA drops below target', enabled: true },
  { label: 'Agent non-adherence', description: 'Alert when agents are off-schedule >15 min', enabled: true },
  { label: 'Shift swap requests', description: 'Notify managers on new swap requests', enabled: true },
  { label: 'Forecast anomalies', description: 'Alert on volume spikes >25% above forecast', enabled: false },
  { label: 'Weekly digest', description: 'Summary report every Monday 8AM', enabled: true },
];

const apiEndpoints = [
  { method: 'GET', path: '/v1/agents', description: 'List agents with current status' },
  { method: 'GET', path: '/v1/forecasts/:date', description: 'Retrieve forecast for a given date' },
  { method: 'POST', path: '/v1/schedules/shifts', description: 'Create or update a shift' },
  { method: 'GET', path: '/v1/adherence/report', description: 'Adherence report by team or agent' },
  { method: 'POST', path: '/v1/webhooks', description: 'Register an inbound webhook endpoint' },
];

const navItems: { icon: React.ComponentType<{ size: number }>; label: SettingsTab }[] = [
  { icon: Link, label: 'Integrations' },
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Compliance Rules' },
  { icon: Users, label: 'Team & Roles' },
  { icon: Database, label: 'Data & Exports' },
  { icon: Zap, label: 'API & Webhooks' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Integrations');
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [ruleValues, setRuleValues] = useState<Record<string, string>>(
    Object.fromEntries(complianceRules.map(r => [r.label, r.value]))
  );
  const [notifs, setNotifs] = useState(notifSettings);
  const [savedBanner, setSavedBanner] = useState(false);

  const showSaved = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const toggleNotif = (label: string) => {
    setNotifs(prev => prev.map(n => n.label === label ? { ...n, enabled: !n.enabled } : n));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon size={20} className="text-blue-400" />
          Settings
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage integrations, notifications, compliance rules, and access control</p>
      </div>

      {savedBanner && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 animate-fade-in">
          <Check size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm">Settings saved successfully.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left nav */}
        <div className="space-y-1">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={activeTab === label ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="lg:col-span-3 space-y-4">

          {/* Integrations */}
          {activeTab === 'Integrations' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-1">Integrations</h3>
              <p className="text-gray-500 text-xs mb-4">Connect your tools for real-time agent state sync and data export</p>
              <div className="space-y-3">
                {integrations.map(intg => (
                  <div key={intg.name} className="flex items-center gap-4 p-4 bg-[#22253a] rounded-xl border border-[#2a2d3e] hover:border-[#3a3d50] transition-colors">
                    <span className="text-2xl flex-shrink-0">{intg.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{intg.name}</div>
                      <div className="text-gray-500 text-xs">{intg.description}</div>
                    </div>
                    {intg.status === 'connected' ? (
                      <div className="flex items-center gap-2">
                        <span className="badge-green"><Check size={10} />Connected</span>
                        <button className="btn-secondary text-xs h-7 px-2.5">Configure</button>
                      </div>
                    ) : (
                      <button className="btn-primary text-xs h-8 px-3">Connect</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-1">Notification Preferences</h3>
              <p className="text-gray-500 text-xs mb-4">Control which alerts and digests are delivered to your team</p>
              <div className="space-y-0 divide-y divide-[#2a2d3e]">
                {notifs.map(n => (
                  <div key={n.label} className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-gray-200 text-sm font-medium">{n.label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{n.description}</div>
                    </div>
                    <button
                      onClick={() => toggleNotif(n.label)}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${n.enabled ? 'bg-blue-600' : 'bg-[#2a2d3e]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${n.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={showSaved} className="btn-primary text-xs h-8 mt-4">Save Preferences</button>
            </div>
          )}

          {/* Compliance Rules */}
          {activeTab === 'Compliance Rules' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-1">Compliance Rules</h3>
              <p className="text-gray-500 text-xs mb-4">These rules enforce labor law compliance and swap eligibility checks</p>
              <div className="space-y-0 divide-y divide-[#2a2d3e]">
                {complianceRules.map(rule => (
                  <div key={rule.label} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-gray-300 text-sm">{rule.label}</div>
                      {editingRule === rule.label ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingRule(null); showSaved(); }} className="text-emerald-400 text-xs hover:text-emerald-300">Save</button>
                          <button onClick={() => setEditingRule(null)} className="text-gray-500 text-xs hover:text-gray-300">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingRule(rule.label)} className="btn-secondary text-xs h-7 px-2.5">Edit</button>
                      )}
                    </div>
                    {editingRule === rule.label ? (
                      <input
                        className="input w-full text-sm h-8"
                        value={ruleValues[rule.label]}
                        onChange={e => setRuleValues(prev => ({ ...prev, [rule.label]: e.target.value }))}
                        autoFocus
                      />
                    ) : (
                      <div className="text-blue-400 text-xs font-medium">{ruleValues[rule.label]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team & Roles */}
          {activeTab === 'Team & Roles' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-1">Team & Roles</h3>
              <p className="text-gray-500 text-xs mb-4">Manage workspace members and their permission levels</p>
              <div className="space-y-2">
                {[
                  { name: 'Jordan Davis', email: 'jordan@company.com', role: 'WFM Manager', status: 'Active' },
                  { name: 'Alex Nkosi', email: 'alex@company.com', role: 'Supervisor', status: 'Active' },
                  { name: 'Mei Tanaka', email: 'mei@company.com', role: 'Analyst', status: 'Active' },
                  { name: 'Sam Patel', email: 'sam@company.com', role: 'Viewer', status: 'Invited' },
                ].map(member => (
                  <div key={member.email} className="flex items-center gap-3 p-3 bg-[#22253a] rounded-lg border border-[#2a2d3e]">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{member.name}</div>
                      <div className="text-gray-500 text-xs">{member.email}</div>
                    </div>
                    <span className="badge-blue">{member.role}</span>
                    <span className={member.status === 'Active' ? 'badge-green' : 'badge-yellow'}>{member.status}</span>
                    <button className="btn-secondary text-xs h-7 px-2">Edit</button>
                  </div>
                ))}
              </div>
              <button className="btn-primary text-xs h-8 mt-4">Invite Member</button>
            </div>
          )}

          {/* Data & Exports */}
          {activeTab === 'Data & Exports' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-1">Data & Exports</h3>
              <p className="text-gray-500 text-xs mb-4">Configure data retention, warehousing, and recurring export jobs</p>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1.5">Data retention period</label>
                  <select className="input text-sm h-9 w-64">
                    <option>24 months (recommended)</option>
                    <option>12 months</option>
                    <option>36 months</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1.5">Default export format</label>
                  <select className="input text-sm h-9 w-64">
                    <option>CSV</option>
                    <option>XLSX</option>
                    <option>JSON</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#22253a] rounded-xl border border-emerald-500/20">
                  <span className="text-2xl">❄️</span>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">Snowflake Streaming</div>
                    <div className="text-gray-500 text-xs">Event-driven updates · Near real-time</div>
                  </div>
                  <span className="badge-green"><Check size={10} />Active</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#22253a] rounded-xl border border-[#2a2d3e]">
                  <span className="text-2xl">📊</span>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">BigQuery Export</div>
                    <div className="text-gray-500 text-xs">Batch export · Not connected</div>
                  </div>
                  <button className="btn-primary text-xs h-8 px-3">Connect</button>
                </div>
                <button onClick={showSaved} className="btn-primary text-xs h-8">Save Settings</button>
              </div>
            </div>
          )}

          {/* API & Webhooks */}
          {activeTab === 'API & Webhooks' && (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-white font-semibold mb-1">API Access</h3>
                <p className="text-gray-500 text-xs mb-4">Use the REST API to integrate PulseOps with your own systems</p>
                <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-3 mb-4 font-mono text-xs text-gray-400">
                  <span className="text-gray-600">Base URL: </span>
                  <span className="text-blue-400">https://api.pulseops.io/v1</span>
                </div>
                <div className="space-y-2">
                  {apiEndpoints.map(ep => (
                    <div key={ep.path} className="flex items-center gap-3 p-3 bg-[#22253a] rounded-lg">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {ep.method}
                      </span>
                      <code className="text-gray-300 text-xs font-mono flex-shrink-0">{ep.path}</code>
                      <span className="text-gray-500 text-xs">{ep.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="text-white font-semibold mb-1">API Keys</h3>
                <p className="text-gray-500 text-xs mb-3">Manage authentication tokens for API access</p>
                <div className="flex items-center gap-3 p-3 bg-[#22253a] rounded-lg border border-[#2a2d3e] mb-3">
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm font-mono">sk_live_••••••••••••••••4f2a</div>
                    <div className="text-gray-600 text-xs mt-0.5">Created Feb 1, 2026 · Last used 2h ago</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-green">Active</span>
                    <button className="btn-secondary text-xs h-7 px-2">Revoke</button>
                  </div>
                </div>
                <button className="btn-primary text-xs h-8">Generate New Key</button>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 text-xs">Treat API keys like passwords. Never expose them in client-side code or public repositories.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
