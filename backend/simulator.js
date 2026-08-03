const pool = require('./config/db');

let intervalId = null;

const startSimulator = (io) => {
  if (process.env.SIMULATION_ENABLED !== 'true') {
    console.log('Data Simulation is disabled (set SIMULATION_ENABLED=true in .env to enable)');
    return;
  }

  console.log('Starting Real-Time Data Simulation...');

  intervalId = setInterval(async () => {
    try {
      const machineResult = await pool.query("SELECT id FROM machines"); // Or filter by status = 'running' if preferred
      if (machineResult.rows.length === 0) return;

      const randomMachine = machineResult.rows[Math.floor(Math.random() * machineResult.rows.length)];

      const unitsProduced = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
      const defectiveUnits = Math.floor(Math.random() * 5);
      
      const hour = new Date().getHours();
      let shift = 'Shift 1';
      if (hour >= 15 && hour < 23) shift = 'Shift 2';
      else if (hour >= 23 || hour < 7) shift = 'Shift 3';

      const result = await pool.query(
        'INSERT INTO production_logs (machine_id, units_produced, defective_units, shift) VALUES ($1, $2, $3, $4) RETURNING *',
        [randomMachine.id, unitsProduced, defectiveUnits, shift]
      );

      console.log(`[Simulator] Inserted log for Machine ID ${randomMachine.id}: ${unitsProduced} units, ${defectiveUnits} defects`);

      io.emit('dashboardUpdate', { source: 'simulator', log: result.rows[0] });
    } catch (err) {
      console.error('[Simulator] Error running simulation step:', err);
    }
  }, 10000); // 10 seconds
};

const stopSimulator = () => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('Stopped Real-Time Data Simulation');
  }
};

module.exports = { startSimulator, stopSimulator };
