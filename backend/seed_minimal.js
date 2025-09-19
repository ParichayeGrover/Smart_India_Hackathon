import pool from "./db.js";

async function seedDatabase() {
  try {
    console.log("🌱 Starting minimal database seeding...");

    // Insert sample villages only
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
    console.log(`✅ Inserted ${villages.rows.length} villages`);

    // Get village IDs for admin assignment
    const allVillages = await pool.query('SELECT * FROM villages LIMIT 1');
    const firstVillageId = allVillages.rows[0]?.id || 1;

    // Insert only admin user
    const admin = await pool.query(`
      INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES
      ('System Admin', 'admin@system.com', 'admin', '9999999999', $1, 'admin123')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        contact = EXCLUDED.contact,
        assigned_village = EXCLUDED.assigned_village,
        password_hash = EXCLUDED.password_hash
      RETURNING *
    `, [firstVillageId]);
    console.log(`✅ Created admin user: ${admin.rows[0]?.email}`);

    console.log("🎉 Minimal database seeding completed!");
    console.log("📋 Summary:");
    console.log(`   - Villages: ${villages.rows.length} created`);
    console.log(`   - Admin user: admin@system.com (password: admin123)`);
    console.log(`   - Workers and citizens: Will be created by admin or through registration`);
    console.log(`   - Water bodies: Will be created by admin as needed`);
    console.log(`   - Assignments: Will be made by admin`);
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  }
}

seedDatabase().finally(() => {
  pool.end();
});