function KPICards({ kpis }) {
  const cardStyle = {
    display: 'inline-block',
    width: '180px',
    padding: '16px',
    margin: '10px',
    borderRadius: '8px',
    background: '#f4f4f4',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  };

  return (
  <div className="kpi-cards">
    <div className="kpi-card">
      <h3>OEE</h3>
      <p>{kpis.oee}%</p>
    </div>
    <div className="kpi-card">
      <h3>Downtime</h3>
      <p>{kpis.downtime}%</p>
    </div>
    <div className="kpi-card">
      <h3>Defect Rate</h3>
      <p>{kpis.defectRate}%</p>
    </div>
    <div className="kpi-card">
      <h3>Throughput</h3>
      <p>{kpis.throughput}/hr</p>
    </div>
  </div>
);
}

export default KPICards;