import { useState } from 'react';
import { Plus } from 'lucide-react';

function DowntimeLogs() {
  const [logs, setLogs] = useState([
    { id: 1, machine: 'CNC Machine 1', reason: 'Scheduled Maintenance', start: '09:00', end: '09:45', duration: '45 min' },
    { id: 2, machine: 'Press Machine 2', reason: 'Material Shortage', start: '11:20', end: '11:50', duration: '30 min' },
    { id: 3, machine: 'CNC Machine 1', reason: 'Unexpected Breakdown', start: '14:10', end: '15:05', duration: '55 min' },
  ]);

  const [form, setForm] = useState({ machine: '', reason: '', start: '', end: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.machine || !form.reason || !form.start || !form.end) return;

    const newLog = {
      id: Date.now(),
      ...form,
      duration: 'N/A',
    };
    setLogs([newLog, ...logs]);
    setForm({ machine: '', reason: '', start: '', end: '' });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="machine-form">
        <input
          placeholder="Machine name"
          value={form.machine}
          onChange={(e) => setForm({ ...form, machine: e.target.value })}
        />
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
        <button type="submit"><Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Log Downtime</button>
      </form>

      <table className="machine-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Machine</th>
            <th>Reason</th>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.machine}</td>
              <td>{log.reason}</td>
              <td>{log.start}</td>
              <td>{log.end}</td>
              <td>{log.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DowntimeLogs;