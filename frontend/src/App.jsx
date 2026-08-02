import { useState, useEffect } from 'react';
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
import { api } from './api';

function DashboardPage({ kpis, trendData, activities, loading }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚙ Production Monitoring Dashboard</h1>
        <span className="status-pill">
          <span className="status-dot"></span> Live
        </span>
      </div>

      <h2>Key Metrics</h2>
      {loading ? <p>Loading KPIs...</p> : <KPICards kpis={kpis} />}

      <h2>Production Trend</h2>
      <div className="chart-panel">
        <ProductionChart data={trendData} />
      </div>

      <h2>Recent Activity</h2>
      <ActivityFeed activities={activities} />
    </div>
  );
}

function MachinesPage({ machines, handleAddMachine, loading }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏭 Machines</h1>
      </div>
      <h2>Add Machine</h2>
      <MachineForm onAddMachine={handleAddMachine} />
      <h2>All Machines</h2>
      {loading ? <p>Loading machines...</p> : <MachineList machines={machines} />}
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
  // On load, check if a token already exists (keeps user logged in on refresh)
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [machines, setMachines] = useState([]);
  const [kpis, setKpis] = useState({ oee: 0, downtime: 0, defectRate: 0, throughput: 0 });
  const [trendData, setTrendData] = useState([]);
  const [activities] = useState([
    { id: 1, type: 'success', text: 'CNC Machine 1 completed batch #204 — 45 units produced', time: '2 minutes ago' },
    { id: 2, type: 'warning', text: 'Press Machine 2 downtime exceeded 10 minutes', time: '18 minutes ago' },
    { id: 3, type: 'maintenance', text: 'Scheduled maintenance started on CNC Machine 1', time: '1 hour ago' },
    { id: 4, type: 'error', text: '3 defective units flagged on Press Machine 2', time: '2 hours ago' },
    { id: 5, type: 'added', text: 'New machine "Welding Unit 3" registered', time: '5 hours ago' },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend once logged in
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [machinesData, kpiData, logsData] = await Promise.all([
          api.getMachines(),
          api.getKpiSummary(),
          api.getProductionLogs(),
        ]);

        setMachines(machinesData);

        setKpis({
          oee: kpiData.oee,
          downtime: kpiData.downtimePercent,
          defectRate: kpiData.defectRate,
          throughput: kpiData.totalUnits,
        });

        // Map production_logs rows into chart-friendly shape
        const chartData = logsData.map((log) => ({
          shift: `${new Date(log.logged_at).toLocaleDateString()} - ${log.shift}`,
          produced: log.units_produced,
          defects: log.defective_units,
        }));
        setTrendData(chartData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAddMachine = async (newMachine) => {
    try {
      const created = await api.createMachine(newMachine);
      setMachines([...machines, created]);
    } catch (err) {
      console.error('Failed to create machine:', err);
      alert(err.message);
    }
  };

  const handleLogin = (newToken) => setToken(newToken);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
  };

  const requireAuth = (element) => (token ? element : <Navigate to="/login" />);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route
          path="/dashboard"
          element={requireAuth(
            <AppLayout onLogout={handleLogout}>
              <DashboardPage kpis={kpis} trendData={trendData} activities={activities} loading={loading} />
            </AppLayout>
          )}
        />

        <Route
          path="/machines"
          element={requireAuth(
            <AppLayout onLogout={handleLogout}>
              <MachinesPage machines={machines} handleAddMachine={handleAddMachine} loading={loading} />
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