import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, Calendar, Eye, Users, MousePointer, Zap, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import { CreativeGallery } from "@/components/creative-gallery/CreativeGallery";

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

interface CampaignDashboardViewProps {
  campaign: Campaign;
  metrics: Metric[];
  brandName: string;
  onBack: () => void;
}

export function CampaignDashboardView({ campaign, metrics, brandName, onBack }: CampaignDashboardViewProps) {
  const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
  const aggregated = campaignMetrics.reduce((acc, m) => ({
    impressions: acc.impressions + (m.impressions || 0),
    clicks: acc.clicks + (m.clicks || 0),
    reach: acc.reach + (m.reach || 0),
    engagements: acc.engagements + (m.engagements || 0),
    spend: acc.spend + (m.spend || 0),
  }), { impressions: 0, clicks: 0, reach: 0, engagements: 0, spend: 0 });

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

  const kpiProgress = campaign.kpi_target ? (aggregated.impressions / campaign.kpi_target) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "finished": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const metricCards = [
    { label: "Impressions", value: aggregated.impressions, icon: Eye, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Reach", value: aggregated.reach, icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { label: "Clicks", value: aggregated.clicks, icon: MousePointer, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Engagements", value: aggregated.engagements, icon: Zap, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { label: "Spend", value: aggregated.spend, icon: DollarSign, color: "text-rose-500", bgColor: "bg-rose-500/10", isCurrency: true },
  ];

  return (
    <div className="space-y-4">
      {/* Campaign Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold truncate">{campaign.name}</h2>
            <Badge variant="outline" className={cn("text-[10px]", getStatusColor(campaign.status))}>
              {campaign.status}
            </Badge>
            {campaign.channel && (
              <Badge variant="secondary" className="text-[10px]">{campaign.channel.name}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
            </span>
            {campaign.product && <span>Product: {campaign.product.name}</span>}
            {campaign.campaign_type && <span>Type: {campaign.campaign_type.name}</span>}
          </div>
        </div>
      </div>

      {/* KPI Progress */}
      {campaign.kpi_target && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{campaign.primary_kpi || "Impressions"} Target</span>
              </div>
              <span className={cn(
                "text-lg font-bold",
                kpiProgress >= 100 ? "text-emerald-600" : 
                kpiProgress >= 75 ? "text-blue-600" : 
                kpiProgress >= 50 ? "text-amber-600" : "text-rose-600"
              )}>
                {kpiProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(kpiProgress, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatNumber(aggregated.impressions)} achieved</span>
              <span>Target: {formatNumber(campaign.kpi_target)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-bold">
                    {metric.isCurrency ? formatCurrency(metric.value) : formatNumber(metric.value)}
                  </p>
                </div>
                <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                  <metric.icon className={cn("h-4 w-4", metric.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets */}
      <WidgetGrid />

      {/* Creative Gallery */}
      <CreativeGallery brandName={brandName} campaignId={campaign.id} />
    </div>
  );
}