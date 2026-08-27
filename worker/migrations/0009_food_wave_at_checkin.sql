-- Food colours are assigned at event check-in, not at approval.
ALTER TABLE participants ADD COLUMN food_wave_key TEXT;

CREATE TABLE food_wave_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  next_rank INTEGER NOT NULL
);

INSERT INTO food_wave_counter (id, next_rank) VALUES (1, 0);
