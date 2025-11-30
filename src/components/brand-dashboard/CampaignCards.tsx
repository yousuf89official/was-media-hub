import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Zap, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  primary_kpi: string | null;
  kpi_target: number | null;
  funnel_type: string;
  channel?: { id: string; name: string; channel_type: string } | null;
  product?: { id: string; name: string } | null;
  campaign_type?: { id: string; name: string; type_enum: string } | null;
}

interface Metric {
  campaign_id: string;
  impressions: number | null;
  clicks: number | null;
  reach: number | null;
  engagements: number | null;
  spend: number | null;
}

interface CampaignCardsProps {
  campaigns: Campaign[];
  metrics: Metric[];
  selectedCampaignId?: string | null;
  onSelectCampaign?: (campaignId: string) => void;
}

export function CampaignCards({ campaigns, metrics, selectedCampaignId, onSelectCampaign }: CampaignCardsProps) {
  const getMetricsForCampaign = (campaignId: string) => {
    const campaignMetrics = metrics.filter(m => m.campaign_id === campaignId);
    return campaignMetrics.reduce((acc, m) => ({
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      reach: acc.reach + (m.reach || 0),
      engagements: acc.engagements + (m.engagements || 0),
      spend: acc.spend + (m.spend || 0),
    }), { impressions: 0, clicks: 0, reach: 0, engagements: 0, spend: 0 });
  };

  const calculateProgress = (campaign: Campaign, campaignMetrics: ReturnType<typeof getMetricsForCampaign>) => {
    if (!campaign.kpi_target || campaign.kpi_target === 0) return null;
    
    const kpiKey = campaign.primary_kpi?.toLowerCase() || "impressions";
    const currentValue = campaignMetrics[kpiKey as keyof typeof campaignMetrics] || campaignMetrics.impressions;
    const progress = (currentValue / campaign.kpi_target) * 100;
    
    return {
      current: currentValue,
      target: campaign.kpi_target,
      percentage: Math.min(progress, 150),
      actualPercentage: progress,
    };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "finished": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "draft": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (!campaigns.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Target className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm mb-3">No campaigns found</p>
          <Button size="sm" asChild>
            <Link to="/campaigns/new">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create Campaign
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {campaigns.map((campaign) => {
        const campaignMetrics = getMetricsForCampaign(campaign.id);
        const progress = calculateProgress(campaign, campaignMetrics);
        const isSelected = selectedCampaignId === campaign.id;
        
        return (
          <Card 
            key={campaign.id} 
            onClick={() => onSelectCampaign?.(campaign.id)}
            className={cn(
              "relative overflow-hidden transition-all cursor-pointer group",
              "hover:shadow-md hover:border-primary/30",
              campaign.status === "running" && "ring-1 ring-emerald-500/20",
              isSelected && "ring-2 ring-primary border-primary"
            )}
          >
            {/* Status indicator */}
            {campaign.status === "running" && (
              <div className="absolute top-2 right-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            )}

            <CardHeader className="pb-1.5 pt-3 px-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium line-clamp-1">{campaign.name}</CardTitle>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getStatusColor(campaign.status))}>
                    {campaign.status}
                  </Badge>
                  {campaign.channel && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{campaign.channel.name}</Badge>
                  )}
                  {campaign.campaign_type && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {campaign.campaign_type.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 pb-3 px-3">
              {/* KPI Progress Bar */}
              {progress && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-0.5">
                      <Target className="h-2.5 w-2.5" />
                      {campaign.primary_kpi || "Impressions"}
                    </span>
                    <span className={cn(
                      "font-medium",
                      progress.actualPercentage >= 100 ? "text-emerald-600" : 
                      progress.actualPercentage >= 75 ? "text-blue-600" : 
                      progress.actualPercentage >= 50 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {progress.actualPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("absolute inset-y-0 left-0 rounded-full", getProgressColor(progress.actualPercentage))}
                      style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                    <span>{formatNumber(progress.current)}</span>
                    <span>/ {formatNumber(progress.target)}</span>
                  </div>
                </div>
              )}

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded bg-muted/50">
                  <p className="text-[9px] text-muted-foreground">Impr</p>
                  <p className="text-xs font-semibold">{formatNumber(campaignMetrics.impressions)}</p>
                </div>
                <div className="p-1.5 rounded bg-muted/50">
                  <p className="text-[9px] text-muted-foreground">Clicks</p>
                  <p className="text-xs font-semibold">{formatNumber(campaignMetrics.clicks)}</p>
                </div>
                <div className="p-1.5 rounded bg-muted/50">
                  <p className="text-[9px] text-muted-foreground">Engage</p>
                  <p className="text-xs font-semibold">{formatNumber(campaignMetrics.engagements)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t">
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <Badge variant="outline" className="text-[9px] px-1 py-0">
                  <Zap className="h-2 w-2 mr-0.5" />
                  {campaign.funnel_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}