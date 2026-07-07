-- Review audit history (append-only)
CREATE TABLE application_reviews (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  reviewed_by TEXT NOT NULL,
  score INTEGER,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applications (id),
  FOREIGN KEY (reviewed_by) REFERENCES users (id)
);

CREATE INDEX idx_application_reviews_app ON application_reviews (application_id, created_at DESC);

-- Latest review snapshot on the application row
ALTER TABLE applications ADD COLUMN reviewed_by TEXT REFERENCES users (id);
ALTER TABLE applications ADD COLUMN reviewed_at INTEGER;

CREATE INDEX idx_applications_gender ON applications (gender);
