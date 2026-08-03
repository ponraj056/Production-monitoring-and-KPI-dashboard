import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function Maintenance() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('admin', 'supervisor');
  
  const [schedules, setSchedules] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ machine_id: '', task_description: '', scheduled_date: '' });

  const fetchData = async () => {
    try {
      const [machinesData, schedulesData] = await Promise.all([
        api.getMachines(),
        api.getSchedules()
      ]);
      setMachines(machinesData);
      setSchedules(schedulesData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.machine_id || !form.task_description || !form.scheduled_date) return;
    
    try {
      const newSchedule = await api.createSchedule(form);
      setSchedules([...schedules, newSchedule]);
      setForm({ machine_id: '', task_description: '', scheduled_date: '' });
      toast.success('Maintenance scheduled');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to schedule');
    }
  };

  const handleComplete = async (id) => {
    try {
      const updated = await api.completeSchedule(id);
      setSchedules(schedules.map(s => s.id === id ? updated : s));
      toast.success('Task marked as completed');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update');
    }
  };

  const getMachineName = (id) => {
    const m = machines.find(m => m.id === id);
    return m ? m.name : `Machine #${id}`;
  };

  const pending = schedules.filter(s => s.status === 'pending');
  const completed = schedules.filter(s => s.status === 'completed');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🔧 Maintenance Scheduling</h1>
      </div>

      {canEdit && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Schedule New Task</h2>
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
              placeholder="Task Description"
              value={form.task_description}
              onChange={(e) => setForm({ ...form, task_description: e.target.value })}
            />
            <input
              type="date"
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
            />
            <button type="submit">
              <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Schedule
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: 'var(--warning)' }}>Pending Tasks ({pending.length})</h2>
            <table className="machine-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Task</th>
                  <th>Date</th>
                  {canEdit && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {pending.map(s => (
                  <tr key={s.id}>
                    <td>{getMachineName(s.machine_id)}</td>
                    <td>{s.task_description}</td>
                    <td>{new Date(s.scheduled_date).toLocaleDateString()}</td>
                    {canEdit && (
                      <td>
                        <button onClick={() => handleComplete(s.id)} style={{ padding: '0.4rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          <Check size={16} /> Complete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {pending.length === 0 && <tr><td colSpan={canEdit ? 4 : 3}>No pending tasks</td></tr>}
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: 'var(--success)' }}>Completed Tasks ({completed.length})</h2>
            <table className="machine-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Task</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(s => (
                  <tr key={s.id}>
                    <td>{getMachineName(s.machine_id)}</td>
                    <td><strike>{s.task_description}</strike></td>
                    <td>{new Date(s.scheduled_date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {completed.length === 0 && <tr><td colSpan="3">No completed tasks</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maintenance;
