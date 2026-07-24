-- Clerk user linking + Shahzoab application form fields

ALTER TABLE users ADD COLUMN clerk_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id) WHERE clerk_id IS NOT NULL;

ALTER TABLE applications ADD COLUMN accessibility TEXT;
ALTER TABLE applications ADD COLUMN first_hackathon INTEGER CHECK (first_hackathon IS NULL OR first_hackathon IN (0, 1));
ALTER TABLE applications ADD COLUMN cs_career INTEGER CHECK (cs_career IS NULL OR cs_career IN (0, 1));
ALTER TABLE applications ADD COLUMN motivation TEXT;
ALTER TABLE applications ADD COLUMN past_project TEXT;
ALTER TABLE applications ADD COLUMN interests TEXT;
ALTER TABLE applications ADD COLUMN community TEXT;
ALTER TABLE applications ADD COLUMN resume_key TEXT;
