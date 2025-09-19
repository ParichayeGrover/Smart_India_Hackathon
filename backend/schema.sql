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
    role TEXT CHECK (role IN ('admin', 'worker', 'citizen')) NOT NULL,
    contact TEXT,
    assigned_village INTEGER REFERENCES villages(id), -- For admin and optionally for citizens
    password_hash TEXT NOT NULL
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
    tds FLOAT
    -- Add more parameters as needed
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
    sent_to TEXT
);


