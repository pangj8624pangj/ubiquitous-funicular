import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Zap, Database, Bell, Shield, Users, Link, Check, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { intercomService } from '../services/intercom';

type SettingsTab = 'Integrations' | 'Notifications' | 'Compliance Rules' | 'Team & Roles' | 'Data & Exports' | 'API & Webhooks';

const integrations = [
  { name: 'Intercom', description: 'Real-time agent state · Conversation sync', defaultStatus: 'connected', icon: '💬' },
  { name: 'Google Calendar', description: 'Schedule sync · OOO import', defaultStatus: 'connected', icon: '📅' },
  { name: 'Snowflake', description: 'Data warehouse export · Event streaming', defaultStatus: 'connected', icon: '❄️' },
  { name: 'BigQuery', description: 'Analytics export · Scheduled push', defaultStatus: 'disconnected', icon: '📊' },
  { name: 'Slack', description: 'Alert notifications · Schedule updates', defaultStatus: 'disconnected', icon: '💡' },
  { name: 'Zendesk', description: 'Ticket data · CSAT import', defaultStatus: 'disconnected', icon: '🎫' },
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

const initialMembers = [
  { name: 'Jordan Davis', email: 'jordan@company.com', role: 'WFM Manager', status: 'Active' },
  { name: 'Alex Nkosi', email: 'alex@company.com', role: 'Supervisor', status: 'Active' },
  { name: 'Mei Tanaka', email: 'mei@company.com', role: 'Analyst', status: 'Active' },
  { name: 'Sam Patel', email: 'sam@company.com', role: 'Viewer', status: 'Invited' },
];

const initialApiKeys = [
  { id: 'k1', key: 'sk_live_••••••••••••••••4f2a', created: 'Feb 1, 2026', lastUsed: '2h ago', active: true },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Integrations');
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [ruleValues, setRuleValues] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('pulseops_ruleValues');
      return stored ? JSON.parse(stored) : Object.fromEntries(complianceRules.map(r => [r.label, r.value]));
    } catch {
      return Object.fromEntries(complianceRules.map(r => [r.label, r.value]));
    }
  });
  const [notifs, setNotifs] = useState<typeof notifSettings>(() => {
    try {
      const stored = localStorage.getItem('pulseops_notifs');
      return stored ? JSON.parse(stored) : notifSettings;
    } catch {
      return notifSettings;
    }
  });
  const [savedBanner, setSavedBanner] = useState(false);

  // Intercom-specific state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);
  const [intercomMeInfo, setIntercomMeInfo] = useState<{ name: string; workspace: string } | null>(null);

  // Check server reachability whenever the Integrations tab is active
  useEffect(() => {
    if (activeTab === 'Integrations') {
      intercomService.isServerReachable().then(setServerReachable);
    }
  }, [activeTab]);

  // Integration state
  const [intgStatus, setIntgStatus] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('pulseops_intg_status');
      return stored ? JSON.parse(stored) : Object.fromEntries(integrations.map(i => [i.name, i.defaultStatus]));
    } catch {
      return Object.fromEntries(integrations.map(i => [i.name, i.defaultStatus]));
    }
  });
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<string | null>(null);
  const [connectForm, setConnectForm] = useState({ key: '', secret: '' });

  // Team & roles state
  const [members, setMembers] = useState<typeof initialMembers>(() => {
    try {
      const stored = localStorage.getItem('pulseops_members');
      return stored ? JSON.parse(stored) : initialMembers;
    } catch {
      return initialMembers;
    }
  });
  const [editMember, setEditMember] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Viewer' });

  // API keys state
  const [apiKeys, setApiKeys] = useState<typeof initialApiKeys>(() => {
    try {
      const stored = localStorage.getItem('pulseops_api_keys');
      return stored ? JSON.parse(stored) : initialApiKeys;
    } catch {
      return initialApiKeys;
    }
  });

  // Data & exports state
  const [retention, setRetention] = useState(() => {
    try { return localStorage.getItem('pulseops_retention') || '24 months (recommended)'; } catch { return '24 months (recommended)'; }
  });
  const [exportFmt, setExportFmt] = useState(() => {
    try { return localStorage.getItem('pulseops_export_fmt') || 'CSV'; } catch { return 'CSV'; }
  });

  const showSaved = () => {
    try {
      localStorage.setItem('pulseops_notifs', JSON.stringify(notifs));
      localStorage.setItem('pulseops_ruleValues', JSON.stringify(ruleValues));
      localStorage.setItem('pulseops_retention', retention);
      localStorage.setItem('pulseops_export_fmt', exportFmt);
      localStorage.setItem('pulseops_members', JSON.stringify(members));
      localStorage.setItem('pulseops_intg_status', JSON.stringify(intgStatus));
    } catch {
      // localStorage unavailable (e.g. private browsing quota exceeded)
    }
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const toggleNotif = (label: string) => {
    setNotifs(prev => prev.map(n => n.label === label ? { ...n, enabled: !n.enabled } : n));
  };

  const handleConnect = async (name: string) => {
    if (name === 'Intercom') {
      // Real Intercom connection via the proxy server
      setIsConnecting(true);
      setConnectError(null);
      try {
        await intercomService.setToken(connectForm.key);
        const me = await intercomService.getMe();
        setIntercomMeInfo({ name: me.name, workspace: me.app?.name ?? 'Intercom' });
        const updated = { ...intgStatus, Intercom: 'connected' };
        setIntgStatus(updated);
        try { localStorage.setItem('pulseops_intg_status', JSON.stringify(updated)); } catch {}
        setConnectModal(null);
        setConnectForm({ key: '', secret: '' });
        setSavedBanner(true);
        setTimeout(() => setSavedBanner(false), 3000);
      } catch (err) {
        setConnectError(err instanceof Error ? err.message : 'Connection failed – check your token');
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Generic mock connection for other integrations
      const updated = { ...intgStatus, [name]: 'connected' };
      setIntgStatus(updated);
      try { localStorage.setItem('pulseops_intg_status', JSON.stringify(updated)); } catch {}
      setConnectModal(null);
      setConnectForm({ key: '', secret: '' });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    }
  };

  const handleDisconnect = (name: string) => {
    if (name === 'Intercom') {
      intercomService.disconnect().catch(() => {});
      setIntercomMeInfo(null);
    }
    const updated = { ...intgStatus, [name]: 'disconnected' };
    setIntgStatus(updated);
    try { localStorage.setItem('pulseops_intg_status', JSON.stringify(updated)); } catch {}
    setConfigModal(null);
  };

  const handleSaveConfig = () => {
    setConfigModal(null);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleInvite = () => {
    if (!inviteForm.email.trim()) return;
    const newMember = {
      name: inviteForm.name || inviteForm.email.split('@')[0],
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'Invited',
    };
    const updated = [...members, newMember];
    setMembers(updated);
    try { localStorage.setItem('pulseops_members', JSON.stringify(updated)); } catch {}
    setShowInviteModal(false);
    setInviteForm({ name: '', email: '', role: 'Viewer' });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleEditRole = (email: string) => {
    const updated = members.map(m => m.email === email ? { ...m, role: editRole } : m);
    setMembers(updated);
    try { localStorage.setItem('pulseops_members', JSON.stringify(updated)); } catch {}
    setEditMember(null);
  };

  const generateKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    const newKey = { id: `k-${Date.now()}`, key: `sk_live_••••••••••••••••${suffix}`, created: 'Feb 28, 2026', lastUsed: 'never', active: true };
    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    try { localStorage.setItem('pulseops_api_keys', JSON.stringify(updated)); } catch {}
  };

  const revokeKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    try { localStorage.setItem('pulseops_api_keys', JSON.stringify(updated)); } catch {}
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
                    {intgStatus[intg.name] === 'connected' ? (
                      <div className="flex items-center gap-2">
                        <span className="badge-green"><Check size={10} />Connected</span>
                        <button onClick={() => setConfigModal(intg.name)} className="btn-secondary text-xs h-7 px-2.5">Configure</button>
                      </div>
                    ) : (
                      <button onClick={() => setConnectModal(intg.name)} className="btn-primary text-xs h-8 px-3">Connect</button>
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
                {members.map(member => (
                  <div key={member.email} className="flex items-center gap-3 p-3 bg-[#22253a] rounded-lg border border-[#2a2d3e]">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{member.name}</div>
                      <div className="text-gray-500 text-xs">{member.email}</div>
                    </div>
                    {editMember === member.email ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="input text-xs h-7 py-0 pr-6"
                          value={editRole}
                          onChange={e => setEditRole(e.target.value)}
                        >
                          {['Viewer', 'Analyst', 'Supervisor', 'WFM Manager'].map(r => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <button onClick={() => handleEditRole(member.email)} className="text-emerald-400 text-xs hover:text-emerald-300">Save</button>
                        <button onClick={() => setEditMember(null)} className="text-gray-500 text-xs hover:text-gray-300">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <span className="badge-blue">{member.role}</span>
                        <span className={member.status === 'Active' ? 'badge-green' : 'badge-yellow'}>{member.status}</span>
                        <button onClick={() => { setEditMember(member.email); setEditRole(member.role); }} className="btn-secondary text-xs h-7 px-2">Edit</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowInviteModal(true)} className="btn-primary text-xs h-8 mt-4">Invite Member</button>
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
                  <select className="input text-sm h-9 w-64" value={retention} onChange={e => setRetention(e.target.value)}>
                    <option>24 months (recommended)</option>
                    <option>12 months</option>
                    <option>36 months</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1.5">Default export format</label>
                  <select className="input text-sm h-9 w-64" value={exportFmt} onChange={e => setExportFmt(e.target.value)}>
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
                  <button onClick={() => { setActiveTab('Integrations'); }} className="btn-primary text-xs h-8 px-3">Connect</button>
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
                {apiKeys.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-3">No active keys. Generate one below.</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {apiKeys.map(k => (
                      <div key={k.id} className="flex items-center gap-3 p-3 bg-[#22253a] rounded-lg border border-[#2a2d3e]">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm font-mono">{k.key}</div>
                          <div className="text-gray-600 text-xs mt-0.5">Created {k.created} · Last used {k.lastUsed}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge-green">Active</span>
                          <button onClick={() => revokeKey(k.id)} className="btn-secondary text-xs h-7 px-2">Revoke</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={generateKey} className="btn-primary text-xs h-8">Generate New Key</button>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 text-xs">Treat API keys like passwords. Never expose them in client-side code or public repositories.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connect modal */}
      {connectModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setConnectModal(null); setConnectForm({ key: '', secret: '' }); setConnectError(null); }}
        >
          <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Connect {connectModal}</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {connectModal === 'Intercom'
                    ? 'Authenticate with your Intercom Personal Access Token'
                    : 'Enter your API credentials to authorize PulseOps'}
                </p>
              </div>
              <button
                onClick={() => { setConnectModal(null); setConnectForm({ key: '', secret: '' }); setConnectError(null); }}
                className="text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {connectModal === 'Intercom' ? (
              /* ── Real Intercom connect form ─────────────────────────────── */
              <div className="space-y-4">
                {serverReachable === false && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                    <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-300 text-xs font-medium">Proxy server not running</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Start it first: <code className="text-blue-400">npm run server</code>
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 space-y-1">
                  <p className="font-medium">How to get your Personal Access Token:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
                    <li>Open the <a href="https://app.intercom.com/a/apps/_/developer-hub" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">Intercom Developer Hub <ExternalLink size={10} /></a></li>
                    <li>Select your app → <strong className="text-gray-300">Basic Information</strong></li>
                    <li>Copy the <strong className="text-gray-300">Access Token</strong></li>
                  </ol>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1">
                    Personal Access Token
                  </label>
                  <input
                    type="password"
                    className="input w-full text-sm h-9 font-mono"
                    placeholder="dG9rO…"
                    value={connectForm.key}
                    onChange={e => { setConnectForm(f => ({ ...f, key: e.target.value })); setConnectError(null); }}
                    autoFocus
                    disabled={isConnecting}
                  />
                </div>
                {connectError && (
                  <div className="flex items-start gap-2 text-red-400 text-xs">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    {connectError}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { void handleConnect('Intercom'); }}
                    disabled={!connectForm.key.trim() || isConnecting || serverReachable === false}
                    className="btn-primary text-sm h-9 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Verifying…' : 'Test & Connect'}
                  </button>
                  <button
                    onClick={() => { setConnectModal(null); setConnectForm({ key: '', secret: '' }); setConnectError(null); }}
                    className="btn-secondary text-sm h-9"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── Generic connect form (other integrations) ──────────────── */
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1">API Key</label>
                  <input
                    type="text"
                    className="input w-full text-sm h-9"
                    placeholder="Enter API key..."
                    value={connectForm.key}
                    onChange={e => setConnectForm(f => ({ ...f, key: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-1">API Secret</label>
                  <input
                    type="password"
                    className="input w-full text-sm h-9"
                    placeholder="Enter API secret..."
                    value={connectForm.secret}
                    onChange={e => setConnectForm(f => ({ ...f, secret: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => { void handleConnect(connectModal); }}
                    disabled={!connectForm.key.trim()}
                    className="btn-primary text-sm h-9 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Authorize & Connect
                  </button>
                  <button onClick={() => { setConnectModal(null); setConnectForm({ key: '', secret: '' }); }} className="btn-secondary text-sm h-9">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configure modal */}
      {configModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfigModal(null)}>
          <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Configure {configModal}</h3>
                <p className="text-gray-500 text-xs mt-0.5">Adjust sync settings and webhook endpoints</p>
              </div>
              <button onClick={() => setConfigModal(null)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Intercom: show real connection info */}
            {configModal === 'Intercom' && intercomMeInfo && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4 flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="text-emerald-300 text-sm font-medium">{intercomMeInfo.workspace}</div>
                  <div className="text-gray-400 text-xs">Connected as {intercomMeInfo.name}</div>
                </div>
                <span className="ml-auto badge-green"><Check size={10} />Live</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1">Webhook URL</label>
                <input
                  type="text"
                  className="input w-full text-sm h-9"
                  defaultValue={`https://api.pulseops.io/webhooks/${configModal.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1">Sync Frequency</label>
                <select className="input w-full text-sm h-9">
                  <option>Real-time</option>
                  <option>Every 5 minutes</option>
                  <option>Every 15 minutes</option>
                  <option>Hourly</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1">Connection Status</label>
                <div className="flex items-center gap-3 py-1">
                  <span className="badge-green"><Check size={10} />Connected</span>
                  <button onClick={() => handleDisconnect(configModal)} className="text-red-400 text-xs hover:text-red-300 transition-colors">Disconnect</button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={handleSaveConfig} className="btn-primary text-sm h-9">Save Configuration</button>
              <button onClick={() => setConfigModal(null)} className="btn-secondary text-sm h-9">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite member modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Invite Team Member</h3>
                <p className="text-gray-500 text-xs mt-0.5">They'll receive an email invite to join the workspace</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  className="input w-full text-sm h-9"
                  placeholder="Jane Smith"
                  value={inviteForm.name}
                  onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  className="input w-full text-sm h-9"
                  placeholder="jane@company.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1">Role</label>
                <select className="input w-full text-sm h-9" value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}>
                  <option>Viewer</option>
                  <option>Analyst</option>
                  <option>Supervisor</option>
                  <option>WFM Manager</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={handleInvite}
                disabled={!inviteForm.email.trim()}
                className="btn-primary text-sm h-9 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Invitation
              </button>
              <button onClick={() => { setShowInviteModal(false); setInviteForm({ name: '', email: '', role: 'Viewer' }); }} className="btn-secondary text-sm h-9">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
