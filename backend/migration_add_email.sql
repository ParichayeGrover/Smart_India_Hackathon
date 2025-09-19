-- Migration to add email column to users table
-- Run this after the initial schema has been created

-- Add email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email TEXT;
    END IF;
END $$;

-- Update existing users with default email addresses (for demo purposes)
UPDATE users SET email = 
    CASE 
        WHEN name = 'Admin Sharma' THEN 'admin@example.com'
        WHEN name = 'Worker Raj' THEN 'worker.raj@example.com'
        WHEN name = 'Worker Priya' THEN 'worker.priya@example.com'
        WHEN name = 'Citizen Kumar' THEN 'citizen.kumar@example.com'
        WHEN name = 'CHW Sunita' THEN 'chw.sunita@example.com'
        ELSE LOWER(REPLACE(name, ' ', '.')) || '@example.com'
    END
WHERE email IS NULL;

-- Make email column required and unique
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);