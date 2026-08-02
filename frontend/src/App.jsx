function Dashboard({ machines, kpis, trendData, handleAddMachine }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚙ Production Monitoring Dashboard</h1>
        <span className="status-pill">
          <span className="status-dot"></span> Live
        </span>
      </div>

      <h2>Key Metrics</h2>
      <KPICards kpis={kpis} />

      <h2>Production Trend</h2>
      <div className="chart-panel">
        <ProductionChart data={trendData} />
      </div>

      <h2>Add Machine</h2>
      <MachineForm onAddMachine={handleAddMachine} />

      <h2>Machines</h2>
      <MachineList machines={machines} />
    </div>
  );
}