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


