import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MachineList from './components/MachineList';
import MachineForm from './components/MachineForm';
import KPICards from './components/KPICards';
import ProductionChart from './components/ProductionChart';
import './App.css';
import DowntimeLogs from './components/DowntimeLogs';
import Reports from './components/Reports';
import ActivityFeed from './components/ActivityFeed';

function DashboardPage({ kpis, trendData, activities }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚙ Production Monitoring Dashboard</h1>
        <span className="status-pill">
          <span className="status-dot"></span> Live
        </span>
      </div>

      <h2>Key Metrics</h2>
      <KPICards kpis={kpis} />

      <h2>Production Trend</h2>
      <div className="chart-panel">
        <ProductionChart data={trendData} />
      </div>

      <h2>Recent Activity</h2>
      <ActivityFeed activities={activities} />
    </div>
  );
}


function MachinesPage({ machines, handleAddMachine }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏭 Machines</h1>
      </div>
      <h2>Add Machine</h2>
      <MachineForm onAddMachine={handleAddMachine} />
      <h2>All Machines</h2>
      <MachineList machines={machines} />
    </div>
  );
}

function DowntimeLogsPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⏱ Downtime Logs</h1>
      </div>
      <DowntimeLogs />
    </div>
  );
}

function ReportsPage({ machines, trendData }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📄 Reports</h1>
      </div>
      <Reports machines={machines} trendData={trendData} />
    </div>
  );
}

function AppLayout({ children, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">{children}</div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(null);

  const [machines, setMachines] = useState([
    { id: 1, name: 'CNC Machine 1', type: 'CNC', status: 'running' },
    { id: 2, name: 'Press Machine 2', type: 'Press', status: 'idle' },
  ]);

  const [kpis] = useState({
    oee: 78,
    downtime: 12,
    defectRate: 3.5,
    throughput: 145,
  });

 const [trendData] = useState([
  { shift: 'Mon-Morning', produced: 120, defects: 5 },
  { shift: 'Mon-Evening', produced: 135, defects: 3 },
  { shift: 'Tue-Morning', produced: 110, defects: 8 },
  { shift: 'Tue-Evening', produced: 150, defects: 4 },
  { shift: 'Wed-Morning', produced: 140, defects: 2 },
  { shift: 'Wed-Evening', produced: 128, defects: 6 },
  { shift: 'Thu-Morning', produced: 155, defects: 3 },
  { shift: 'Thu-Evening', produced: 142, defects: 5 },
  { shift: 'Fri-Morning', produced: 118, defects: 9 },
  { shift: 'Fri-Evening', produced: 160, defects: 2 },
  { shift: 'Sat-Morning', produced: 95, defects: 4 },
  { shift: 'Sat-Evening', produced: 88, defects: 3 },
  { shift: 'Sun-Morning', produced: 70, defects: 1 },
  { shift: 'Sun-Evening', produced: 65, defects: 2 },
]);
  const [activities] = useState([
  { id: 1, type: 'success', text: 'CNC Machine 1 completed batch #204 — 45 units produced', time: '2 minutes ago' },
  { id: 2, type: 'warning', text: 'Press Machine 2 downtime exceeded 10 minutes', time: '18 minutes ago' },
  { id: 3, type: 'maintenance', text: 'Scheduled maintenance started on CNC Machine 1', time: '1 hour ago' },
  { id: 4, type: 'error', text: '3 defective units flagged on Press Machine 2', time: '2 hours ago' },
  { id: 5, type: 'added', text: 'New machine "Welding Unit 3" registered', time: '5 hours ago' },
]);

  const handleAddMachine = (newMachine) => {
    setMachines([...machines, newMachine]);
  };

  const handleLogin = (newToken) => setToken(newToken);
  const handleLogout = () => setToken(null);

  const requireAuth = (element) => (token ? element : <Navigate to="/login" />);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route
          path="/dashboard"
          element={requireAuth(
            <AppLayout onLogout={handleLogout}>
             <DashboardPage kpis={kpis} trendData={trendData} activities={activities} />
            </AppLayout>
          )}
        />

        <Route
          path="/machines"
          element={requireAuth(
            <AppLayout onLogout={handleLogout}>
              <MachinesPage machines={machines} handleAddMachine={handleAddMachine} />
            </AppLayout>
          )}
        />

        <Route
          path="/downtime"
          element={requireAuth(
            <AppLayout onLogout={handleLogout}>
              <DowntimeLogsPage />
            </AppLayout>
          )}
        />

<Route
  path="/reports"
  element={requireAuth(
    <AppLayout onLogout={handleLogout}>
      <ReportsPage machines={machines} trendData={trendData} />
    </AppLayout>
  )}
/>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;