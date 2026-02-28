import { useState } from 'react';
import { Bell, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { notifications as initialNotifications } from '../../data/mockData';
import type { Notification } from '../../types';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const typeColors: Record<string, string> = {
    warning: 'text-amber-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    success: 'text-emerald-400',
  };

  const typeBg: Record<string, string> = {
    warning: 'bg-amber-500/15',
    error: 'bg-red-500/15',
    info: 'bg-blue-500/15',
    success: 'bg-emerald-500/15',
  };

  return (
    <header className="h-16 border-b border-[#2a2d3e] bg-[#13151f]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search agents, teams..."
            className="input pl-9 w-52 text-xs h-8"
          />
        </div>

        {/* Refresh status */}
        <div className="flex items-center gap-1.5 bg-[#22253a] rounded-lg px-3 py-1.5 border border-[#2a2d3e] hidden sm:flex">
          <RefreshCw size={12} className="text-gray-400" style={{ animation: 'spin 3s linear infinite' }} />
          <span className="text-gray-400 text-xs">Live</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-[#22253a] transition-colors text-gray-400 hover:text-white"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-96 card shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-[#2a2d3e]">
                <span className="text-white font-semibold text-sm">Notifications</span>
                {unreadCount > 0
                  ? <span className="badge-red">{unreadCount} new</span>
                  : <span className="badge-green">All read</span>
                }
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-[#2a2d3e] w-full text-left hover:bg-[#1e2130] transition-colors ${!n.read ? 'bg-[#22253a]' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full ${typeBg[n.type]} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-[10px] font-bold ${typeColors[n.type]}`}>
                        {n.type === 'warning' ? '!' : n.type === 'error' ? '✕' : n.type === 'success' ? '✓' : 'i'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${!n.read ? 'text-gray-200' : 'text-gray-400'}`}>{n.message}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-[#2a2d3e] flex items-center justify-between">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-blue-400 text-xs hover:text-blue-300 transition-colors disabled:text-gray-600 disabled:cursor-default"
                >
                  Mark all as read
                </button>
                <span className="text-gray-600 text-xs">{notifs.length} total</span>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <button className="flex items-center gap-2 bg-[#22253a] rounded-lg px-3 py-1.5 border border-[#2a2d3e] hover:bg-[#2a2d3e] transition-colors">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">J</div>
          <span className="text-gray-300 text-xs hidden sm:block">Jordan</span>
          <ChevronDown size={12} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
}
