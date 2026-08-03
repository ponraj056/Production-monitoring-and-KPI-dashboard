import { Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
function MachineList({ machines, canEdit, onDelete, predictions = [] }) {
  return (
    <table className="machine-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Line</th>
          <th>Status</th>
          <th>Risk</th>
          {canEdit && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {machines.map((m) => (
          <tr key={m.id}>
            <td>{m.id}</td>
            <td><Link to={`/machines/${m.id}`} style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>{m.name}</Link></td>
            <td>{m.line_id}</td>
            <td>
              <span className={`status-badge status-${m.status}`}>{m.status}</span>
            </td>
            <td>
              {(() => {
                const pred = predictions.find(p => p.machine_id === m.id);
                if (!pred) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
                const color = pred.risk_level === 'high' ? 'var(--accent-danger)' : pred.risk_level === 'medium' ? 'var(--warning)' : 'var(--success)';
                return (
                  <span style={{ 
                    color, 
                    fontWeight: 'bold', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    backgroundColor: `${color}15`,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {pred.risk_level === 'high' && <AlertTriangle size={14} />}
                    {pred.risk_score}%
                  </span>
                );
              })()}
            </td>
            {canEdit && (
              <td>
                <button
                  onClick={() => onDelete(m.id)}
                  title="Delete Machine"
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MachineList;