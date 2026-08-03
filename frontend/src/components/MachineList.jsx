import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
function MachineList({ machines, canEdit, onDelete }) {
  return (
    <table className="machine-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Line</th>
          <th>Status</th>
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