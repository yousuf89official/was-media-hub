import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Target, TrendingUp, ExternalLink, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function CampaignCards({ campaigns, metrics }: CampaignCardsProps) {
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
      percentage: Math.min(progress, 150), // Cap at 150% for display
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
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No campaigns found</p>
          <Button asChild>
            <Link to="/campaigns/new">Create Campaign</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {campaigns.map((campaign) => {
        const campaignMetrics = getMetricsForCampaign(campaign.id);
        const progress = calculateProgress(campaign, campaignMetrics);
        
        return (
          <Card 
            key={campaign.id} 
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-lg group",
              campaign.status === "running" && "ring-2 ring-emerald-500/20"
            )}
          >
            {/* Status indicator */}
            {campaign.status === "running" && (
              <div className="absolute top-3 right-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
            )}

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">{campaign.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    {campaign.channel && (
                      <Badge variant="secondary">{campaign.channel.name}</Badge>
                    )}
                    {campaign.campaign_type && (
                      <Badge variant="outline" className="text-xs">
                        {campaign.campaign_type.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* KPI Progress Bar */}
              {progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {campaign.primary_kpi || "Impressions"} Target
                    </span>
                    <span className={cn(
                      "font-medium",
                      progress.actualPercentage >= 100 ? "text-emerald-600" : 
                      progress.actualPercentage >= 75 ? "text-blue-600" : 
                      progress.actualPercentage >= 50 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {progress.actualPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(progress.percentage, 100)} 
                      className="h-3"
                    />
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all",
                        getProgressColor(progress.actualPercentage)
                      )}
                      style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatNumber(progress.current)} achieved</span>
                    <span>Target: {formatNumber(progress.target)}</span>
                  </div>
                </div>
              )}

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Impressions</p>
                  <p className="font-semibold">{formatNumber(campaignMetrics.impressions)}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Clicks</p>
                  <p className="font-semibold">{formatNumber(campaignMetrics.clicks)}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Engagements</p>
                  <p className="font-semibold">{formatNumber(campaignMetrics.engagements)}</p>
                </div>
              </div>

              {/* Dates & Product */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                </span>
                {campaign.product && (
                  <Badge variant="outline" className="text-xs">{campaign.product.name}</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {campaign.funnel_type}
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/campaigns/${campaign.id}`}>
                    View Details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
