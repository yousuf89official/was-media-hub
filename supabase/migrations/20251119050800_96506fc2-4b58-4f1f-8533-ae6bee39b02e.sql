-- Add Media Relations channel
INSERT INTO channels (name, channel_type, created_at, updated_at)
VALUES ('Media Relations', 'PR', NOW(), NOW());

-- Add CPM rate entry for consistency (value 0 as it's not used for PR calculations)
INSERT INTO cpm_rates (channel_id, cpm_value, effective_from, currency)
SELECT id, 0, CURRENT_DATE, 'IDR' 
FROM channels 
WHERE name = 'Media Relations';

-- Create media_outlets table
CREATE TABLE media_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
  pr_value_per_article NUMERIC NOT NULL CHECK (pr_value_per_article > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_media_outlets_updated_at
  BEFORE UPDATE ON media_outlets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE media_outlets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_outlets
CREATE POLICY "Authenticated users can view active media outlets"
  ON media_outlets FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "MasterAdmin can manage media outlets"
  ON media_outlets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'MasterAdmin'
    )
  );

-- Create pr_settings table
CREATE TABLE pr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value NUMERIC NOT NULL CHECK (setting_value > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_pr_settings_updated_at
  BEFORE UPDATE ON pr_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE pr_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pr_settings
CREATE POLICY "Authenticated users can view pr settings"
  ON pr_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage pr settings"
  ON pr_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'MasterAdmin'
    )
  );

-- Insert default eCPM value
INSERT INTO pr_settings (setting_key, setting_value, description)
VALUES ('ecpm', 45000, 'Effective CPM value for PR calculations in IDR');

-- Seed media outlets data
INSERT INTO media_outlets (name, tier, pr_value_per_article) VALUES
('Medcom.id', 1, 8000000),
('Rm.id', 1, 3000000),
('Bola.com', 1, 25000000),
('Voi.id', 1, 3000000),
('Bolaskor.merahputih.com', 1, 3000000),
('Harian.disway.id', 1, 3000000),
('Viva.co.id', 1, 25000000),
('Tribunnews.com', 1, 25000000),
('Bolasport.com', 1, 8000000),
('Akurat.co', 1, 8000000),
('Idntimes.com', 1, 3000000),
('Konsuil.or.id', 3, 500000),
('Suarapubliknews.net', 3, 500000),
('Seru.co.id', 3, 3000000),
('Lintasperkoro.com', 3, 500000),
('Butota.id', 3, 500000),
('Beritalima.com', 3, 500000),
('Alongwalker.co', 3, 500000);