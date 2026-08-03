import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function DowntimeLogs() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('admin', 'supervisor');
  const [logs, setLogs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ machine_id: '', reason: '', start: '', end: '' });

  // Load real machines and downtime logs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesData, logsData] = await Promise.all([
          api.getMachines(),
          api.getDowntimeLogs(),
        ]);
        setMachines(machinesData);
        setLogs(logsData);
      } catch (err) {
        console.error('Failed to load downtime data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: convert "HH:MM" start/end into total minutes
  const calculateMinutes = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    return Math.max(endTotal - startTotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.machine_id || !form.reason || !form.start || !form.end) return;

    const downtime_minutes = calculateMinutes(form.start, form.end);

    try {
      const newLog = await api.createDowntimeLog({
        machine_id: parseInt(form.machine_id),
        reason: form.reason,
        downtime_minutes,
      });
      setLogs([newLog, ...logs]);
      setForm({ machine_id: '', reason: '', start: '', end: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  // Look up a machine's name by id, for display in the table
  const getMachineName = (id) => {
    const machine = machines.find((m) => m.id === id);
    return machine ? machine.name : `Machine #${id}`;
  };

  return (
    <div>
      {canEdit && (
        <form onSubmit={handleSubmit} className="machine-form">
          <select
            value={form.machine_id}
            onChange={(e) => setForm({ ...form, machine_id: e.target.value })}
          >
            <option value="">Select machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <input
            type="time"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />
          <input
            type="time"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
          />
          <button type="submit">
            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Log Downtime
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading downtime logs...</p>
      ) : (
        <table className="machine-table" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Reason</th>
              <th>Duration (min)</th>
              <th>Logged At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{getMachineName(log.machine_id)}</td>
                <td>{log.reason}</td>
                <td>{log.downtime_minutes}</td>
                <td>{new Date(log.logged_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DowntimeLogs;