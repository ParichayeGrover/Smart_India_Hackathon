import pool from "./db.js";

async function resetDatabase() {
  try {
    console.log("🧹 Starting database reset...");

    // Clear all tables except villages (in correct order due to foreign key constraints)
    console.log("🗑️ Clearing existing data...");
    await pool.query('DELETE FROM alerts');
    await pool.query('DELETE FROM health_reports');
    await pool.query('DELETE FROM water_quality_reports');
    await pool.query('DELETE FROM worker_water_bodies');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM water_bodies');
    console.log("✅ Cleared all data except villages");

    // Reset sequences
    await pool.query("SELECT setval('users_id_seq', 1, false)");
    await pool.query("SELECT setval('water_bodies_id_seq', 1, false)");
    await pool.query("SELECT setval('worker_water_bodies_id_seq', 1, false)");
    await pool.query("SELECT setval('water_quality_reports_id_seq', 1, false)");
    await pool.query("SELECT setval('health_reports_id_seq', 1, false)");
    await pool.query("SELECT setval('alerts_id_seq', 1, false)");

    // Insert more villages
    console.log("🏘️ Ensuring villages exist...");
    const villages = await pool.query(`
      INSERT INTO villages (name, district, state, population) VALUES
      ('Rampur', 'Sitapur', 'Uttar Pradesh', 5000),
      ('Krishnaganj', 'Nadia', 'West Bengal', 3200),
      ('Mandalpur', 'Raichur', 'Karnataka', 4500),
      ('Bharatpur', 'Rajsamand', 'Rajasthan', 3800),
      ('Shivapur', 'Tumkur', 'Karnataka', 4200),
      ('Ramganj', 'Kota', 'Rajasthan', 3600),
      ('Govindpur', 'Varanasi', 'Uttar Pradesh', 4700),
      ('Lakshmipur', 'Hooghly', 'West Bengal', 3100)
      ON CONFLICT DO NOTHING
      RETURNING *
    `);
    console.log(`✅ Ensured ${villages.rows.length} villages exist`);

    // Get first village for admin assignment
    const allVillages = await pool.query('SELECT * FROM villages LIMIT 1');
    const firstVillageId = allVillages.rows[0]?.id || 1;

    // Create admin and demo public user
    console.log("👨‍💼 Creating users...");
    const users = await pool.query(`
      INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES
      ('System Admin', 'admin@system.com', 'admin', '9999999999', $1, 'admin123'),
      ('Demo Citizen', 'public@demo.com', 'citizen', '8888888888', $1, 'public123')
      RETURNING *
    `, [firstVillageId]);
    console.log(`✅ Created ${users.rows.length} users`);
    users.rows.forEach(user => {
      console.log(`   - ${user.role}: ${user.email}`);
    });

    // Verify the reset
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM villages) as villages,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM water_bodies) as water_bodies,
        (SELECT COUNT(*) FROM worker_water_bodies) as assignments
    `);

    console.log("🎉 Database reset completed!");
    console.log("📋 Final Summary:");
    console.log(`   - Villages: ${counts.rows[0].villages}`);
    console.log(`   - Users: ${counts.rows[0].users} (admin + demo citizen)`);
    console.log(`   - Water bodies: ${counts.rows[0].water_bodies}`);
    console.log(`   - Worker assignments: ${counts.rows[0].assignments}`);
    console.log("");
    console.log("🔑 Login Credentials:");
    console.log(`   - Admin: admin@system.com / admin123`);
    console.log(`   - Demo Citizen: public@demo.com / public123`);
    console.log("");
    console.log("📝 Next Steps:");
    console.log(`   - Login as admin to create workers and water bodies`);
    console.log(`   - Public users can register themselves`);
    console.log(`   - Admin can assign workers to water bodies`);
    
  } catch (error) {
    console.error("❌ Database reset failed:", error);
  }
}

resetDatabase().finally(() => {
  pool.end();
});