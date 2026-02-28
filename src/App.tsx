import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import CommandCenter from './pages/CommandCenter';
import Forecasting from './pages/Forecasting';
import Scheduling from './pages/Scheduling';
import Agents from './pages/Agents';
import Reports from './pages/Reports';
import AgentPortal from './pages/AgentPortal';
import Settings from './pages/Settings';

const routes = [
  { path: '/', component: CommandCenter, title: 'Command Center', subtitle: 'Real-time ops · AI-powered · Auto-refresh 10s' },
  { path: '/forecast', component: Forecasting, title: 'Forecasting', subtitle: 'AI forecasts · Scenario planning · Explainable model' },
  { path: '/scheduling', component: Scheduling, title: 'Scheduling', subtitle: 'Drag-and-drop · Compliance locks · Bulk changes' },
  { path: '/agents', component: Agents, title: 'Agent Management', subtitle: 'Real-time adherence · API-synced · Audit trail' },
  { path: '/reports', component: Reports, title: 'Reports & Analytics', subtitle: 'Custom builder · Scheduled exports · BI connectors' },
  { path: '/agent-portal', component: AgentPortal, title: 'Agent Portal', subtitle: 'Schedule · KPIs · Swaps · Badges' },
  { path: '/settings', component: Settings, title: 'Settings', subtitle: 'Integrations · Compliance · Roles · API' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0f1117]">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-60">
          <Routes>
            {routes.map(({ path, component: Page, title, subtitle }) => (
              <Route
                key={path}
                path={path}
                element={
                  <>
                    <Topbar title={title} subtitle={subtitle} />
                    <main className="flex-1 overflow-auto">
                      <Page />
                    </main>
                  </>
                }
              />
            ))}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
