-- Replace initial applications table with registration fields
DROP TABLE IF EXISTS applications;

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  school TEXT,
  program TEXT,
  graduation_year INTEGER,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  why_join TEXT,
  project_idea TEXT,
  dietary_restrictions TEXT,
  needs_travel_support INTEGER NOT NULL DEFAULT 0 CHECK (needs_travel_support IN (0, 1)),
  gender TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_applications_status ON applications (status, updated_at);
CREATE INDEX idx_applications_user_id ON applications (user_id);
