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
