-- Database cleanup script
-- This script removes all data except villages and creates only an admin user

-- Clear all tables except villages (in correct order due to foreign key constraints)
DELETE FROM alerts;
DELETE FROM health_reports;
DELETE FROM water_quality_reports;
DELETE FROM worker_water_bodies;
DELETE FROM users;
DELETE FROM water_bodies;

-- Keep villages table as is
-- Villages remain unchanged

-- Create a single admin user for initial access
INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES
('System Admin', 'admin@system.com', 'admin', '9999999999', 1, 'admin123')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  contact = EXCLUDED.contact,
  assigned_village = EXCLUDED.assigned_village,
  password_hash = EXCLUDED.password_hash;

-- Reset sequences to start fresh
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('water_bodies_id_seq', 1, false);
SELECT setval('worker_water_bodies_id_seq', 1, false);
SELECT setval('water_quality_reports_id_seq', 1, false);
SELECT setval('health_reports_id_seq', 1, false);
SELECT setval('alerts_id_seq', 1, false);

-- Verify the cleanup
SELECT 'Villages count:' as info, COUNT(*) as count FROM villages
UNION ALL
SELECT 'Users count:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Water bodies count:' as info, COUNT(*) as count FROM water_bodies
UNION ALL
SELECT 'Assignments count:' as info, COUNT(*) as count FROM worker_water_bodies
UNION ALL
SELECT 'Water quality reports count:' as info, COUNT(*) as count FROM water_quality_reports;

SELECT 'Admin user created:' as info, name, email, role FROM users WHERE role = 'admin';