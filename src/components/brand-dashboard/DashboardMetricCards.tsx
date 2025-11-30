import { Card, CardContent } from "@/components/ui/card";
import { Eye, MousePointerClick, Users, Heart, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMetricTrends } from "@/hooks/useMetricTrends";

interface MetricCardsProps {
  metrics: {
    impressions: number;
    clicks: number;
    reach: number;
    engagements: number;
    ctr: number;
    spend?: number;
  };
  campaignIds?: string[];
}

export function DashboardMetricCards({ metrics, campaignIds }: MetricCardsProps) {
  const { data: trends } = useMetricTrends(campaignIds);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const cards = [
    {
      title: "Total Impressions",
      value: metrics.impressions,
      icon: Eye,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      change: trends?.impressions?.changePercent ?? 0,
    },
    {
      title: "Total Clicks",
      value: metrics.clicks,
      icon: MousePointerClick,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      subtitle: `CTR: ${metrics.ctr.toFixed(2)}%`,
      change: trends?.clicks?.changePercent ?? 0,
    },
    {
      title: "Total Reach",
      value: metrics.reach,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      change: trends?.reach?.changePercent ?? 0,
    },
    {
      title: "Engagements",
      value: metrics.engagements,
      icon: Heart,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-500/10",
      iconColor: "text-rose-500",
      change: trends?.engagements?.changePercent ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="relative overflow-hidden border-0 shadow-lg"
        >
          <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", card.color)} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatNumber(card.value)}
                </p>
                {card.subtitle && (
                  <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                )}
                {card.change !== undefined && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    card.change >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {card.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(card.change).toFixed(1)}% vs last period</span>
                  </div>
                )}
              </div>
              <div className={cn("p-3 rounded-xl", card.bgColor)}>
                <card.icon className={cn("h-6 w-6", card.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
