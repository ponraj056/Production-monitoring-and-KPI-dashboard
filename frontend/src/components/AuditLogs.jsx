import { useState, useEffect } from 'react';
import { api } from '../api';
import { toast } from 'react-hot-toast';
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const toggleExpand = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  if (loading) return <p>Loading audit logs...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><ShieldAlert size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Audit Logs</h1>
      </div>

      <div className="chart-panel">
        <table className="machine-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.username}</td>
                  <td>
                    <span className={`status-pill ${log.action === 'DELETE' ? 'status-down' : log.action === 'CREATE' ? 'status-running' : 'status-idle'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.entity_type}</td>
                  <td>{log.entity_id}</td>
                  <td>
                    <button 
                      onClick={() => toggleExpand(log.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                    >
                      {expandedRow === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr>
                    <td colSpan="6" style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)' }}>
                      <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ flex: 1 }}>
                          <strong>Before:</strong>
                          <pre style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '12px', color: '#aaa' }}>
                            {log.before_json ? JSON.stringify(log.before_json, null, 2) : 'N/A'}
                          </pre>
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong>After:</strong>
                          <pre style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '12px', color: '#aaa' }}>
                            {log.after_json ? JSON.stringify(log.after_json, null, 2) : 'N/A'}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No audit logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Ensure React is imported if needed for React.Fragment
import React from 'react';
export default AuditLogs;
