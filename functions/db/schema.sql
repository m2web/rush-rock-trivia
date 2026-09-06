-- Cloudflare D1 Schema: Rush 2026-2027 Fan Parties & Meetups

CREATE TABLE IF NOT EXISTS meetups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tour_city TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  event_date TEXT NOT NULL,             -- Tour date (YYYY-MM-DD)
  start_time TEXT,                     -- e.g. "16:00"
  description TEXT,
  organizer_name TEXT,
  rsvp_link TEXT,
  category TEXT DEFAULT 'tailgate',     -- 'tailgate', 'pub_crawl', 'tribute_band', 'listening_party'
  status TEXT DEFAULT 'approved',       -- 'approved', 'pending_review'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetups_city ON meetups(tour_city);
CREATE INDEX IF NOT EXISTS idx_meetups_date ON meetups(event_date);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
