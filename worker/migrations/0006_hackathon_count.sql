-- Number of prior hackathons when first_hackathon = 0
ALTER TABLE applications ADD COLUMN hackathon_count INTEGER
  CHECK (hackathon_count IS NULL OR (hackathon_count >= 1 AND hackathon_count <= 100));
