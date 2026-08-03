import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MachineList from './components/MachineList';
import MachineForm from './components/MachineForm';
import KPICards from './components/KPICards';
import ProductionChart from './components/ProductionChart';
import DowntimeLogs from './components/DowntimeLogs';
import Reports from './components/Reports';
import ActivityFeed from './components/ActivityFeed';
import Dashboard3D from './components/Dashboard3D';
import './App.css';
import { api } from './api';
import socket from './socket';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import { AuthProvider, useAuth } from './context/AuthContext';

function DashboardPage({ kpis, trendData, activities, loading }) {
  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <Dashboard3D />
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

function MachinesPage({ machines, handleAddMachine, handleDeleteMachine, loading }) {
  const { hasRole } = useAuth();
  const canEdit = hasRole('admin', 'supervisor');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏭 Machines</h1>
      </div>

      {canEdit && (
        <>
          <h2>Add Machine</h2>
          <MachineForm onAddMachine={handleAddMachine} />
        </>
      )}

      <h2>All Machines</h2>
      {loading ? (
        <p>Loading machines...</p>
      ) : (
        <MachineList machines={machines} canEdit={canEdit} onDelete={handleDeleteMachine} />
      )}
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

function AppLayout({ children, onLogout, themeMode, toggleTheme }) {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} themeMode={themeMode} toggleTheme={toggleTheme} />
      <div className="main-content">{children}</div>
    </div>
  );
}

function AppRoutes() {
  // ---------- AUTH ----------
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ---------- THEME ----------
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ---------- DATA STATE ----------
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

  // ---------- FETCH REAL DATA ON LOGIN ----------
  const fetchDashboardData = async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    
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

      const chartData = logsData.map((log) => ({
        shift: `${new Date(log.logged_at).toLocaleDateString()} - ${log.shift}`,
        produced: log.units_produced,
        defects: log.defective_units,
      }));
      setTrendData(chartData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // ---------- SOCKET.IO LIVE UPDATES ----------
  useEffect(() => {
    if (!token) return;

    socket.on('machineCreated', (newMachine) => {
      setMachines((prev) => [...prev, newMachine]);
    });

    socket.on('machineUpdated', (updatedMachine) => {
      setMachines((prev) =>
        prev.map((m) => (m.id === updatedMachine.id ? updatedMachine : m))
      );
    });

    socket.on('dashboardUpdate', (payload) => {
      console.log('Live dashboard update received:', payload);
      // Fetch data silently in the background
      fetchDashboardData(false);
    });

    return () => {
      socket.off('machineCreated');
      socket.off('machineUpdated');
      socket.off('dashboardUpdate');
    };
  }, [token]);

  // ---------- HANDLERS ----------
  const handleAddMachine = async (newMachine) => {
    try {
      const created = await api.createMachine(newMachine);
      setMachines((prev) => [...prev, created]);
    } catch (err) {
      console.error('Failed to create machine:', err);
      alert(err.message);
    }
  };

  const handleDeleteMachine = async (id) => {
    try {
      await api.deleteMachine(id);
      setMachines((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete machine:', err);
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
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      <Route
        path="/dashboard"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <DashboardPage kpis={kpis} trendData={trendData} activities={activities} loading={loading} />
          </AppLayout>
        )}
      />

      <Route
        path="/machines"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <MachinesPage machines={machines} handleAddMachine={handleAddMachine} handleDeleteMachine={handleDeleteMachine} loading={loading} />
          </AppLayout>
        )}
      />

      <Route
        path="/downtime"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <DowntimeLogsPage />
          </AppLayout>
        )}
      />

      <Route
        path="/reports"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <ReportsPage machines={machines} trendData={trendData} />
          </AppLayout>
        )}
      />

      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;