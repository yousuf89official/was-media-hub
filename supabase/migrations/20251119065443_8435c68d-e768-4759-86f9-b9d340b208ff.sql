-- Drop old data from media_outlets
TRUNCATE TABLE media_outlets CASCADE;

-- Add new columns to media_outlets table
ALTER TABLE media_outlets
ADD COLUMN IF NOT EXISTS average_monthly_visits bigint NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_page_views_per_article integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS ecpm numeric NOT NULL DEFAULT 0;

-- Remove old pr_value_per_article column
ALTER TABLE media_outlets
DROP COLUMN IF EXISTS pr_value_per_article;

-- Insert new media outlets data
INSERT INTO media_outlets (name, tier, average_monthly_visits, average_page_views_per_article, ecpm, is_active) VALUES
('Kompas.com', 1, 170000000, 25000, 65000, true),
('Detik.com', 1, 160000000, 23000, 60000, true),
('Tribunnews.com', 1, 155000000, 20000, 55000, true),
('CNBC Indonesia', 1, 40000000, 13000, 65000, true),
('Tempo.co', 1, 30000000, 10000, 55000, true),
('Kompas.id', 1, 20000000, 10000, 70000, true),
('CNN Indonesia', 1, 35000000, 15000, 65000, true),
('Liputan6.com', 1, 120000000, 20000, 60000, true),
('IDN Times', 1, 85000000, 10000, 50000, true),
('Msn.com', 1, 220000000, 30000, 70000, true),
('Suara.com', 2, 80000000, 8000, 40000, true),
('Viva.co.id', 2, 65000000, 9000, 45000, true),
('Okezone.com', 2, 70000000, 9000, 40000, true),
('Kumparan.com', 2, 60000000, 8000, 40000, true),
('Sindonews.com', 2, 55000000, 8000, 40000, true),
('Merdeka.com', 2, 65000000, 8000, 40000, true),
('Bola.com', 2, 37500000, 8000, 45000, true),
('BolaSport.com', 2, 17000000, 7000, 40000, true),
('Grid.id', 2, 30000000, 7000, 35000, true),
('Popbela.com', 2, 25000000, 6000, 35000, true),
('BeritaSatu.com', 2, 10000000, 5000, 35000, true),
('Medcom.id', 2, 11000000, 8000, 45000, true),
('Voi.id', 2, 13000000, 7000, 40000, true),
('Skor.republika.co.id', 2, 11000000, 7000, 40000, true),
('Rri.co.id', 2, 9000000, 6000, 35000, true),
('Skor.id', 2, 13000000, 8000, 45000, true),
('RM.id', 3, 5000000, 3000, 25000, true),
('Seru.co.id', 3, 2000000, 2000, 20000, true),
('Butota.id', 3, 1000000, 1500, 15000, true),
('BeritaJatim.com', 3, 4000000, 2000, 20000, true),
('RiauOnline.id', 3, 2500000, 2000, 20000, true),
('Manadopost.id', 3, 2000000, 2000, 20000, true),
('BatamNews.co.id', 3, 1500000, 2000, 20000, true),
('KaltimPost.co.id', 3, 1500000, 2000, 20000, true),
('Konsuil.or.id', 3, 400000, 1000, 15000, true),
('Suarapubliknews.net', 3, 1500000, 1500, 20000, true),
('Harian.disway.id', 3, 1500000, 1500, 20000, true),
('Lintasperkoro.com', 3, 900000, 1500, 20000, true),
('Bolaskor.merahputih.com', 3, 1500000, 2000, 20000, true),
('Akurat.co', 3, 6000000, 4000, 30000, true),
('Beritalima.com', 3, 2500000, 2500, 25000, true),
('Alongwalker.co', 3, 400000, 1000, 15000, true),
('Volinesia.com', 3, 600000, 1000, 15000, true),
('Fokusjabar.id', 3, 2500000, 2000, 20000, true),
('Radarjabar.disway.id', 3, 1500000, 1500, 20000, true),
('Kurasimedia.com', 3, 700000, 1000, 15000, true),
('Dialogpublik.com', 3, 1200000, 1500, 20000, true),
('Markettrack.id', 3, 700000, 1000, 15000, true),
('Jurnalmedia.com', 3, 1500000, 1500, 20000, true),
('Jabarekspres.com', 3, 4000000, 2500, 25000, true),
('Infonawacita.or.id', 3, 400000, 1000, 15000, true),
('Gerbangindonesia.co.id', 3, 900000, 1500, 20000, true),
('Deskjabar.pikiran-rakyat.com', 3, 4000000, 2500, 25000, true),
('Businessasia.co.id', 3, 1500000, 1500, 20000, true),
('Fokusenergi.com', 3, 700000, 1000, 15000, true);