import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, RefreshCw, LayoutDashboard, Database, Eye, EyeOff } from "lucide-react";
import { FinancialPerformance } from "@/components/brand-dashboard/FinancialPerformance";
import { CampaignCards } from "@/components/brand-dashboard/CampaignCards";
import { CampaignDashboardView } from "@/components/brand-dashboard/CampaignDashboardView";
import { ChannelMultiSelect } from "@/components/brand-dashboard/ChannelMultiSelect";
import { useChannels } from "@/hooks/useChannels";
import { WidgetProvider } from "@/components/widgets/WidgetContext";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import { CreativeGallery } from "@/components/creative-gallery/CreativeGallery";
import { DataSourcesManager } from "@/components/data-sources/DataSourcesManager";

export default function BrandPerformanceDashboard() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  
  // View state
  const [activeTab, setActiveTab] = useState<"dashboard" | "datasources">("dashboard");
  const [viewMode, setViewMode] = useState<"agency" | "client">("agency");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  
  // Fetch brand data
  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", brandId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });

  // Fetch campaigns for this brand
  const { data: campaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ["brand-campaigns", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          brand:brands(id, name),
          channel:channels(id, name, channel_type, brand_color, icon_url),
          product:products(id, name),
          campaign_type:campaign_types(id, name, type_enum)
        `)
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });

  // Filter campaigns by selected channels
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (selectedChannels.length === 0) return campaigns;
    return campaigns.filter(c => selectedChannels.includes(c.channel_id));
  }, [campaigns, selectedChannels]);

  // Get unique channels from brand's campaigns
  const brandChannels = useMemo(() => {
    if (!campaigns) return [];
    const channelMap = new Map();
    campaigns.forEach(c => {
      if (c.channel) {
        channelMap.set(c.channel.id, c.channel);
      }
    });
    return Array.from(channelMap.values());
  }, [campaigns]);

  // Fetch metrics for campaigns
  const { data: metrics } = useQuery({
    queryKey: ["brand-metrics", brandId, filteredCampaigns?.map(c => c.id)],
    queryFn: async () => {
      if (!filteredCampaigns?.length) return [];
      const campaignIds = filteredCampaigns.map(c => c.id);
      const { data, error } = await supabase
        .from("metrics")
        .select("*")
        .in("campaign_id", campaignIds);
      if (error) throw error;
      return data;
    },
    enabled: !!filteredCampaigns?.length,
  });

  const { data: channels } = useChannels();

  // Aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    if (!metrics?.length) return {
      impressions: 0, clicks: 0, reach: 0, engagements: 0, spend: 0, ctr: 0,
    };

    const totals = metrics.reduce((acc, m) => ({
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      reach: acc.reach + (m.reach || 0),
      engagements: acc.engagements + (m.engagements || 0),
      spend: acc.spend + (m.spend || 0),
    }), { impressions: 0, clicks: 0, reach: 0, engagements: 0, spend: 0 });

    return {
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    };
  }, [metrics]);

  // Financial calculations
  const financialMetrics = useMemo(() => {
    if (!filteredCampaigns?.length) return {
      totalSpend: 0, baseCost: 0, margin: 0, revenue: 0, markup: 20,
    };

    const totals = filteredCampaigns.reduce((acc, c) => ({
      totalSpend: acc.totalSpend + (aggregatedMetrics.spend || 0),
      baseCost: acc.baseCost + (c.cost_idr || 0),
      markup: c.markup_percent || 20,
    }), { totalSpend: 0, baseCost: 0, markup: 20 });

    const margin = totals.baseCost * (totals.markup / 100);
    const revenue = totals.baseCost + margin;

    return { ...totals, margin, revenue };
  }, [filteredCampaigns, aggregatedMetrics]);

  // Get selected campaign data
  const selectedCampaignData = useMemo(() => {
    if (selectedCampaign === "all") return null;
    return campaigns?.find(c => c.id === selectedCampaign) || null;
  }, [campaigns, selectedCampaign]);

  if (brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-sm">Brand not found</p>
        <Button variant="link" size="sm" onClick={() => navigate("/brands")}>
          <ArrowLeft className="w-3 h-3 mr-1" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact */}
      <div className="border-b bg-card">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate("/brands")} className="h-8 w-8 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">{brand.name}</h1>
                <p className="text-xs text-muted-foreground">Performance Hub</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Dashboard / Data Sources Toggle */}
              <div className="flex items-center bg-muted rounded-md p-0.5">
                <Button 
                  variant={activeTab === "dashboard" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                  className="h-7 text-xs gap-1"
                >
                  <LayoutDashboard className="h-3 w-3" />
                  Dashboard
                </Button>
                <Button 
                  variant={activeTab === "datasources" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("datasources")}
                  className="h-7 text-xs gap-1"
                >
                  <Database className="h-3 w-3" />
                  Data
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1.5 border rounded-md px-2 py-1">
                <Label htmlFor="view-mode" className="text-muted-foreground">
                  {viewMode === "agency" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Label>
                <Switch 
                  id="view-mode"
                  checked={viewMode === "client"}
                  onCheckedChange={(v) => setViewMode(v ? "client" : "agency")}
                  className="scale-75"
                />
                <span className="text-xs">{viewMode === "agency" ? "Agency" : "Client"}</span>
              </div>

              <Button variant="outline" size="icon" onClick={() => refetchCampaigns()} className="h-7 w-7">
                <RefreshCw className="h-3 w-3" />
              </Button>
              
              <Button size="sm" asChild className="h-7 text-xs">
                <Link to={`/campaigns/new?brandId=${brandId}`}>
                  <Plus className="h-3 w-3 mr-1" />
                  Campaign
                </Link>
              </Button>
            </div>
          </div>

          {/* Campaign Tabs & Filters Row */}
          {activeTab === "dashboard" && (
            <div className="flex items-center gap-3 mt-3">
              <Tabs value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <TabsList className="h-7">
                  <TabsTrigger value="all" className="text-xs h-6 px-2">All Campaigns</TabsTrigger>
                  {campaigns?.slice(0, 5).map((c) => (
                    <TabsTrigger key={c.id} value={c.id} className="text-xs h-6 px-2 max-w-[100px] truncate">
                      {c.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {selectedCampaign === "all" && (
                <ChannelMultiSelect
                  channels={brandChannels}
                  selectedChannels={selectedChannels}
                  onSelectionChange={setSelectedChannels}
                />
              )}

              <div className="ml-auto">
                <Badge variant="outline" className="text-[10px]">
                  {filteredCampaigns?.length || 0} campaigns
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="px-4 lg:px-6 py-4 dashboard-container">
        {activeTab === "dashboard" ? (
          <WidgetProvider>
            {selectedCampaign === "all" || !selectedCampaignData ? (
              <div className="space-y-4">
                {/* Financial Performance - Top */}
                <FinancialPerformance 
                  metrics={financialMetrics} 
                  viewMode={viewMode}
                  exchangeRate={campaigns?.[0]?.exchange_rate || 16000}
                />

                {/* Widget Grid */}
                <WidgetGrid />

                {/* Campaign Cards */}
                <div>
                  <h2 className="text-sm font-medium mb-2">Active Campaigns</h2>
                  <CampaignCards 
                    campaigns={filteredCampaigns || []} 
                    metrics={metrics || []}
                    selectedCampaignId={selectedCampaign !== "all" ? selectedCampaign : null}
                    onSelectCampaign={(id) => setSelectedCampaign(id)}
                  />
                </div>

                {/* Creative Gallery */}
                <CreativeGallery brandName={brand.name} />
              </div>
            ) : (
              <CampaignDashboardView
                campaign={selectedCampaignData}
                metrics={metrics || []}
                brandName={brand.name}
                onBack={() => setSelectedCampaign("all")}
              />
            )}
          </WidgetProvider>
        ) : (
          <DataSourcesManager brandId={brandId!} />
        )}
      </div>
    </div>
  );
}