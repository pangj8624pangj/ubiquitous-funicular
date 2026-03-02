import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const Forecasting    = lazy(() => import('./pages/Forecasting'));
const Scheduling     = lazy(() => import('./pages/Scheduling'));
const Agents         = lazy(() => import('./pages/Agents'));
const Reports        = lazy(() => import('./pages/Reports'));
const AgentPortal    = lazy(() => import('./pages/AgentPortal'));
const Settings       = lazy(() => import('./pages/Settings'));

const routes = [
  { path: '/',             component: CommandCenter, title: 'Command Center',      subtitle: 'Real-time ops · AI-powered · Auto-refresh 10s' },
  { path: '/forecast',     component: Forecasting,   title: 'Forecasting',         subtitle: 'AI forecasts · Scenario planning · Explainable model' },
  { path: '/scheduling',   component: Scheduling,    title: 'Scheduling',          subtitle: 'Drag-and-drop · Compliance locks · Bulk changes' },
  { path: '/agents',       component: Agents,        title: 'Agent Management',    subtitle: 'Real-time adherence · API-synced · Audit trail' },
  { path: '/reports',      component: Reports,       title: 'Reports & Analytics', subtitle: 'Custom builder · Scheduled exports · BI connectors' },
  { path: '/agent-portal', component: AgentPortal,   title: 'Agent Portal',        subtitle: 'Schedule · KPIs · Swaps · Badges' },
  { path: '/settings',     component: Settings,      title: 'Settings',            subtitle: 'Integrations · Compliance · Roles · API' },
];

// Inner component so it can consume the auth context
function AppShell() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col md:ml-60">
          <Routes>
            {routes.map(({ path, component: Page, title, subtitle }) => (
              <Route
                key={path}
                path={path}
                element={
                  <>
                    <Topbar
                      title={title}
                      subtitle={subtitle}
                      onMenuClick={() => setSidebarOpen(o => !o)}
                    />
                    <main className="flex-1 overflow-auto">
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                          <div className="text-gray-500 text-sm">Loading…</div>
                        </div>
                      }>
                        <Page />
                      </Suspense>
                    </main>
                  </>
                }
              />
            ))}
            {/* Redirect any unknown path to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
