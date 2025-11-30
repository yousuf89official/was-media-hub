import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, TrendingUp, Calculator, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialPerformanceProps {
  metrics: {
    totalSpend: number;
    baseCost: number;
    margin: number;
    revenue: number;
    markup: number;
  };
  viewMode: "agency" | "client";
  exchangeRate: number;
}

export function FinancialPerformance({ metrics, viewMode, exchangeRate }: FinancialPerformanceProps) {
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

  const financialCards = [
    {
      title: "Total Media Spend",
      value: metrics.totalSpend,
      icon: DollarSign,
      color: "border-blue-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      showBadge: true,
      badgeText: "Approved Budget",
      visible: true,
    },
    {
      title: "Internal Base Cost",
      value: metrics.baseCost,
      icon: Calculator,
      color: "border-amber-500",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
      subtitle: "IDR Only",
      visible: isAgency,
      locked: !isAgency,
    },
    {
      title: "Margin & Markup",
      value: metrics.margin,
      icon: TrendingUp,
      color: "border-emerald-500",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      subtitle: `Net Profit: ${metrics.markup}%`,
      visible: isAgency,
      locked: !isAgency,
    },
    {
      title: "Total Revenue",
      value: metrics.revenue,
      icon: Wallet,
      color: "border-purple-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      showUSD: true,
      visible: true,
    },
  ];

  const visibleCards = financialCards.filter(card => card.visible || card.locked);

  return (
    <Card className="border-2 border-dashed border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-destructive" />
            Financial Performance
          </CardTitle>
          {isAgency && (
            <Badge variant="outline" className="border-destructive/50 text-destructive">
              Agency View Only
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleCards.map((card) => (
            <Card 
              key={card.title} 
              className={cn(
                "relative border-l-4 transition-all",
                card.color,
                card.locked && "opacity-50"
              )}
            >
              {card.locked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Agency Only</p>
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      {card.showBadge && (
                        <Badge variant="secondary" className="text-xs">{card.badgeText}</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatCurrency(card.value)}
                    </p>
                    {card.showUSD && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(card.value, "USD")}
                      </p>
                    )}
                    {card.subtitle && (
                      <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    )}
                  </div>
                  <div className={cn("p-2 rounded-lg", card.bgColor)}>
                    <card.icon className={cn("h-5 w-5", card.iconColor)} />
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
