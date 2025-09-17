-- schema.sql

-- festivals table
CREATE TABLE festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  "date" TEXT,
  description TEXT,
  long_description TEXT,
  attendance INT,
  image_url TEXT,
  region TEXT,
  funding_type TEXT, -- 'open' or 'goal-based'
  funding_goal INT,
  current_funding INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sponsorship_tiers table
CREATE TABLE sponsorship_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "type" TEXT, -- 'monetary', 'in-kind', 'service'
  amount INT,
  perks JSONB, -- Store perks as a JSON array of strings
  description TEXT,
  "value" INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sponsors table
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  sponsorship_tier_id UUID REFERENCES sponsorship_tiers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at on table update
CREATE TRIGGER set_festivals_timestamp
BEFORE UPDATE ON festivals
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_sponsorship_tiers_timestamp
BEFORE UPDATE ON sponsorship_tiers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_sponsors_timestamp
BEFORE UPDATE ON sponsors
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

