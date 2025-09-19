import pool from "./db.js";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Insert sample villages
    const villages = await pool.query(`
      INSERT INTO villages (name, district, state, population) VALUES
      ('Rampur', 'Sitapur', 'Uttar Pradesh', 5000),
      ('Krishnaganj', 'Nadia', 'West Bengal', 3200),
      ('Mandalpur', 'Raichur', 'Karnataka', 4500)
      ON CONFLICT DO NOTHING
      RETURNING *
    `);
    console.log(`✅ Inserted ${villages.rows.length} villages`);

    // Get village IDs for further operations
    const allVillages = await pool.query('SELECT * FROM villages LIMIT 3');
    const villageIds = allVillages.rows.map(v => v.id);

    // Insert sample water bodies
    const waterBodies = await pool.query(`
      INSERT INTO water_bodies (village_id, name, type) VALUES
      ($1, 'Central Pond', 'pond'),
      ($1, 'Community Well', 'well'),
      ($1, 'River Tributary', 'river'),
      ($2, 'Village Tank', 'pond'),
      ($2, 'Hand Pump Station', 'well'),
      ($3, 'Main Lake', 'lake'),
      ($3, 'Bore Well', 'well')
      ON CONFLICT DO NOTHING
      RETURNING *
    `, [villageIds[0], villageIds[1], villageIds[2]]);
    console.log(`✅ Inserted ${waterBodies.rows.length} water bodies`);

    // Insert sample users
    const users = await pool.query(`
      INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES
      ('Admin Sharma', 'admin@example.com', 'admin', '9876543210', $1, 'admin123'),
      ('Worker Raj', 'worker.raj@example.com', 'worker', '9876543211', $1, 'worker123'),
      ('Worker Priya', 'worker.priya@example.com', 'worker', '9876543212', $2, 'worker123'),
      ('Citizen Kumar', 'citizen.kumar@example.com', 'citizen', '9876543213', $1, 'citizen123'),
      ('CHW Sunita', 'chw.sunita@example.com', 'worker', '9876543214', $3, 'worker123')
      ON CONFLICT DO NOTHING
      RETURNING *
    `, [villageIds[0], villageIds[1], villageIds[2]]);
    console.log(`✅ Inserted ${users.rows.length} users`);

    // Get water body and worker IDs
    const allWaterBodies = await pool.query('SELECT * FROM water_bodies');
    const allWorkers = await pool.query("SELECT * FROM users WHERE role = 'worker'");

    // Assign workers to water bodies
    if (allWaterBodies.rows.length > 0 && allWorkers.rows.length > 0) {
      for (let i = 0; i < Math.min(allWaterBodies.rows.length, allWorkers.rows.length); i++) {
        await pool.query(`
          INSERT INTO worker_water_bodies (worker_id, water_body_id) VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [allWorkers.rows[i].id, allWaterBodies.rows[i].id]);
      }
      console.log(`✅ Assigned workers to water bodies`);
    }

    // Insert sample water quality reports
    const waterBodyIds = allWaterBodies.rows.map(wb => wb.id);
    for (const waterBodyId of waterBodyIds.slice(0, 5)) {
      await pool.query(`
        INSERT INTO water_quality_reports 
        (water_body_id, date, turbidity, ph, dissolved_oxygen, nitrates, fluoride, arsenic, ecoli, tds) VALUES
        ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9),
        ($1, CURRENT_DATE - INTERVAL '1 day', $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT DO NOTHING
      `, [
        waterBodyId,
        // Today's data
        Math.random() * 10 + 1,    // turbidity
        Math.random() * 2 + 6.5,   // ph (6.5-8.5)
        Math.random() * 5 + 5,     // dissolved_oxygen
        Math.random() * 30 + 10,   // nitrates
        Math.random() * 1 + 0.5,   // fluoride
        Math.random() * 0.005,     // arsenic
        Math.random() * 2,         // ecoli
        Math.random() * 200 + 300, // tds
        // Yesterday's data
        Math.random() * 10 + 1,
        Math.random() * 2 + 6.5,
        Math.random() * 5 + 5,
        Math.random() * 30 + 10,
        Math.random() * 1 + 0.5,
        Math.random() * 0.005,
        Math.random() * 2,
        Math.random() * 200 + 300
      ]);
    }
    console.log(`✅ Inserted water quality reports`);

    // Insert sample health reports
    for (const villageId of villageIds) {
      await pool.query(`
        INSERT INTO health_reports (village_id, date, symptoms, case_counts, reporter_type) VALUES
        ($1, CURRENT_DATE, 'Diarrhea, fever', 3, 'CHW'),
        ($1, CURRENT_DATE - INTERVAL '2 days', 'Stomach pain, nausea', 2, 'community')
        ON CONFLICT DO NOTHING
      `, [villageId]);
    }
    console.log(`✅ Inserted health reports`);

    // Insert sample alerts
    for (const villageId of villageIds) {
      await pool.query(`
        INSERT INTO alerts (village_id, date, risk_level, likely_disease, alert_type, sent_to) VALUES
        ($1, CURRENT_DATE, 'Medium', 'Diarrhea', 'Water contamination detected', 'Village authorities'),
        ($1, CURRENT_DATE - INTERVAL '1 day', 'Low', 'None', 'Routine check', 'CHW team')
        ON CONFLICT DO NOTHING
      `, [villageId]);
    }
    console.log(`✅ Inserted alerts`);

    console.log("🎉 Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();
