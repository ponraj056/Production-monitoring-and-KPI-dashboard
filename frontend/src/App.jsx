import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MachineList from './components/MachineList';
import MachineForm from './components/MachineForm';
import MachineDetails from './components/MachineDetails';
import KPICards from './components/KPICards';
import ProductionChart, { ProductionDefectChart, OEETrendChart } from './components/ProductionChart';
import DowntimeLogs from './components/DowntimeLogs';
import Maintenance from './components/Maintenance';
import Reports from './components/Reports';
import ActivityFeed from './components/ActivityFeed';
import ShiftChart from './components/ShiftChart';
import './App.css';
import { api } from './api';
import socket from './socket';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import AlertSettings from './components/AlertSettings';
import AuditLogs from './components/AuditLogs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const DOWNTIME_COLORS = ['#ef5350', '#ff9800', '#ffb74d', '#e57373', '#f44336', '#ff7043', '#ec407a'];

function DowntimeBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '40px' }}>No downtime data recorded yet</p>;
  }
  return (
    <div style={{ width: '100%', height: '260px' }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" stroke="var(--text-faint)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} angle={-20} textAnchor="end" height={50} />
          <YAxis stroke="var(--text-faint)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: 'var(--text-faint)', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} labelStyle={{ color: 'var(--text-primary)' }} />
          <Legend />
          <Bar dataKey="downtime" name="Downtime (min)" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={index} fill={DOWNTIME_COLORS[index % DOWNTIME_COLORS.length]} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashboardPage({ kpis, trendData, downtimeTrendData, shiftData, activities, loading, timeRange, setTimeRange, predictions }) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const handleDismiss = (machineId) => {
    setDismissedAlerts(new Set([...dismissedAlerts, machineId]));
  };

  const highRiskMachines = (predictions || []).filter(p => p.risk_level === 'high' && !dismissedAlerts.has(p.machine_id));

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      {highRiskMachines.map(machine => (
        <div key={machine.machine_id} style={{
          backgroundColor: 'var(--accent-danger)',
          color: '#fff',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span><strong>High Risk Alert:</strong> Machine <strong>{machine.machine_name}</strong> has a {machine.risk_score}% probability of downtime. Preventive maintenance recommended.</span>
          </div>
          <button onClick={() => handleDismiss(machine.machine_id)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
      ))}
      <div className="dashboard-header">
        <h1>⚙ Production Monitoring Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <span className="status-pill">
            <span className="status-dot"></span> Live
          </span>
        </div>
      </div>

      <h2>Key Metrics</h2>
      {loading ? <p>Loading KPIs...</p> : <KPICards kpis={kpis} />}

      {/* ── Chart Row 1: Production & Defects ─────────────────────── */}
      <h2>📊 Production vs Defects</h2>
      <div className="chart-panel">
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>
          Green bars = units produced · Red bars = defective units · Orange line = defect rate % (above 10% is critical)
        </p>
        <ProductionDefectChart data={trendData} />
      </div>

      {/* ── Chart Row 2: Quality & OEE ───────────────────────────── */}
      <h2>📈 Quality & Defect Rate Trend</h2>
      <div className="chart-panel">
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>
          Quality % = good units ÷ total units · Defect Rate % = bad units ÷ total · 85% quality line = world-class target
        </p>
        <OEETrendChart data={trendData} />
      </div>

      {/* ── Chart Row 3: Downtime per machine ───────────────────── */}
      <h2>⏱ Downtime Overview</h2>
      <div className="chart-panel">
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '12px' }}>
          Total downtime minutes per machine across the selected time period
        </p>
        {loading ? <p>Loading...</p> : <DowntimeBarChart data={downtimeTrendData} />}
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Shift Performance (Today)</h2>
          <div className="chart-panel">
            <ShiftChart data={shiftData} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Recent Activity</h2>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

function MachinesPage({ machines, handleAddMachine, handleDeleteMachine, loading, predictions }) {
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
        <MachineList machines={machines} canEdit={canEdit} onDelete={handleDeleteMachine} predictions={predictions} />
      )}
    </div>
  );
}

function DowntimeLogsPage({ machines }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⏱ Downtime Logs</h1>
      </div>
      <DowntimeLogs machines={machines} />
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
  const [kpis, setKpis] = useState({ oee: 0, downtime: 0, defectRate: 0, throughput: 0, healthScore: 0 });
  const [trendData, setTrendData] = useState([]);
  const [shiftData, setShiftData] = useState([]);
  const [downtimeTrendData, setDowntimeTrendData] = useState([]);
  const [activities] = useState([
    { id: 1, type: 'success', text: 'CNC Machine 1 completed batch #204 — 45 units produced', time: '2 minutes ago' },
    { id: 2, type: 'warning', text: 'Press Machine 2 downtime exceeded 10 minutes', time: '18 minutes ago' },
    { id: 3, type: 'maintenance', text: 'Scheduled maintenance started on CNC Machine 1', time: '1 hour ago' },
    { id: 4, type: 'error', text: '3 defective units flagged on Press Machine 2', time: '2 hours ago' },
    { id: 5, type: 'added', text: 'New machine "Welding Unit 3" registered', time: '5 hours ago' },
  ]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);

  // ---------- TIME RANGE ----------
  const [timeRange, setTimeRange] = useState('all');

  // ---------- FETCH REAL DATA ON LOGIN ----------
  const fetchDashboardData = async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const [machinesData, kpiData, logsData, predictionsData, shiftRes, downtimeLogs] = await Promise.all([
        api.getMachines(),
        api.getKpiSummary(null, timeRange),
        api.getProductionLogs(timeRange),
        api.getDowntimeRisk(),
        api.getKpiByShift(todayDate),
        api.getDowntimeLogs(timeRange),
      ]);

      setMachines(machinesData);
      setPredictions(predictionsData);

      setKpis({
        oee: kpiData.oee,
        downtime: kpiData.downtimePercent,
        defectRate: kpiData.defectRate,
        throughput: kpiData.totalUnits,
        healthScore: kpiData.healthScore,
      });

      setShiftData(shiftRes);

      const chartData = logsData.map((log) => ({
        shift: `${new Date(log.logged_at).toLocaleDateString()} - ${log.shift}`,
        produced: log.units_produced,
        defects: log.defective_units,
      }));
      setTrendData(chartData);

      // Aggregate downtime by machine name
      const downtimeByMachine = {};
      downtimeLogs.forEach(log => {
        const machine = machinesData.find(m => m.id === log.machine_id);
        const name = machine ? machine.name : `Machine #${log.machine_id}`;
        downtimeByMachine[name] = (downtimeByMachine[name] || 0) + (log.downtime_minutes || 0);
      });
      const downtimeArr = Object.entries(downtimeByMachine).map(([name, downtime]) => ({ name, downtime }));
      setDowntimeTrendData(downtimeArr);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, timeRange]);

  // ---------- SOCKET.IO LIVE UPDATES ----------
  useEffect(() => {
    if (!token) return;

    socket.on('machineCreated', (newMachine) => {
      setMachines((prev) => {
        if (prev.some(m => m.id === newMachine.id)) return prev;
        return [...prev, newMachine];
      });
    });

    socket.on('machineUpdated', (updatedMachine) => {
      setMachines((prev) =>
        prev.map((m) => (m.id === updatedMachine.id ? updatedMachine : m))
      );
    });

    const handleUpdate = (payload) => {
      console.log('Live dashboard update received:', payload);
      fetchDashboardData(false);
    };
    
    socket.on('dashboardUpdate', handleUpdate);
    socket.on('predictionsUpdated', handleUpdate);

    return () => {
      socket.off('machineCreated');
      socket.off('machineUpdated');
      socket.off('dashboardUpdate', handleUpdate);
      socket.off('predictionsUpdated', handleUpdate);
    };
  }, [token, timeRange]);

  // ---------- HANDLERS ----------
  const handleAddMachine = async (newMachine) => {
    try {
      const created = await api.createMachine(newMachine);
      setMachines((prev) => {
        if (prev.some(m => m.id === created.id)) return prev;
        return [...prev, created];
      });
      toast.success('Machine added successfully!');
    } catch (err) {
      console.error('Failed to create machine:', err);
      toast.error(err.message || 'Failed to create machine');
    }
  };

  const handleDeleteMachine = async (id) => {
    try {
      await api.deleteMachine(id);
      setMachines((prev) => prev.filter((m) => m.id !== id));
      toast.success('Machine deleted successfully!');
    } catch (err) {
      console.error('Failed to delete machine:', err);
      toast.error(err.message || 'Failed to delete machine');
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
            <DashboardPage
              kpis={kpis}
              trendData={trendData}
              downtimeTrendData={downtimeTrendData}
              shiftData={shiftData}
              activities={activities}
              loading={loading}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              predictions={predictions}
            />
          </AppLayout>
        )}
      />

      <Route
        path="/machines"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <MachinesPage
              machines={machines}
              handleAddMachine={handleAddMachine}
              handleDeleteMachine={handleDeleteMachine}
              loading={loading}
              predictions={predictions}
            />
          </AppLayout>
        )}
      />

      <Route
        path="/machines/:id"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <MachineDetails />
          </AppLayout>
        )}
      />

      <Route
        path="/downtime"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <DowntimeLogsPage machines={machines} />
          </AppLayout>
        )}
      />

      <Route
        path="/maintenance"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <Maintenance machines={machines} />
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

      <Route
        path="/alerts"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <AlertSettings />
          </AppLayout>
        )}
      />

      <Route
        path="/audit-logs"
        element={requireAuth(
          <AppLayout onLogout={handleLogout} themeMode={themeMode} toggleTheme={toggleTheme}>
            <AuditLogs />
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
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff', border: '1px solid #444' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;