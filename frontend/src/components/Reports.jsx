import { Download, FileText } from 'lucide-react';

function Reports({ machines, trendData }) {
  const exportCSV = () => {
    const headers = 'Shift,Produced,Defects\n';
    const rows = trendData.map(d => `${d.shift},${d.produced},${d.defects}`).join('\n');
    const csv = headers + rows;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'production_report.csv';
    a.click();
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
          <button className="sidebar-logout" style={{ color: '#00d9ff', borderColor: '#00d9ff' }} onClick={exportCSV}>
            <Download size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Export CSV
          </button>
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