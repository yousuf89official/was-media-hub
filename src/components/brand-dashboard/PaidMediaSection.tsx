import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, DollarSign, TrendingUp, Grid3X3, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlacements } from "@/hooks/usePlacements";
import { Creative } from "@/components/creative-gallery/types";
import { InstagramFeedMockup } from "@/components/creative-gallery/mockups/InstagramFeedMockup";
import { InstagramStoryMockup } from "@/components/creative-gallery/mockups/InstagramStoryMockup";
import { TikTokMockup } from "@/components/creative-gallery/mockups/TikTokMockup";
import { YouTubeMockup } from "@/components/creative-gallery/mockups/YouTubeMockup";
import { GoogleSearchMockup } from "@/components/creative-gallery/mockups/GoogleSearchMockup";

interface Campaign {
  id: string;
  name: string;
  status: string;
  channel?: { id: string; name: string; channel_type: string } | null;
}

interface Metric {
  campaign_id: string;
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
}

interface PaidMediaSectionProps {
  campaigns: Campaign[];
  metrics: Metric[];
  brandName: string;
}

interface PlacementMockupProps {
  mockType: string;
  brandName: string;
  placementName: string;
}

function createDummyCreative(brandName: string, placementName: string): Creative {
  return {
    id: 'preview',
    campaignId: '',
    platform: 'instagram-feed',
    imageUrl: '/placeholder.svg',
    description: `${placementName} preview`,
    source: 'paid',
    createdAt: new Date().toISOString(),
    metrics: { impressions: 0, engagements: 0 }
  };
}

function PlacementMockup({ mockType, brandName, placementName }: PlacementMockupProps) {
  const creative = createDummyCreative(brandName, placementName);

  switch (mockType) {
    case 'MobileFeedMock':
      return <InstagramFeedMockup creative={creative} brandName={brandName} />;
    case 'StoryMock':
      return <InstagramStoryMockup creative={creative} brandName={brandName} />;
    case 'ReelsMock':
      return <TikTokMockup creative={creative} brandName={brandName} />;
    case 'InStreamMock':
      return <YouTubeMockup creative={creative} brandName={brandName} />;
    case 'SearchAdMock':
      return <GoogleSearchMockup creative={creative} brandName={brandName} />;
    case 'DisplayAdMock':
      return (
        <div className="w-[200px] h-[150px] bg-muted rounded-lg flex items-center justify-center border">
          <div className="text-center p-2">
            <div className="text-xs text-muted-foreground mb-1">Display Ad</div>
            <div className="w-full h-16 bg-background rounded border flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">{placementName}</span>
            </div>
          </div>
        </div>
      );
    case 'BillboardMock':
      return (
        <div className="w-[280px] h-[80px] bg-muted rounded-lg flex items-center justify-center border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Billboard</div>
            <div className="text-[10px] text-muted-foreground">{placementName}</div>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-[150px] h-[150px] bg-muted rounded-lg flex items-center justify-center border">
          <span className="text-xs text-muted-foreground">{placementName}</span>
        </div>
      );
  }
}

function CampaignPlacementsModal({ campaign, placements, brandName }: { 
  campaign: Campaign; 
  placements: any[]; 
  brandName: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
          <Grid3X3 className="h-3 w-3" />
          View All ({placements.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-sm">{campaign.name} - All Placements</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
            {placements.map((placement) => (
              <div key={placement.id} className="flex flex-col items-center gap-2">
                <div className="transform scale-50 origin-top">
                  <PlacementMockup
                    mockType={placement.mock_type}
                    brandName={brandName}
                    placementName={placement.name}
                  />
                </div>
                <div className="text-center -mt-16">
                  <p className="text-xs font-medium">{placement.name}</p>
                  <p className="text-[10px] text-muted-foreground">{placement.aspect_ratio}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function PaidMediaSection({ campaigns, metrics, brandName }: PaidMediaSectionProps) {
  const paidCampaigns = campaigns.filter(c => c.status === "running");
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (paidCampaigns.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          Active Paid Media
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {paidCampaigns.map((campaign) => (
            <PaidCampaignCard
              key={campaign.id}
              campaign={campaign}
              metrics={metrics}
              brandName={brandName}
              formatNumber={formatNumber}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PaidCampaignCard({ 
  campaign, 
  metrics, 
  brandName, 
  formatNumber, 
  formatCurrency 
}: { 
  campaign: Campaign; 
  metrics: Metric[]; 
  brandName: string;
  formatNumber: (n: number) => string;
  formatCurrency: (n: number) => string;
}) {
  const { data: placements = [] } = usePlacements(campaign.channel?.id);
  const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
  
  const aggregated = campaignMetrics.reduce((acc, m) => ({
    impressions: acc.impressions + (m.impressions || 0),
    clicks: acc.clicks + (m.clicks || 0),
    spend: acc.spend + (m.spend || 0),
  }), { impressions: 0, clicks: 0, spend: 0 });

  const ctr = aggregated.impressions > 0 
    ? ((aggregated.clicks / aggregated.impressions) * 100).toFixed(2) 
    : "0.00";

  const primaryPlacement = placements[0];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Primary Mockup Preview */}
        <div className="w-24 h-32 bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
          {primaryPlacement ? (
            <div className="transform scale-[0.25] origin-center">
              <PlacementMockup
                mockType={primaryPlacement.mock_type}
                brandName={brandName}
                placementName={primaryPlacement.name}
              />
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground text-center p-2">
              No placement
            </div>
          )}
        </div>

        {/* Campaign Info */}
        <div className="flex-1 p-2 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="min-w-0">
              <h4 className="text-xs font-medium truncate">{campaign.name}</h4>
              {campaign.channel && (
                <Badge variant="secondary" className="text-[9px] h-4 mt-0.5">
                  {campaign.channel.name}
                </Badge>
              )}
            </div>
            <Badge variant="default" className="text-[9px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 shrink-0">
              Live
            </Badge>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px]">{formatNumber(aggregated.impressions)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px]">{ctr}% CTR</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px]">{formatCurrency(aggregated.spend)}</span>
            </div>
          </div>

          {/* View All Placements */}
          {placements.length > 0 && (
            <div className="mt-2 pt-1 border-t">
              <CampaignPlacementsModal 
                campaign={campaign} 
                placements={placements} 
                brandName={brandName} 
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
