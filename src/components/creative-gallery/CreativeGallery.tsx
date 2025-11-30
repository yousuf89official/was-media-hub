import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Filter, Eye, TrendingUp, Plus, Upload } from 'lucide-react';
import { Creative, PlatformType, PLATFORM_CONFIG } from './types';
import { InstagramFeedMockup } from './mockups/InstagramFeedMockup';
import { InstagramStoryMockup } from './mockups/InstagramStoryMockup';
import { TikTokMockup } from './mockups/TikTokMockup';
import { YouTubeMockup } from './mockups/YouTubeMockup';
import { GoogleSearchMockup } from './mockups/GoogleSearchMockup';

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
    description: 'Introducing our newest innovation! Experience the difference. #NewProduct #Innovation',
    isCollaboration: false,
    isBoosted: true,
    metrics: { impressions: 125000, reach: 98000, engagements: 8500, likes: 7200, comments: 342, shares: 189, saves: 567 },
    source: 'paid',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    campaignId: '1',
    platform: 'tiktok',
    description: 'POV: You just discovered the best product ever 🤯 #fyp #viral #musthave',
    isCollaboration: true,
    isBoosted: false,
    metrics: { impressions: 450000, reach: 380000, engagements: 45000, likes: 38000, comments: 2100, shares: 4200, saves: 890, views: 420000 },
    source: 'kol',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    campaignId: '1',
    platform: 'youtube',
    headline: 'Product Launch 2024 - Full Review & Unboxing',
    description: 'In this video, we reveal our latest product...',
    isBoosted: true,
    metrics: { impressions: 89000, reach: 75000, engagements: 12000, likes: 8500, views: 125000 },
    source: 'paid',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    campaignId: '1',
    platform: 'google-search',
    headline: 'Premium Products | Free Shipping Today',
    description: 'Shop our award-winning collection. 30-day returns. Premium quality guaranteed. Order now and get 20% off!',
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

  const filteredCreatives = MOCK_CREATIVES.filter(creative => {
    if (selectedPlatform !== 'all' && creative.platform !== selectedPlatform) return false;
    if (selectedSource !== 'all' && creative.source !== selectedSource) return false;
    return true;
  });

  const renderMockup = (creative: Creative) => {
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
  };

  const getSourceBadge = (source: Creative['source']) => {
    switch (source) {
      case 'organic':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Organic</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Paid</Badge>;
      case 'kol':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">KOL</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle>Creative Gallery</CardTitle>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Creative
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="kol">KOL</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredCreatives.length} creative{filteredCreatives.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreatives.map(creative => (
            <Dialog key={creative.id}>
              <DialogTrigger asChild>
                <div 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setSelectedCreative(creative)}
                >
                  {/* Mockup Preview */}
                  <div className="transform scale-75 origin-top transition-transform group-hover:scale-[0.78]">
                    {renderMockup(creative)}
                  </div>
                  
                  {/* Info Bar */}
                  <div className="w-full max-w-[240px] -mt-6 p-3 bg-card rounded-lg border shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {PLATFORM_CONFIG[creative.platform]?.icon} {PLATFORM_CONFIG[creative.platform]?.label}
                      </span>
                      {getSourceBadge(creative.source)}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {((creative.metrics?.impressions || 0) / 1000).toFixed(1)}K
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {((creative.metrics?.engagements || 0) / 1000).toFixed(1)}K
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {creative.isCollaboration && (
                        <Badge variant="secondary" className="text-[10px]">Collab</Badge>
                      )}
                      {creative.isBoosted && (
                        <Badge variant="secondary" className="text-[10px]">Boosted</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {PLATFORM_CONFIG[creative.platform]?.icon} {PLATFORM_CONFIG[creative.platform]?.label} Creative
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col lg:flex-row gap-6 mt-4">
                  <div className="flex justify-center">
                    {renderMockup(creative)}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {creative.metrics?.impressions && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Impressions</p>
                            <p className="text-lg font-semibold">{creative.metrics.impressions.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.reach && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Reach</p>
                            <p className="text-lg font-semibold">{creative.metrics.reach.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.engagements && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Engagements</p>
                            <p className="text-lg font-semibold">{creative.metrics.engagements.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.views && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Views</p>
                            <p className="text-lg font-semibold">{creative.metrics.views.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.clicks && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Clicks</p>
                            <p className="text-lg font-semibold">{creative.metrics.clicks.toLocaleString()}</p>
                          </div>
                        )}
                        {creative.metrics?.ctr !== undefined && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">CTR</p>
                            <p className="text-lg font-semibold">{(creative.metrics.ctr * 100).toFixed(2)}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Details</h4>
                      <div className="space-y-2 text-sm">
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
          <div className="text-center py-12">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No creatives found</h3>
            <p className="text-muted-foreground mb-4">Upload your first creative to get started</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Creative
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
