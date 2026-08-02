const pool = require('./config/db');

async function seed() {
  try {
    console.log('Seeding machines...');
    const machines = [
      { name: 'CNC Machine 1', status: 'running', line_id: 'Line-A' },
      { name: 'Press Machine 2', status: 'idle', line_id: 'Line-A' },
      { name: 'Welding Unit 3', status: 'running', line_id: 'Line-B' },
      { name: 'Packaging Line 4', status: 'down', line_id: 'Line-B' },
    ];

    const machineIds = [];
    for (const m of machines) {
      const result = await pool.query(
        'INSERT INTO machines (name, status, line_id) VALUES ($1, $2, $3) RETURNING id',
        [m.name, m.status, m.line_id]
      );
      machineIds.push(result.rows[0].id);
    }
    console.log('Machines created with IDs:', machineIds);

    console.log('Seeding production logs...');
    const productionLogs = [
      { machine_id: machineIds[0], units_produced: 180, defective_units: 6, shift: 'Morning' },
      { machine_id: machineIds[0], units_produced: 165, defective_units: 4, shift: 'Evening' },
      { machine_id: machineIds[1], units_produced: 140, defective_units: 9, shift: 'Morning' },
      { machine_id: machineIds[1], units_produced: 155, defective_units: 5, shift: 'Evening' },
      { machine_id: machineIds[2], units_produced: 200, defective_units: 3, shift: 'Morning' },
      { machine_id: machineIds[2], units_produced: 190, defective_units: 7, shift: 'Evening' },
      { machine_id: machineIds[3], units_produced: 90, defective_units: 12, shift: 'Morning' },
    ];

    for (const log of productionLogs) {
      await pool.query(
        'INSERT INTO production_logs (machine_id, units_produced, defective_units, shift) VALUES ($1, $2, $3, $4)',
        [log.machine_id, log.units_produced, log.defective_units, log.shift]
      );
    }
    console.log('Production logs created:', productionLogs.length);

    console.log('Seeding downtime logs...');
    const downtimeLogs = [
      { machine_id: machineIds[1], reason: 'Material shortage', downtime_minutes: 30 },
      { machine_id: machineIds[3], reason: 'Unexpected breakdown', downtime_minutes: 90 },
      { machine_id: machineIds[0], reason: 'Scheduled maintenance', downtime_minutes: 45 },
      { machine_id: machineIds[2], reason: 'Operator shift change', downtime_minutes: 15 },
    ];

    for (const log of downtimeLogs) {
      await pool.query(
        'INSERT INTO downtime_logs (machine_id, reason, downtime_minutes) VALUES ($1, $2, $3)',
        [log.machine_id, log.reason, log.downtime_minutes]
      );
    }
    console.log('Downtime logs created:', downtimeLogs.length);

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();