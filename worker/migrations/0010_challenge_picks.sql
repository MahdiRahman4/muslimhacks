-- One challenge pick per accepted participant, plus sponsor IP-grant acknowledgement.
CREATE TABLE challenge_signups_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  challenge_id TEXT NOT NULL,
  signed_up_at INTEGER NOT NULL,
  ip_acknowledged INTEGER NOT NULL DEFAULT 0 CHECK (ip_acknowledged IN (0, 1)),
  ip_acknowledged_at INTEGER,
  ip_owner TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO challenge_signups_v2 (id, user_id, challenge_id, signed_up_at)
SELECT id, user_id, challenge_id, signed_up_at
FROM challenge_signups;

DROP TABLE challenge_signups;

ALTER TABLE challenge_signups_v2 RENAME TO challenge_signups;

CREATE INDEX idx_challenge_signups_challenge ON challenge_signups (challenge_id);
