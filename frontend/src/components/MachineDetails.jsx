import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api';
import socket from '../socket';
import { toast } from 'react-hot-toast';
import KPICards from './KPICards';
import ProductionChart from './ProductionChart';

function MachineDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const stats = await api.getMachineStats(id);
      setData(stats);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load machine details');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleUpdate = (payload) => {
      fetchData(false); 
    };

    socket.on('dashboardUpdate', handleUpdate);
    return () => socket.off('dashboardUpdate', handleUpdate);
  }, [id]);

  if (loading) {
    return <div className="dashboard-container"><p>Loading Machine Data...</p></div>;
  }

  if (!data) {
    return <div className="dashboard-container"><p>Machine not found.</p></div>;
  }

  const { machine, kpis, productionLogs, downtimeLogs } = data;

  const chartData = productionLogs.map(log => ({
    shift: `${new Date(log.logged_at).toLocaleDateString()} - ${log.shift}`,
    produced: log.units_produced,
    defects: log.defective_units,
  })).reverse(); // Reverse for chronological order on chart

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/machines" style={{ color: 'var(--text)', textDecoration: 'none' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1>{machine.name} Dashboard</h1>
        </div>
        <span className="status-pill">
          <span className="status-dot"></span> Live
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Status: <strong style={{ color: machine.status === 'running' ? 'var(--success)' : (machine.status === 'down' ? 'var(--danger)' : 'var(--warning)') }}>{machine.status.toUpperCase()}</strong>
      </p>

      <h2>Machine Metrics</h2>
      <KPICards kpis={kpis} />

      <h2>Production Trend</h2>
      <div className="chart-panel">
        <ProductionChart data={chartData} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Recent Production</h2>
          <table className="machine-table">
            <thead>
              <tr>
                <th>Shift</th>
                <th>Produced</th>
                <th>Defects</th>
              </tr>
            </thead>
            <tbody>
              {productionLogs.slice(0, 5).map(log => (
                <tr key={log.id}>
                  <td>{log.shift} ({new Date(log.logged_at).toLocaleDateString()})</td>
                  <td>{log.units_produced}</td>
                  <td>{log.defective_units}</td>
                </tr>
              ))}
              {productionLogs.length === 0 && <tr><td colSpan="3">No recent production</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Recent Downtime</h2>
          <table className="machine-table">
            <thead>
              <tr>
                <th>Reason</th>
                <th>Duration (min)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {downtimeLogs.slice(0, 5).map(log => (
                <tr key={log.id}>
                  <td>{log.reason}</td>
                  <td>{log.downtime_minutes}</td>
                  <td>{new Date(log.logged_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {downtimeLogs.length === 0 && <tr><td colSpan="3">No recent downtime</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MachineDetails;
