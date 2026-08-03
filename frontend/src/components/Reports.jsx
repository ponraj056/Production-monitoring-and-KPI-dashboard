import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

function Reports({ machines, trendData }) {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const exportCSV = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both from and to dates');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/export?from=${fromDate}&to=${toDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `production_report_${fromDate}_to_${toDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export CSV');
    }
  };

  return (
    <div>
      <div className="chart-panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#00d9ff" />
            <div>
              <p style={{ fontWeight: 600 }}>Production Summary Report</p>
              <p style={{ fontSize: '13px', color: '#8b949e' }}>{trendData.length} shift records · {machines.length} machines</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }} />
            <span>to</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }} />
            <button className="sidebar-logout" style={{ color: '#00d9ff', borderColor: '#00d9ff' }} onClick={exportCSV}>
              <Download size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <table className="machine-table">
        <thead>
          <tr>
            <th>Shift</th>
            <th>Produced</th>
            <th>Defects</th>
          </tr>
        </thead>
        <tbody>
          {trendData.map((d, i) => (
            <tr key={i}>
              <td>{d.shift}</td>
              <td>{d.produced}</td>
              <td>{d.defects}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reports;