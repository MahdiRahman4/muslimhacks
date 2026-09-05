-- Trail of destructive admin actions. Deliberately has no foreign keys: the
-- whole point is that it outlives the rows it describes, so the actor and the
-- target are copied in as plain text alongside a JSON snapshot.
CREATE TABLE admin_action_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email TEXT,
  actor_name TEXT,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_label TEXT,
  details TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_admin_action_log_created ON admin_action_log (created_at DESC);
CREATE INDEX idx_admin_action_log_action ON admin_action_log (action, created_at DESC);
CREATE INDEX idx_admin_action_log_target ON admin_action_log (target_type, target_id);
