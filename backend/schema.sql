-- Smart Community Health Monitoring & Early Warning System Schema

CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    population INTEGER
);

-- 1a. Water Bodies Table
CREATE TABLE IF NOT EXISTS water_bodies (
    id SERIAL PRIMARY KEY,
    village_id INTEGER REFERENCES villages(id),
    name TEXT NOT NULL,
    type TEXT -- e.g., pond, well, river, etc.
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'worker', 'citizen')) NOT NULL,
    contact TEXT,
    assigned_village INTEGER REFERENCES villages(id), -- For admin and optionally for citizens
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Join table: workers assigned to water bodies
CREATE TABLE IF NOT EXISTS worker_water_bodies (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id), -- Only for users with role 'worker'
    water_body_id INTEGER REFERENCES water_bodies(id)
);

CREATE TABLE IF NOT EXISTS water_quality_reports (
    id SERIAL PRIMARY KEY,
    water_body_id INTEGER REFERENCES water_bodies(id),
    date DATE NOT NULL,
    turbidity FLOAT,
    ph FLOAT,
    dissolved_oxygen FLOAT,
    nitrates FLOAT,
    fluoride FLOAT,
    arsenic FLOAT,
    ecoli FLOAT,
    tds FLOAT,
    aluminium FLOAT,
    ammonia FLOAT,
    barium FLOAT,
    cadmium FLOAT,
    chloramine FLOAT,
    chromium FLOAT,
    copper FLOAT,
    flouride FLOAT,
    bacteria FLOAT,
    viruses FLOAT,
    lead FLOAT,
    nitrites FLOAT,
    mercury FLOAT,
    perchlorate FLOAT,
    radium FLOAT,
    selenium FLOAT,
    silver FLOAT,
    uranium FLOAT,
    contamination_status TEXT CHECK (contamination_status IN ('Safe', 'Unsafe')) DEFAULT 'Safe',
    predicted_disease TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported_by INTEGER REFERENCES users(id)
);

-- 4. Health Reports Table
CREATE TABLE IF NOT EXISTS health_reports (
    id SERIAL PRIMARY KEY,
    village_id INTEGER REFERENCES villages(id),
    date DATE NOT NULL,
    symptoms TEXT,
    case_counts INTEGER,
    reporter_type TEXT CHECK (reporter_type IN ('community', 'CHW')) NOT NULL
);

-- 5. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    village_id INTEGER REFERENCES villages(id),
    date DATE NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')) NOT NULL,
    likely_disease TEXT CHECK (likely_disease IN ('Cholera', 'Typhoid', 'Diarrhea', 'Jaundice', 'None')) NOT NULL,
    alert_type TEXT,
    sent_to TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Setup
-- Insert sample villages
INSERT INTO villages (name, district, state, population) VALUES
('Rajpur', 'Dehradun', 'Uttarakhand', 5000),
('Mussoorie', 'Dehradun', 'Uttarakhand', 8000),
('Chakrata', 'Dehradun', 'Uttarakhand', 3000),
('Rishikesh', 'Dehradun', 'Uttarakhand', 12000),
('Haridwar', 'Haridwar', 'Uttarakhand', 25000)
ON CONFLICT (name) DO NOTHING;

-- Create the first admin user
-- Password: "password" (bcrypt hash)
INSERT INTO users (name, email, role, password_hash, contact) VALUES
('System Administrator', 'admin@system.com', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9876543210')
ON CONFLICT (email) DO NOTHING;

-- Smart Community Health Monitoring - Dummy Data Insert Script

-- First, let's clear any existing data and start fresh
DELETE FROM alerts;
DELETE FROM health_reports;
DELETE FROM water_quality_reports;
DELETE FROM worker_water_bodies;
DELETE FROM users;
DELETE FROM water_bodies;
DELETE FROM villages;

-- Reset sequences
ALTER SEQUENCE villages_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE water_bodies_id_seq RESTART WITH 1;

-- 1. Insert ALL Villages (including the original 5)
INSERT INTO villages (name, district, state, population) VALUES
('Rajpur', 'Dehradun', 'Uttarakhand', 5000),
('Mussoorie', 'Dehradun', 'Uttarakhand', 8000),
('Chakrata', 'Dehradun', 'Uttarakhand', 3000),
('Rishikesh', 'Dehradun', 'Uttarakhand', 12000),
('Haridwar', 'Haridwar', 'Uttarakhand', 25000),
('Doiwala', 'Dehradun', 'Uttarakhand', 4500),
('Vikasnagar', 'Dehradun', 'Uttarakhand', 7200),
('Roorkee', 'Haridwar', 'Uttarakhand', 18000);

-- 2. Water Bodies (multiple per village)
INSERT INTO water_bodies (village_id, name, type) VALUES
-- Rajpur (village_id: 1)
(1, 'Rajpur Main Well', 'well'),
(1, 'Community Pond', 'pond'),
(1, 'Rajpur River', 'river'),
-- Mussoorie (village_id: 2)
(2, 'Mussoorie Lake', 'lake'),
(2, 'Hill Spring', 'spring'),
(2, 'Tourist Area Well', 'well'),
-- Chakrata (village_id: 3)
(3, 'Mountain Stream', 'stream'),
(3, 'Village Well', 'well'),
-- Rishikesh (village_id: 4)
(4, 'Ganges Ghat', 'river'),
(4, 'Temple Pond', 'pond'),
(4, 'Community Well', 'well'),
-- Haridwar (village_id: 5)
(5, 'Har Ki Pauri', 'river'),
(5, 'City Reservoir', 'reservoir'),
(5, 'Main Well', 'well'),
-- New villages
(6, 'Doiwala Stream', 'stream'),
(6, 'Village Pond', 'pond'),
(7, 'Vikasnagar Well', 'well'),
(7, 'Hill Spring', 'spring'),
(8, 'Roorkee Canal', 'canal'),
(8, 'University Well', 'well');

-- 3. All Users (Admin, Workers, Citizens)
INSERT INTO users (name, email, role, contact, assigned_village, password_hash) VALUES
-- System Admin (recreate the original one)
('System Administrator', 'admin@system.com', 'admin', '9876543210', NULL, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- Additional Admins
('Regional Admin', 'admin.regional@system.com', 'admin', '9876543211', 1, 'admin123'),
('District Supervisor', 'supervisor@system.com', 'admin', '9876543212', NULL, 'admin123'),

-- Workers
('Ramesh Kumar', 'ramesh.worker@village.com', 'worker', '9876543220', 1, 'worker123'),
('Priya Sharma', 'priya.worker@village.com', 'worker', '9876543221', 2, 'worker123'),
('Suresh Singh', 'suresh.worker@village.com', 'worker', '9876543222', 3, 'worker123'),
('Anita Devi', 'anita.worker@village.com', 'worker', '9876543223', 4, 'worker123'),
('Mohan Lal', 'mohan.worker@village.com', 'worker', '9876543224', 5, 'worker123'),
('Sunita Patel', 'sunita.worker@village.com', 'worker', '9876543225', 6, 'worker123'),
('Vijay Thapa', 'vijay.worker@village.com', 'worker', '9876543226', 7, 'worker123'),
('Rekha Gupta', 'rekha.worker@village.com', 'worker', '9876543227', 8, 'worker123'),

-- Citizens
('Arun Pandey', 'arun.citizen@village.com', 'citizen', '9876543230', 1, 'citizen123'),
('Meera Joshi', 'meera.citizen@village.com', 'citizen', '9876543231', 2, 'citizen123'),
('Deepak Rawat', 'deepak.citizen@village.com', 'citizen', '9876543232', 3, 'citizen123'),
('Kavita Bisht', 'kavita.citizen@village.com', 'citizen', '9876543233', 4, 'citizen123'),
('Rajesh Goel', 'rajesh.citizen@village.com', 'citizen', '9876543234', 5, 'citizen123'),
('Sushma Negi', 'sushma.citizen@village.com', 'citizen', '9876543235', 6, 'citizen123'),
('Dinesh Bhatt', 'dinesh.citizen@village.com', 'citizen', '9876543236', 7, 'citizen123'),
('Pooja Verma', 'pooja.citizen@village.com', 'citizen', '9876543237', 8, 'citizen123');

-- 4. Worker-Water Body Assignments
INSERT INTO worker_water_bodies (worker_id, water_body_id) VALUES
-- Assign workers to water bodies in their villages
(4, 1), (4, 2), (4, 3),  -- Ramesh Kumar to Rajpur water bodies
(5, 4), (5, 5), (5, 6),  -- Priya Sharma to Mussoorie water bodies
(6, 7), (6, 8),          -- Suresh Singh to Chakrata water bodies
(7, 9), (7, 10), (7, 11), -- Anita Devi to Rishikesh water bodies
(8, 12), (8, 13), (8, 14), -- Mohan Lal to Haridwar water bodies
(9, 15), (9, 16),        -- Sunita Patel to Doiwala water bodies
(10, 17), (10, 18),      -- Vijay Thapa to Vikasnagar water bodies
(11, 19), (11, 20);      -- Rekha Gupta to Roorkee water bodies

-- 5. Water Quality Reports (varied contamination levels)
INSERT INTO water_quality_reports (
    water_body_id, date, turbidity, ph, dissolved_oxygen, nitrates, fluoride, 
    arsenic, ecoli, tds, contamination_status, predicted_disease, reported_by
) VALUES
-- Safe water samples
(1, '2024-01-15', 2.5, 7.2, 8.5, 5.2, 0.8, 0.002, 0, 250, 'Safe', 'None', 4),
(4, '2024-01-16', 3.1, 7.0, 8.0, 4.8, 0.9, 0.001, 0, 180, 'Safe', 'None', 5),
(7, '2024-01-17', 1.8, 7.5, 9.2, 3.5, 0.7, 0.001, 0, 120, 'Safe', 'None', 6),

-- Moderately contaminated samples
(2, '2024-01-18', 8.5, 6.2, 6.5, 15.8, 1.8, 0.008, 5, 450, 'Unsafe', 'Diarrhea', 4),
(5, '2024-01-19', 12.2, 5.8, 5.2, 22.1, 2.2, 0.012, 8, 520, 'Unsafe', 'Cholera', 5),
(8, '2024-01-20', 6.8, 6.5, 6.8, 18.5, 1.6, 0.006, 3, 380, 'Unsafe', 'Typhoid', 6),

-- Highly contaminated samples
(3, '2024-01-21', 25.8, 5.2, 3.8, 45.2, 3.5, 0.025, 15, 850, 'Unsafe', 'Cholera', 4),
(9, '2024-01-22', 18.5, 5.5, 4.2, 38.8, 2.8, 0.018, 12, 720, 'Unsafe', 'Jaundice', 7),
(12, '2024-01-23', 32.1, 4.8, 3.2, 52.5, 4.2, 0.035, 20, 950, 'Unsafe', 'Cholera', 8),

-- Recent samples (January 2024)
(10, '2024-01-24', 4.2, 7.1, 8.2, 6.8, 1.1, 0.003, 1, 220, 'Safe', 'None', 7),
(13, '2024-01-25', 15.8, 5.9, 5.5, 28.5, 2.5, 0.015, 10, 680, 'Unsafe', 'Diarrhea', 8),
(15, '2024-01-26', 7.2, 6.8, 7.2, 12.5, 1.4, 0.007, 4, 340, 'Unsafe', 'Typhoid', 9),
(17, '2024-01-27', 2.8, 7.4, 8.8, 4.2, 0.9, 0.002, 0, 160, 'Safe', 'None', 10),
(19, '2024-01-28', 11.5, 6.1, 6.1, 25.8, 2.1, 0.011, 7, 580, 'Unsafe', 'Cholera', 11);

-- 6. Health Reports (community health data)
INSERT INTO health_reports (village_id, date, symptoms, case_counts, reporter_type) VALUES
-- Recent health incidents
(1, '2024-01-20', 'Diarrhea, stomach pain, fever', 8, 'CHW'),
(2, '2024-01-21', 'Vomiting, dehydration, weakness', 5, 'community'),
(3, '2024-01-22', 'Fever, chills, headache', 3, 'CHW'),
(4, '2024-01-23', 'Abdominal cramps, loose stools', 12, 'community'),
(5, '2024-01-24', 'Nausea, yellow eyes, fatigue', 7, 'CHW'),
(1, '2024-01-25', 'Severe diarrhea, blood in stool', 4, 'CHW'),
(3, '2024-01-26', 'High fever, body aches', 6, 'community'),
(4, '2024-01-27', 'Continuous vomiting, dehydration', 9, 'CHW'),
(5, '2024-01-28', 'Jaundice symptoms, dark urine', 3, 'community'),

-- Historical data
(2, '2024-01-15', 'Mild fever, cough', 2, 'community'),
(6, '2024-01-18', 'Stomach upset, loss of appetite', 5, 'CHW'),
(7, '2024-01-19', 'Diarrhea, mild fever', 4, 'community'),
(8, '2024-01-20', 'Vomiting, headache', 6, 'CHW');

-- 7. Alerts (system-generated warnings)
INSERT INTO alerts (village_id, date, risk_level, likely_disease, alert_type, sent_to) VALUES
-- High-risk alerts
(5, '2024-01-24', 'High', 'Cholera', 'Water Contamination Alert', 'District Health Officer'),
(1, '2024-01-25', 'High', 'Cholera', 'Disease Outbreak Warning', 'State Health Department'),
(4, '2024-01-27', 'Medium', 'Diarrhea', 'Health Advisory', 'Village Health Committee'),

-- Medium-risk alerts
(2, '2024-01-21', 'Medium', 'Typhoid', 'Water Quality Warning', 'Local Health Center'),
(3, '2024-01-26', 'Medium', 'Typhoid', 'Preventive Measures Alert', 'Community Health Workers'),
(8, '2024-01-20', 'Medium', 'Diarrhea', 'Sanitation Alert', 'Village Panchayat'),

-- Low-risk alerts
(6, '2024-01-18', 'Low', 'Diarrhea', 'Health Monitoring', 'Local Clinic'),
(7, '2024-01-19', 'Low', 'None', 'Routine Check', 'Health Supervisor'),

-- Recent alerts
(1, '2024-01-28', 'High', 'Cholera', 'Emergency Response', 'Emergency Response Team'),
(5, '2024-01-28', 'Medium', 'Jaundice', 'Medical Investigation', 'Medical Officer');

-- Verification queries to check data insertion
SELECT 'Villages' as table_name, COUNT(*) as record_count FROM villages
UNION ALL
SELECT 'Water Bodies', COUNT(*) FROM water_bodies
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Worker Assignments', COUNT(*) FROM worker_water_bodies
UNION ALL
SELECT 'Water Quality Reports', COUNT(*) FROM water_quality_reports
UNION ALL
SELECT 'Health Reports', COUNT(*) FROM health_reports
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts;
