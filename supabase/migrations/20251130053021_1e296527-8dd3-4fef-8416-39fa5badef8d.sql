-- Seed comprehensive ad placements for all major platforms
-- First, let's ensure channels have brand colors and prepare placements

-- Update existing channels with brand colors
UPDATE channels SET brand_color = '#E1306C', icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png' WHERE name ILIKE '%instagram%';
UPDATE channels SET brand_color = '#1877F2', icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/50px-2023_Facebook_icon.svg.png' WHERE name ILIKE '%facebook%';
UPDATE channels SET brand_color = '#000000', icon_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png' WHERE name ILIKE '%tiktok%';
UPDATE channels SET brand_color = '#FF0000', icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/100px-YouTube_full-color_icon_%282017%29.svg.png' WHERE name ILIKE '%youtube%';
UPDATE channels SET brand_color = '#4285F4', icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/50px-Google_%22G%22_logo.svg.png' WHERE name ILIKE '%google%';
UPDATE channels SET brand_color = '#0A66C2', icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/50px-LinkedIn_logo_initials.png' WHERE name ILIKE '%linkedin%';
UPDATE channels SET brand_color = '#1DA1F2', icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/50px-Logo_of_Twitter.svg.png' WHERE name ILIKE '%twitter%' OR name ILIKE '%x %';

-- Insert placements for Instagram (if channel exists)
INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Feed Post (Square)', '1:1', 'MobileFeedMock', 'Square feed post - most common format', true FROM channels WHERE name ILIKE '%instagram%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Feed Post (Portrait)', '4:5', 'MobileFeedMock', 'Vertical feed post - higher engagement', true FROM channels WHERE name ILIKE '%instagram%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Story', '9:16', 'StoryMock', 'Full-screen vertical story', true FROM channels WHERE name ILIKE '%instagram%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Reels', '9:16', 'ReelsMock', 'Vertical short-form video', true FROM channels WHERE name ILIKE '%instagram%' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert placements for Facebook
INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Feed Post', '1:1', 'MobileFeedMock', 'Standard feed post', true FROM channels WHERE name ILIKE '%facebook%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Story', '9:16', 'StoryMock', 'Full-screen story', true FROM channels WHERE name ILIKE '%facebook%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'In-Stream Video', '16:9', 'InStreamMock', 'Video ad within content', true FROM channels WHERE name ILIKE '%facebook%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Reels', '9:16', 'ReelsMock', 'Short-form vertical video', true FROM channels WHERE name ILIKE '%facebook%' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert placements for TikTok
INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'In-Feed Video', '9:16', 'ReelsMock', 'For You page video', true FROM channels WHERE name ILIKE '%tiktok%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'TopView', '9:16', 'StoryMock', 'Full-screen takeover ad', true FROM channels WHERE name ILIKE '%tiktok%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Spark Ads', '9:16', 'ReelsMock', 'Boosted organic content', true FROM channels WHERE name ILIKE '%tiktok%' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert placements for YouTube
INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'In-Stream (Skippable)', '16:9', 'InStreamMock', 'Pre-roll skippable ad', true FROM channels WHERE name ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'In-Stream (Non-Skippable)', '16:9', 'InStreamMock', 'Pre-roll non-skippable ad (15s)', true FROM channels WHERE name ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Shorts', '9:16', 'ReelsMock', 'YouTube Shorts format', true FROM channels WHERE name ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Discovery', '16:9', 'DisplayAdMock', 'Search and browse placement', true FROM channels WHERE name ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Bumper', '16:9', 'InStreamMock', '6-second non-skippable', true FROM channels WHERE name ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert placements for Google
INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Search Text Ad', 'text', 'SearchAdMock', 'Text-based search ad', true FROM channels WHERE name ILIKE '%google%' AND name NOT ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Display Banner (300x250)', '300x250', 'DisplayAdMock', 'Medium rectangle banner', true FROM channels WHERE name ILIKE '%google%' AND name NOT ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Display Banner (728x90)', '728x90', 'BillboardMock', 'Leaderboard banner', true FROM channels WHERE name ILIKE '%google%' AND name NOT ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Display Banner (160x600)', '160x600', 'DisplayAdMock', 'Wide skyscraper', true FROM channels WHERE name ILIKE '%google%' AND name NOT ILIKE '%youtube%' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert placements for LinkedIn
INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Single Image Ad', '1.91:1', 'MobileFeedMock', 'Standard sponsored content', true FROM channels WHERE name ILIKE '%linkedin%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Video Ad', '16:9', 'InStreamMock', 'Sponsored video content', true FROM channels WHERE name ILIKE '%linkedin%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO placements (channel_id, name, aspect_ratio, mock_type, description, is_active)
SELECT id, 'Carousel', '1:1', 'MobileFeedMock', 'Multi-card carousel', true FROM channels WHERE name ILIKE '%linkedin%' LIMIT 1
ON CONFLICT DO NOTHING;