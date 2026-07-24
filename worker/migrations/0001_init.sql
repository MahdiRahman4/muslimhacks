-- Users: auth identity and role
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'volunteer', 'admin')),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_users_role ON users (role);

-- Hackathon registration applications
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  school TEXT,
  experience_level TEXT NOT NULL,
  team_name TEXT,
  team_size INTEGER CHECK (team_size IS NULL OR (team_size >= 1 AND team_size <= 4)),
  dietary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by TEXT,
  submitted_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (reviewed_by) REFERENCES users (id)
);

CREATE INDEX idx_applications_status ON applications (status, submitted_at);

-- Volunteer meal check-ins at the door
CREATE TABLE meal_scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scanned_by TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  day TEXT NOT NULL,
  scanned_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (scanned_by) REFERENCES users (id),
  UNIQUE (user_id, meal_type, day)
);

CREATE INDEX idx_meal_scans_user_day ON meal_scans (user_id, day);

-- Event-day challenge enrollment
CREATE TABLE challenge_signups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  signed_up_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (user_id, challenge_id)
);

CREATE INDEX idx_challenge_signups_challenge ON challenge_signups (challenge_id);
