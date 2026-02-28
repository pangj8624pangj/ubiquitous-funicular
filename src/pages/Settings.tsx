import { Settings as SettingsIcon, Zap, Database, Bell, Shield, Users, Link, Check } from 'lucide-react';

const integrations = [
  { name: 'Intercom', description: 'Real-time agent state · Conversation sync', status: 'connected', icon: '💬' },
  { name: 'Google Calendar', description: 'Schedule sync · OOO import', status: 'connected', icon: '📅' },
  { name: 'Snowflake', description: 'Data warehouse export · Event streaming', status: 'connected', icon: '❄️' },
  { name: 'BigQuery', description: 'Analytics export · Scheduled push', status: 'disconnected', icon: '📊' },
  { name: 'Slack', description: 'Alert notifications · Schedule updates', status: 'disconnected', icon: '💡' },
  { name: 'Zendesk', description: 'Ticket data · CSAT import', status: 'disconnected', icon: '🎫' },
];

export default function Settings() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon size={20} className="text-blue-400" />
          Settings
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage integrations, notifications, compliance rules, and access control</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left nav */}
        <div className="space-y-1">
          {[
            { icon: Link, label: 'Integrations', active: true },
            { icon: Bell, label: 'Notifications' },
            { icon: Shield, label: 'Compliance Rules' },
            { icon: Users, label: 'Team & Roles' },
            { icon: Database, label: 'Data & Exports' },
            { icon: Zap, label: 'API & Webhooks' },
          ].map(({ icon: Icon, label, active }) => (
            <button key={label} className={active ? 'sidebar-item-active' : 'sidebar-item'}>
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="lg:col-span-2 space-y-4">
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

          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Compliance Rules</h3>
            <div className="space-y-3">
              {[
                { label: 'Minimum break interval', value: '4 hours between shifts', editable: true },
                { label: 'Max consecutive working days', value: '5 days', editable: true },
                { label: 'Overtime cap (weekly)', value: '10 hours', editable: true },
                { label: 'Shift swap window', value: 'Same skill + Same week', editable: true },
                { label: 'Non-adherence alert threshold', value: '15 minutes', editable: true },
              ].map(rule => (
                <div key={rule.label} className="flex items-center justify-between py-2.5 border-b border-[#2a2d3e] last:border-b-0">
                  <div>
                    <div className="text-gray-300 text-sm">{rule.label}</div>
                    <div className="text-blue-400 text-xs font-medium">{rule.value}</div>
                  </div>
                  <button className="btn-secondary text-xs h-7 px-2.5">Edit</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
