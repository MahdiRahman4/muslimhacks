-- Speeds up food-wave ranking used on every check-in and participant list.
CREATE INDEX IF NOT EXISTS idx_applications_approved_rank
  ON applications (status, created_at, id);
