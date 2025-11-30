-- Link channels to their platform categories (skip LinkedIn - no category exists)
UPDATE channels SET channel_category_id = '4cf66420-af9f-4e68-9c97-dfe3a0089a16' WHERE name IN ('Instagram', 'Facebook');
UPDATE channels SET channel_category_id = 'cba57f13-97a2-45b7-aaa4-3b623fce02c8' WHERE name = 'YouTube';
UPDATE channels SET channel_category_id = '06cc16e7-1037-413d-b90c-4833719c7968' WHERE name = 'TikTok';

-- Seed Objectives with channel associations and funnel types
INSERT INTO objectives (name, description, funnel_type, channel_id) VALUES
-- Meta/Instagram objectives
('Brand Awareness', 'Increase awareness of your brand', 'TOP', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Reach', 'Show your ad to maximum people', 'TOP', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Video Views', 'Get more views on your video content', 'TOP', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Traffic', 'Drive traffic to your website', 'MID', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Engagement', 'Get more likes, comments, and shares', 'MID', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Lead Generation', 'Collect leads from interested users', 'MID', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Conversions', 'Drive valuable actions on your website', 'BOTTOM', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('Catalog Sales', 'Drive sales from your product catalog', 'BOTTOM', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
-- Facebook objectives
('Brand Awareness', 'Increase awareness of your brand', 'TOP', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('Reach', 'Show your ad to maximum people', 'TOP', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('Video Views', 'Get more views on your video content', 'TOP', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('Traffic', 'Drive traffic to your website', 'MID', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('Engagement', 'Get more likes, comments, and shares', 'MID', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('Conversions', 'Drive valuable actions on your website', 'BOTTOM', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
-- TikTok objectives
('Reach', 'Maximize ad reach', 'TOP', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('Video Views', 'Get more video views', 'TOP', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('Traffic', 'Drive traffic to destination', 'MID', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('Community Interaction', 'Increase followers and engagement', 'MID', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('Conversions', 'Drive website conversions', 'BOTTOM', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('App Promotion', 'Drive app installs and events', 'BOTTOM', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
-- YouTube objectives
('Brand Awareness', 'Increase brand recall', 'TOP', 'de44e07c-3e4a-447d-b11a-889e83e4f308'),
('Video Views', 'Maximize video views', 'TOP', 'de44e07c-3e4a-447d-b11a-889e83e4f308'),
('Consideration', 'Drive product consideration', 'MID', 'de44e07c-3e4a-447d-b11a-889e83e4f308'),
('Conversions', 'Drive website actions', 'BOTTOM', 'de44e07c-3e4a-447d-b11a-889e83e4f308');

-- Seed Buying Models with channel associations
INSERT INTO buying_models (name, description, channel_id) VALUES
('CPM', 'Cost per 1,000 impressions', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('CPC', 'Cost per click', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('CPV', 'Cost per video view', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('CPA', 'Cost per acquisition/action', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('ROAS', 'Return on ad spend optimization', '3a50fdc8-75bd-4941-aa6d-635f4f814105'),
('CPM', 'Cost per 1,000 impressions', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('CPC', 'Cost per click', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('CPV', 'Cost per video view', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('CPA', 'Cost per acquisition/action', 'ab3e277e-51aa-4f64-8766-e35ffb5ad9b8'),
('CPM', 'Cost per 1,000 impressions', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('CPC', 'Cost per click', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('CPV', 'Cost per 6-second video view', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('oCPM', 'Optimized CPM for conversions', '754fdf91-e904-48a7-a4c9-5fa8e2166d94'),
('CPV', 'Cost per view (TrueView)', 'de44e07c-3e4a-447d-b11a-889e83e4f308'),
('CPM', 'Cost per 1,000 impressions', 'de44e07c-3e4a-447d-b11a-889e83e4f308'),
('Target CPA', 'Target cost per acquisition', 'de44e07c-3e4a-447d-b11a-889e83e4f308'),
('Maximize Conversions', 'Automated bidding for conversions', 'de44e07c-3e4a-447d-b11a-889e83e4f308');

-- Seed campaign_channel_configs for existing campaigns
INSERT INTO campaign_channel_configs (campaign_id, channel_id, budget) 
SELECT '710473a6-6fe8-4dbd-871e-fc4687874f64', id, 15000000 FROM channels WHERE name = 'Instagram'
ON CONFLICT DO NOTHING;
INSERT INTO campaign_channel_configs (campaign_id, channel_id, budget) 
SELECT '710473a6-6fe8-4dbd-871e-fc4687874f64', id, 10000000 FROM channels WHERE name = 'TikTok'
ON CONFLICT DO NOTHING;
INSERT INTO campaign_channel_configs (campaign_id, channel_id, budget) 
SELECT '1d6dbc4a-aa70-4ebe-a87e-16dc77c2bd39', id, 20000000 FROM channels WHERE name = 'Instagram'
ON CONFLICT DO NOTHING;
INSERT INTO campaign_channel_configs (campaign_id, channel_id, budget) 
SELECT '1d6dbc4a-aa70-4ebe-a87e-16dc77c2bd39', id, 12000000 FROM channels WHERE name = 'YouTube'
ON CONFLICT DO NOTHING;

-- Seed realistic metrics for 30 days
INSERT INTO metrics (campaign_id, channel_id, date, impressions, clicks, reach, engagements, video_views, spend)
SELECT 
  '710473a6-6fe8-4dbd-871e-fc4687874f64',
  '3a50fdc8-75bd-4941-aa6d-635f4f814105',
  generate_series::date,
  (random() * 50000 + 80000)::bigint,
  (random() * 2000 + 1500)::bigint,
  (random() * 40000 + 60000)::bigint,
  (random() * 3000 + 2000)::bigint,
  (random() * 15000 + 10000)::bigint,
  (random() * 500000 + 400000)::numeric
FROM generate_series('2024-11-01'::date, '2024-11-30'::date, '1 day'::interval);

INSERT INTO metrics (campaign_id, channel_id, date, impressions, clicks, reach, engagements, video_views, spend)
SELECT 
  '710473a6-6fe8-4dbd-871e-fc4687874f64',
  '754fdf91-e904-48a7-a4c9-5fa8e2166d94',
  generate_series::date,
  (random() * 80000 + 120000)::bigint,
  (random() * 1500 + 1000)::bigint,
  (random() * 60000 + 90000)::bigint,
  (random() * 5000 + 4000)::bigint,
  (random() * 30000 + 25000)::bigint,
  (random() * 350000 + 300000)::numeric
FROM generate_series('2024-11-01'::date, '2024-11-30'::date, '1 day'::interval);

INSERT INTO metrics (campaign_id, channel_id, date, impressions, clicks, reach, engagements, video_views, spend)
SELECT 
  '1d6dbc4a-aa70-4ebe-a87e-16dc77c2bd39',
  '3a50fdc8-75bd-4941-aa6d-635f4f814105',
  generate_series::date,
  (random() * 60000 + 100000)::bigint,
  (random() * 2500 + 2000)::bigint,
  (random() * 50000 + 75000)::bigint,
  (random() * 4000 + 3000)::bigint,
  (random() * 20000 + 15000)::bigint,
  (random() * 650000 + 500000)::numeric
FROM generate_series('2024-11-01'::date, '2024-11-30'::date, '1 day'::interval);

INSERT INTO metrics (campaign_id, channel_id, date, impressions, clicks, reach, engagements, video_views, spend)
SELECT 
  '1d6dbc4a-aa70-4ebe-a87e-16dc77c2bd39',
  'de44e07c-3e4a-447d-b11a-889e83e4f308',
  generate_series::date,
  (random() * 40000 + 70000)::bigint,
  (random() * 1000 + 800)::bigint,
  (random() * 35000 + 55000)::bigint,
  (random() * 2000 + 1500)::bigint,
  (random() * 25000 + 20000)::bigint,
  (random() * 400000 + 350000)::numeric
FROM generate_series('2024-11-01'::date, '2024-11-30'::date, '1 day'::interval);