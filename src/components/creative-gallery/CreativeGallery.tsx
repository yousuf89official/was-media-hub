import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Eye, TrendingUp, Upload } from 'lucide-react';
import { Creative, PlatformType, PLATFORM_CONFIG } from './types';
import { InstagramFeedMockup } from './mockups/InstagramFeedMockup';
import { InstagramStoryMockup } from './mockups/InstagramStoryMockup';
import { TikTokMockup } from './mockups/TikTokMockup';
import { YouTubeMockup } from './mockups/YouTubeMockup';
import { GoogleSearchMockup } from './mockups/GoogleSearchMockup';
import { useChannels } from '@/hooks/useChannels';
import { usePlacements } from '@/hooks/usePlacements';

interface CreativeGalleryProps {
  brandName?: string;
  campaignId?: string;
}

// Mock data for demonstration
const MOCK_CREATIVES: Creative[] = [
  {
    id: '1',
    campaignId: '1',
    platform: 'instagram-feed',
    description: 'Introducing our newest innovation! Experience the difference. #NewProduct',
    isCollaboration: false,
    isBoosted: true,
    metrics: { impressions: 125000, reach: 98000, engagements: 8500, likes: 7200 },
    source: 'paid',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    campaignId: '1',
    platform: 'tiktok',
    description: 'POV: You just discovered the best product ever 🤯 #fyp #viral',
    isCollaboration: true,
    isBoosted: false,
    metrics: { impressions: 450000, reach: 380000, engagements: 45000, views: 420000 },
    source: 'kol',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    campaignId: '1',
    platform: 'youtube',
    headline: 'Product Launch 2024 - Full Review',
    description: 'In this video, we reveal our latest product...',
    isBoosted: true,
    metrics: { impressions: 89000, reach: 75000, engagements: 12000, views: 125000 },
    source: 'paid',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    campaignId: '1',
    platform: 'google-search',
    headline: 'Premium Products | Free Shipping',
    description: 'Shop our award-winning collection. 30-day returns.',
    displayUrl: 'www.example.com/shop',
    isBoosted: true,
    metrics: { impressions: 250000, clicks: 7500, ctr: 0.03 },
    source: 'paid',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    campaignId: '1',
    platform: 'instagram-story',
    cta: 'Shop Now',
    isBoosted: true,
    metrics: { impressions: 45000, reach: 38000, engagements: 2100 },
    source: 'paid',
    createdAt: '2024-01-11',
  },
];

export function CreativeGallery({ brandName = 'Brand', campaignId }: CreativeGalleryProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  const { data: channels } = useChannels();
  const { data: placements } = usePlacements(selectedPlatform !== 'all' ? selectedPlatform : undefined);

  const filteredCreatives = MOCK_CREATIVES.filter(creative => {
    if (selectedPlatform !== 'all' && creative.platform !== selectedPlatform) return false;
    if (selectedSource !== 'all' && creative.source !== selectedSource) return false;
    return true;
  });

  const renderMockup = (creative: Creative, scale: 'small' | 'large' = 'small') => {
    const scaleClass = scale === 'small' ? 'scale-[0.45]' : 'scale-75';
    const wrapperClass = scale === 'small' ? 'h-[180px] w-[100px]' : '';
    
    const mockup = (() => {
      switch (creative.platform) {
        case 'instagram-feed':
          return <InstagramFeedMockup creative={creative} brandName={brandName} />;
        case 'instagram-story':
          return <InstagramStoryMockup creative={creative} brandName={brandName} />;
        case 'tiktok':
          return <TikTokMockup creative={creative} brandName={brandName} />;
        case 'youtube':
          return <YouTubeMockup creative={creative} brandName={brandName} />;
        case 'google-search':
          return <GoogleSearchMockup creative={creative} brandName={brandName} />;
        default:
          return null;
      }
    })();

    if (scale === 'small') {
      return (
        <div className={`${wrapperClass} overflow-hidden flex items-start justify-center`}>
          <div className={`transform ${scaleClass} origin-top`}>{mockup}</div>
        </div>
      );
    }
    return mockup;
  };

  const getSourceBadge = (source: Creative['source']) => {
    const styles = {
      organic: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      paid: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      kol: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    };
    return <Badge variant="outline" className={`text-[9px] px-1 ${styles[source]}`}>{source.toUpperCase()}</Badge>;
  };

  const formatMetric = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Creative Gallery</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{filteredCreatives.length}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="h-7 w-[110px] text-xs">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="h-7 w-[90px] text-xs">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="kol">KOL</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Upload className="h-3 w-3" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
          {filteredCreatives.map(creative => (
            <Dialog key={creative.id}>
              <DialogTrigger asChild>
                <div 
                  className="flex flex-col cursor-pointer group rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all overflow-hidden"
                  onClick={() => setSelectedCreative(creative)}
                >
                  {/* Mockup Preview */}
                  <div className="bg-muted/30 flex items-center justify-center p-1">
                    {renderMockup(creative, 'small')}
                  </div>
                  
                  {/* Info */}
                  <div className="p-1.5 space-y-1 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground truncate">
                        {PLATFORM_CONFIG[creative.platform]?.label}
                      </span>
                      {getSourceBadge(creative.source)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" />
                        {formatMetric(creative.metrics?.impressions || 0)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" />
                        {formatMetric(creative.metrics?.engagements || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-sm">
                    {PLATFORM_CONFIG[creative.platform]?.icon} {PLATFORM_CONFIG[creative.platform]?.label}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col lg:flex-row gap-4 mt-2">
                  <div className="flex justify-center">
                    {renderMockup(creative, 'large')}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-xs font-medium mb-2">Performance</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {creative.metrics?.impressions && (
                          <div className="p-2 bg-muted rounded">
                            <p className="text-[10px] text-muted-foreground">Impressions</p>
                            <p className="text-sm font-semibold">{creative.metrics.impressions.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.reach && (
                          <div className="p-2 bg-muted rounded">
                            <p className="text-[10px] text-muted-foreground">Reach</p>
                            <p className="text-sm font-semibold">{creative.metrics.reach.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.engagements && (
                          <div className="p-2 bg-muted rounded">
                            <p className="text-[10px] text-muted-foreground">Engagements</p>
                            <p className="text-sm font-semibold">{creative.metrics.engagements.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.views && (
                          <div className="p-2 bg-muted rounded">
                            <p className="text-[10px] text-muted-foreground">Views</p>
                            <p className="text-sm font-semibold">{creative.metrics.views.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium mb-2">Details</h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source</span>
                          {getSourceBadge(creative.source)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collaboration</span>
                          <span>{creative.isCollaboration ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Boosted</span>
                          <span>{creative.isBoosted ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{new Date(creative.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {filteredCreatives.length === 0 && (
          <div className="text-center py-8">
            <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No creatives found</p>
            <Button size="sm" variant="outline" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Upload Creative
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}