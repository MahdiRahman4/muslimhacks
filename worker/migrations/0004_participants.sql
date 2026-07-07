-- Accepted participants for event day operations
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  application_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  gender TEXT,
  public_checkin_code TEXT NOT NULL UNIQUE,
  checkin_status TEXT NOT NULL DEFAULT 'not_checked_in' CHECK (checkin_status IN ('not_checked_in', 'checked_in')),
  checked_in_at INTEGER,
  checked_in_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (application_id) REFERENCES applications (id),
  FOREIGN KEY (checked_in_by) REFERENCES users (id)
);

CREATE INDEX idx_participants_checkin_status ON participants (checkin_status, updated_at);
CREATE INDEX idx_participants_gender ON participants (gender);
CREATE INDEX idx_participants_public_checkin_code ON participants (public_checkin_code);

-- Up to 5 meal claims per participant (one row per meal slot)
CREATE TABLE participant_meals (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  meal_key TEXT NOT NULL,
  claimed_by TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants (id),
  FOREIGN KEY (claimed_by) REFERENCES users (id),
  UNIQUE (participant_id, meal_key)
);

CREATE INDEX idx_participant_meals_participant ON participant_meals (participant_id, claimed_at);
