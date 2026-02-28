import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Brain, Calendar, Users, BarChart3,
  Settings, Zap, Bell, ChevronRight, Activity
} from 'lucide-react';

const navItems = [
  { path: '/',             icon: LayoutDashboard, label: 'Command Center' },
  { path: '/forecast',     icon: Brain,           label: 'Forecasting' },
  { path: '/scheduling',   icon: Calendar,        label: 'Scheduling' },
  { path: '/agents',       icon: Users,           label: 'Agents' },
  { path: '/reports',      icon: BarChart3,       label: 'Reports' },
  { path: '/agent-portal', icon: Activity,        label: 'Agent Portal' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-60 min-h-screen bg-[#13151f] border-r border-[#2a2d3e] flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base tracking-tight">PulseOps</div>
              <div className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Workforce AI</div>
            </div>
          </div>
        </div>

        {/* Live status */}
        <div className="px-4 py-3 border-b border-[#2a2d3e]">
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-emerald-400 text-xs font-medium">Live · Auto-refresh</span>
            </div>
            <span className="text-gray-500 text-[10px]">10s</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Platform</div>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-item-active' : 'sidebar-item'
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{label}</span>
              <ChevronRight size={12} className="ml-auto text-gray-600" />
            </NavLink>
          ))}

          <div className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest px-3 mt-5 mb-2">Account</div>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'sidebar-item-active' : 'sidebar-item'
            }
          >
            <Settings size={16} className="flex-shrink-0" />
            <span>Settings</span>
            <ChevronRight size={12} className="ml-auto text-gray-600" />
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Jordan Davis</div>
              <div className="text-gray-500 text-xs truncate">WFM Manager</div>
            </div>
            <Bell
              size={14}
              className="text-gray-500 hover:text-white cursor-pointer flex-shrink-0"
              onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
