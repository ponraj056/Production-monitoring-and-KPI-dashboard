import { useState } from 'react';
import MachineList from './components/MachineList';
import MachineForm from './components/MachineForm';
import KPICards from './components/KPICards';
import ProductionChart from './components/ProductionChart';
import './App.css';

function App() {
  const [machines, setMachines] = useState([
    { id: 1, name: 'CNC Machine 1', type: 'CNC', status: 'running' },
    { id: 2, name: 'Press Machine 2', type: 'Press', status: 'idle' },
  ]);

  const [kpis] = useState({
    oee: 78,
    downtime: 12,
    defectRate: 3.5,
    throughput: 145,
  });

  const [trendData] = useState([
    { shift: 'Mon-Morning', produced: 120, defects: 5 },
    { shift: 'Mon-Evening', produced: 135, defects: 3 },
    { shift: 'Tue-Morning', produced: 110, defects: 8 },
    { shift: 'Tue-Evening', produced: 150, defects: 4 },
    { shift: 'Wed-Morning', produced: 140, defects: 2 },
  ]);

  const handleAddMachine = (newMachine) => {
    setMachines([...machines, newMachine]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Production Monitoring Dashboard</h1>

      <h2>Key Metrics</h2>
      <KPICards kpis={kpis} />

      <h2>Production Trend</h2>
      <ProductionChart data={trendData} />

      <h2>Add Machine</h2>
      <MachineForm onAddMachine={handleAddMachine} />

      <h2>Machines</h2>
      <MachineList machines={machines} />
    </div>
  );
}

export default App;