export type PlatformType = 'instagram-feed' | 'instagram-story' | 'tiktok' | 'youtube' | 'google-search';

export interface Creative {
  id: string;
  campaignId: string;
  platform: PlatformType;
  imageUrl?: string;
  videoUrl?: string;
  headline?: string;
  description?: string;
  cta?: string;
  displayUrl?: string;
  isCollaboration?: boolean;
  isBoosted?: boolean;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagements?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    views?: number;
    clicks?: number;
    ctr?: number;
  };
  source: 'organic' | 'paid' | 'kol';
  createdAt: string;
}

export const PLATFORM_CONFIG: Record<PlatformType, { label: string; aspectRatio: string; icon: string }> = {
  'instagram-feed': { label: 'Instagram Feed', aspectRatio: '1:1', icon: '📷' },
  'instagram-story': { label: 'Instagram Story', aspectRatio: '9:16', icon: '📱' },
  'tiktok': { label: 'TikTok', aspectRatio: '9:16', icon: '🎵' },
  'youtube': { label: 'YouTube', aspectRatio: '16:9', icon: '▶️' },
  'google-search': { label: 'Google Search Ad', aspectRatio: 'text', icon: '🔍' },
};

// Map placement mock_type to PlatformType
export const MOCK_TYPE_TO_PLATFORM: Record<string, PlatformType> = {
  'MobileFeedMock': 'instagram-feed',
  'StoryMock': 'instagram-story',
  'ReelsMock': 'tiktok',
  'InStreamMock': 'youtube',
  'BillboardMock': 'youtube',
  'SearchAdMock': 'google-search',
  'DisplayAdMock': 'google-search',
};

// Helper to map database creative to UI creative
export function mapDBCreativeToUI(dbCreative: {
  id: string;
  campaign_id: string;
  image_url: string | null;
  video_url: string | null;
  headline: string | null;
  description: string | null;
  cta_text: string | null;
  display_url: string | null;
  is_collaboration: boolean;
  is_boosted: boolean;
  source: 'organic' | 'paid' | 'kol';
  metrics: Record<string, number>;
  created_at: string;
  placement?: {
    mock_type: string;
  } | null;
}): Creative {
  // Determine platform from placement mock_type or default to instagram-feed
  const mockType = dbCreative.placement?.mock_type || 'MobileFeedMock';
  const platform = MOCK_TYPE_TO_PLATFORM[mockType] || 'instagram-feed';

  return {
    id: dbCreative.id,
    campaignId: dbCreative.campaign_id,
    platform,
    imageUrl: dbCreative.image_url || undefined,
    videoUrl: dbCreative.video_url || undefined,
    headline: dbCreative.headline || undefined,
    description: dbCreative.description || undefined,
    cta: dbCreative.cta_text || undefined,
    displayUrl: dbCreative.display_url || undefined,
    isCollaboration: dbCreative.is_collaboration,
    isBoosted: dbCreative.is_boosted,
    metrics: {
      impressions: dbCreative.metrics?.impressions || 0,
      reach: dbCreative.metrics?.reach || 0,
      engagements: dbCreative.metrics?.engagements || 0,
      likes: dbCreative.metrics?.likes || 0,
      comments: dbCreative.metrics?.comments || 0,
      shares: dbCreative.metrics?.shares || 0,
      saves: dbCreative.metrics?.saves || 0,
      views: dbCreative.metrics?.views || 0,
      clicks: dbCreative.metrics?.clicks || 0,
      ctr: dbCreative.metrics?.ctr || 0,
    },
    source: dbCreative.source,
    createdAt: dbCreative.created_at,
  };
}
