import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Target, Calendar, Eye, Users, MousePointer, Zap, DollarSign, Edit, Trash2, Plus, TrendingUp, Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import { CreativeGallery } from "@/components/creative-gallery/CreativeGallery";
import { CampaignSetupTab } from "@/components/campaign-setup";
import { MetricsEntryDialog } from "./MetricsEntryDialog";
import { useDeleteCampaign } from "@/hooks/useUpdateCampaign";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import { useMetrics } from "@/hooks/useMetrics";
import { useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Campaign {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  primary_kpi: string | null;
  secondary_kpi?: string | null;
  kpi_target: number | null;
  funnel_type: string;
  brand_id: string;
  channel_id: string;
  brand?: { id: string; name: string } | null;
  channel?: { id: string; name: string; channel_type: string } | null;
  product?: { id: string; name: string } | null;
  campaign_type?: { id: string; name: string; type_enum: string } | null;
}

interface CampaignDashboardViewProps {
  campaign: Campaign;
  metrics: any[];
  brandName: string;
  onBack: () => void;
}

export function CampaignDashboardView({ campaign, metrics: passedMetrics, brandName, onBack }: CampaignDashboardViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteCampaign = useDeleteCampaign();
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);

  // Fetch detailed metrics for this specific campaign
  const { data: detailedMetrics, isLoading: loadingMetrics } = useMetrics(campaign.id);
  
  // Enable real-time metrics updates
  useRealtimeMetrics(campaign.id);

  // Use detailed metrics if available, otherwise fall back to passed metrics
  const campaignMetrics = detailedMetrics || passedMetrics.filter(m => m.campaign_id === campaign.id);
  
  const aggregated = campaignMetrics.reduce((acc, m) => ({
    impressions: acc.impressions + (m.impressions || 0),
    clicks: acc.clicks + (m.clicks || 0),
    reach: acc.reach + (m.reach || 0),
    engagements: acc.engagements + (m.engagements || 0),
    spend: acc.spend + Number(m.spend || 0),
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

  const handleDelete = async () => {
    await deleteCampaign.mutateAsync(campaign.id);
    onBack();
  };

  const handleMetricsAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["metrics", campaign.id] });
    queryClient.invalidateQueries({ queryKey: ["brand-metrics"] });
  };

  // Format chart data
  const chartData = campaignMetrics
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((metric) => ({
      date: new Date(metric.date).toLocaleDateString(),
      impressions: metric.impressions || 0,
      engagements: metric.engagements || 0,
    }));

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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
              </span>
              {campaign.product && <span>Product: {campaign.product.name}</span>}
              {campaign.campaign_type && <span>Type: {campaign.campaign_type.name}</span>}
              <span className="capitalize">Funnel: {campaign.funnel_type}</span>
              {campaign.primary_kpi && <span>KPI: {campaign.primary_kpi}</span>}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/campaigns/${campaign.id}/edit?brandId=${campaign.brand_id}`)}
            className="h-7 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-7 text-xs">
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the campaign
                  and all associated metrics.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-1.5 text-xs">
            <Settings className="h-3.5 w-3.5" />
            Ad Setup
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagements"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Widgets */}
          <WidgetGrid />

          {/* Creative Gallery */}
          <CreativeGallery brandName={brandName} campaignId={campaign.id} />
        </TabsContent>

        <TabsContent value="setup">
          <CampaignSetupTab campaignId={campaign.id} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setMetricsDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Metrics
            </Button>
          </div>
          
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Metrics Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : campaignMetrics && campaignMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-right text-xs">Impressions</TableHead>
                        <TableHead className="text-right text-xs">Clicks</TableHead>
                        <TableHead className="text-right text-xs">Engagements</TableHead>
                        <TableHead className="text-right text-xs">Reach</TableHead>
                        <TableHead className="text-right text-xs">Spend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignMetrics
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell className="text-xs">
                            {new Date(metric.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {(metric.impressions || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {(metric.clicks || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {(metric.engagements || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {(metric.reach || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {formatCurrency(Number(metric.spend || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-3">No metrics data yet</p>
                  <Button size="sm" onClick={() => setMetricsDialogOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Metrics
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metrics Entry Dialog */}
      <MetricsEntryDialog
        open={metricsDialogOpen}
        onOpenChange={setMetricsDialogOpen}
        campaignId={campaign.id}
        channelId={campaign.channel_id}
        campaignName={campaign.name}
        onSuccess={handleMetricsAdded}
      />
    </div>
  );
}