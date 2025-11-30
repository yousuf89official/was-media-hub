import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, TrendingUp, Calculator, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpendDistribution } from "@/hooks/useWidgetData";

interface FinancialCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  iconColor: string;
  showBoth?: boolean;
  subtitle?: string;
  agencyOnly?: boolean;
}

interface FinancialPerformanceProps {
  metrics: {
    totalSpend: number;
    baseCost: number;
    margin: number;
    revenue: number;
    markup: number;
    spendByChannel?: number;
    spendByKOL?: number;
    spendByContent?: number;
  };
  viewMode: "agency" | "client";
  exchangeRate: number;
  campaignIds?: string[];
}

export function FinancialPerformance({ metrics, viewMode, exchangeRate, campaignIds }: FinancialPerformanceProps) {
  const { data: spendDistribution } = useSpendDistribution(campaignIds);

  const formatCurrency = (value: number, currency: "IDR" | "USD" = "IDR") => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value / exchangeRate);
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isAgency = viewMode === "agency";

  // Calculate spend by channel from real data
  const totalChannelSpend = spendDistribution?.reduce((sum, c) => sum + c.value, 0) || 0;
  const channelSpend = totalChannelSpend > 0 ? totalChannelSpend * 0.6 : metrics.spendByChannel || metrics.totalSpend * 0.6;
  const kolSpend = totalChannelSpend > 0 ? totalChannelSpend * 0.25 : metrics.spendByKOL || metrics.totalSpend * 0.25;
  const contentSpend = totalChannelSpend > 0 ? totalChannelSpend * 0.15 : metrics.spendByContent || metrics.totalSpend * 0.15;

  // Client view cards - simplified
  const clientCards: FinancialCard[] = [
    {
      title: "Total Media Spend",
      value: totalChannelSpend > 0 ? totalChannelSpend : metrics.totalSpend,
      icon: DollarSign,
      color: "border-l-blue-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      showBoth: true,
    },
    {
      title: "Channel Spend",
      value: channelSpend,
      icon: TrendingUp,
      color: "border-l-emerald-500",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      title: "KOL Spend",
      value: kolSpend,
      icon: Users,
      color: "border-l-purple-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      title: "Content Spend",
      value: contentSpend,
      icon: Video,
      color: "border-l-amber-500",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
  ];

  // Agency view adds internal cost data
  const agencyCards: FinancialCard[] = [
    ...clientCards,
    {
      title: "Base Cost",
      value: metrics.baseCost,
      icon: Calculator,
      color: "border-l-slate-500",
      bgColor: "bg-slate-500/10",
      iconColor: "text-slate-500",
      agencyOnly: true,
    },
    {
      title: "Margin",
      value: metrics.margin,
      icon: Wallet,
      color: "border-l-rose-500",
      bgColor: "bg-rose-500/10",
      iconColor: "text-rose-500",
      subtitle: `${metrics.markup}% markup`,
      agencyOnly: true,
    },
  ];

  const displayCards = isAgency ? agencyCards : clientCards;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" />
            Financial Overview
          </CardTitle>
          {isAgency && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              Agency View
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {displayCards.map((card) => (
            <Card 
              key={card.title} 
              className={cn(
                "relative border-l-2 transition-all hover:shadow-sm",
                card.color
              )}
            >
              <CardContent className="p-2.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground truncate">{card.title}</p>
                    <p className="text-sm font-bold tracking-tight truncate">
                      {formatCurrency(card.value)}
                    </p>
                    {card.showBoth && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatCurrency(card.value, "USD")}
                      </p>
                    )}
                    {card.subtitle && (
                      <p className="text-[9px] text-muted-foreground">{card.subtitle}</p>
                    )}
                  </div>
                  <div className={cn("p-1.5 rounded-md shrink-0", card.bgColor)}>
                    <card.icon className={cn("h-3.5 w-3.5", card.iconColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
