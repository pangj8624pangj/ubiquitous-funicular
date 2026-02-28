import { useState, useEffect, useRef } from 'react';
import { Bell, Search, RefreshCw, ChevronDown, Menu, User, LogOut, Settings as SettingsIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notifications as initialNotifications, agents, teams } from '../../data/mockData';
import type { Notification } from '../../types';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('pulseops_topbar_notifs');
      return stored ? JSON.parse(stored) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  // Persist notification read state across page loads
  useEffect(() => {
    try {
      localStorage.setItem('pulseops_topbar_notifs', JSON.stringify(notifs));
    } catch {}
  }, [notifs]);

  // Listen for sidebar bell click
  useEffect(() => {
    const handler = () => setShowNotifications(true);
    window.addEventListener('open-notifications', handler);
    return () => window.removeEventListener('open-notifications', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  // Search: filter agents and teams
  const lq = searchQuery.trim().toLowerCase();
  const searchResults = lq.length > 0 ? [
    ...agents
      .filter(a => a.name.toLowerCase().includes(lq) || a.team.toLowerCase().includes(lq))
      .slice(0, 4)
      .map(a => ({ type: 'Agent' as const, label: a.name, sub: `${a.team} · ${a.status}`, href: '/agents' })),
    ...teams
      .filter(t => t.name.toLowerCase().includes(lq) || t.site.toLowerCase().includes(lq))
      .slice(0, 2)
      .map(t => ({ type: 'Team' as const, label: t.name, sub: t.site, href: '/agents' })),
  ].slice(0, 6) : [];

  return (
    <header className="h-16 border-b border-[#2a2d3e] bg-[#13151f]/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-[#22253a] transition-colors text-gray-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 text-xs hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search agents, teams..."
            className="input pl-9 w-52 text-xs h-8"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
          {showSearch && lq.length > 0 && (
            <div className="absolute top-10 left-0 w-72 card shadow-2xl z-50 overflow-hidden animate-fade-in">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 border-b border-[#2a2d3e]">
                    <span className="text-gray-600 text-[10px] uppercase tracking-wider font-medium">Results</span>
                  </div>
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(r.href); setSearchQuery(''); setShowSearch(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 w-full text-left hover:bg-[#22253a] transition-colors"
                    >
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${r.type === 'Agent' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {r.type}
                      </span>
                      <div className="min-w-0">
                        <div className="text-gray-200 text-xs font-medium truncate">{r.label}</div>
                        <div className="text-gray-500 text-[10px] truncate">{r.sub}</div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-gray-500 text-xs">No results for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh status */}
        <div className="flex items-center gap-1.5 bg-[#22253a] rounded-lg px-3 py-1.5 border border-[#2a2d3e] hidden sm:flex">
          <RefreshCw size={12} className="text-gray-400" style={{ animation: 'spin 3s linear infinite' }} />
          <span className="text-gray-400 text-xs">Live</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
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
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-[#22253a] rounded-lg px-3 py-1.5 border border-[#2a2d3e] hover:bg-[#2a2d3e] transition-colors"
          >
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">J</div>
            <span className="text-gray-300 text-xs hidden sm:block">Jordan</span>
            <ChevronDown size={12} className={`text-gray-500 transition-transform duration-150 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 w-48 card shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-[#2a2d3e]">
                <div className="text-white text-sm font-medium">Jordan Davis</div>
                <div className="text-gray-500 text-xs">jordan@company.com</div>
                <div className="text-gray-600 text-xs mt-0.5">WFM Manager</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-gray-300 text-sm hover:bg-[#22253a] transition-colors"
                >
                  <User size={14} className="text-gray-500 flex-shrink-0" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-gray-300 text-sm hover:bg-[#22253a] transition-colors"
                >
                  <SettingsIcon size={14} className="text-gray-500 flex-shrink-0" />
                  Settings
                </button>
              </div>
              <div className="py-1 border-t border-[#2a2d3e]">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-red-400 text-sm hover:bg-[#22253a] transition-colors"
                >
                  <LogOut size={14} className="flex-shrink-0" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
