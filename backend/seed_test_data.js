/**
 * FUNCTIONAL TEST DATA SEEDER
 * ============================
 * This script seeds realistic production data so you can
 * immediately see charts, KPI cards, and defect trends on the dashboard.
 *
 * Run with:  node seed_test_data.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'password123',
  host: 'localhost',
  port: 5432,
  database: 'production_monitor'
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Get existing machines (plant_id = null, i.e. ponraj/naren accounts)
    const machinesRes = await client.query(
      'SELECT id, name FROM machines WHERE plant_id IS NULL ORDER BY id LIMIT 5'
    );
    const machines = machinesRes.rows;

    if (machines.length === 0) {
      console.log('❌ No machines found with plant_id=null. Add a machine first in the UI!');
      await client.query('ROLLBACK');
      return;
    }

    console.log(`✅ Found ${machines.length} machines:`, machines.map(m => `#${m.id} ${m.name}`).join(', '));

    // ── 2. Clear old test data for these machines
    const machineIds = machines.map(m => m.id);
    await client.query('DELETE FROM production_logs WHERE machine_id = ANY($1)', [machineIds]);
    await client.query('DELETE FROM downtime_logs WHERE machine_id = ANY($1)', [machineIds]);
    console.log('🧹 Cleared old test data');

    // ── 3. Seed PRODUCTION LOGS — 14 days of shift data per machine
    const shifts = ['morning', 'afternoon', 'night'];
    let totalLogs = 0;

    for (const machine of machines) {
      for (let day = 13; day >= 0; day--) {
        for (const shift of shifts) {
          // Simulate realistic production numbers
          const units = rand(120, 250);
          // Defect rate between 2% and 15% — higher for night shift
          const defectRate = shift === 'night' ? rand(8, 15) : rand(2, 8);
          const defects = Math.floor(units * defectRate / 100);

          await client.query(
            `INSERT INTO production_logs (machine_id, units_produced, defective_units, shift, logged_at, plant_id)
             VALUES ($1, $2, $3, $4, $5, NULL)`,
            [machine.id, units, defects, shift, daysAgo(day)]
          );
          totalLogs++;
        }
      }
    }
    console.log(`📊 Inserted ${totalLogs} production log entries`);

    // ── 4. Seed DOWNTIME LOGS — random incidents over 14 days
    const reasons = [
      'Motor failure', 'Scheduled maintenance', 'Power outage',
      'Conveyor jam', 'Sensor calibration', 'Operator error',
      'Coolant leak', 'Software update'
    ];
    let downtimeCount = 0;

    for (const machine of machines) {
      // 3–8 incidents per machine over 14 days
      const incidents = rand(3, 8);
      for (let i = 0; i < incidents; i++) {
        const day = rand(0, 13);
        const minutes = rand(15, 120);
        await client.query(
          `INSERT INTO downtime_logs (machine_id, reason, downtime_minutes, logged_at, plant_id)
           VALUES ($1, $2, $3, $4, NULL)`,
          [machine.id, reasons[rand(0, reasons.length - 1)], minutes, daysAgo(day)]
        );
        downtimeCount++;
      }
    }
    console.log(`⏱️  Inserted ${downtimeCount} downtime incidents`);

    // ── 5. Seed MAINTENANCE SCHEDULES
    const tasks = [
      'Oil change and lubrication', 'Belt tension check',
      'Sensor calibration', 'Filter replacement',
      'Motor inspection', 'Safety valve test'
    ];
    let maintenanceCount = 0;

    for (const machine of machines) {
      // 2 past completed + 2 upcoming pending
      for (let i = 0; i < 2; i++) {
        await client.query(
          `INSERT INTO maintenance_schedules (machine_id, task_description, scheduled_date, status)
           VALUES ($1, $2, $3, 'completed')`,
          [machine.id, tasks[rand(0, tasks.length - 1)], daysAgo(rand(3, 10))]
        );
        maintenanceCount++;
      }
      for (let i = 0; i < 2; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + rand(1, 14));
        await client.query(
          `INSERT INTO maintenance_schedules (machine_id, task_description, scheduled_date, status)
           VALUES ($1, $2, $3, 'pending')`,
          [machine.id, tasks[rand(0, tasks.length - 1)], futureDate.toISOString().split('T')[0]]
        );
        maintenanceCount++;
      }
    }
    console.log(`🔧 Inserted ${maintenanceCount} maintenance schedule entries`);

    await client.query('COMMIT');
    console.log('\n🎉 DONE! Test data seeded successfully.');
    console.log('   → Open the dashboard → click any machine → see charts populate!');
    console.log('   → Go to KPI Dashboard → all metrics should now show real values!');
    console.log('   → Downtime Logs page will now have data to display!');

    // ── 6. Print a quick summary
    const summary = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE table_name = 'production_logs') AS prod_logs,
        COUNT(*) FILTER (WHERE table_name = 'downtime_logs') AS down_logs
      FROM (
        SELECT 'production_logs' AS table_name FROM production_logs WHERE machine_id = ANY($1)
        UNION ALL
        SELECT 'downtime_logs' AS table_name FROM downtime_logs WHERE machine_id = ANY($1)
      ) t
    `, [machineIds]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
