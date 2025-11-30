import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, RefreshCw, LayoutDashboard, Database, Eye, EyeOff } from "lucide-react";
import { FinancialPerformance } from "@/components/brand-dashboard/FinancialPerformance";
import { CampaignCards } from "@/components/brand-dashboard/CampaignCards";
import { useCampaignTypes } from "@/hooks/useCampaignTypes";
import { useChannels } from "@/hooks/useChannels";
import { WidgetProvider } from "@/components/widgets/WidgetContext";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";

export default function BrandPerformanceDashboard() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  
  // View state
  const [activeTab, setActiveTab] = useState<"dashboard" | "datasources">("dashboard");
  const [viewMode, setViewMode] = useState<"agency" | "client">("agency");
  const [selectedProductLine, setSelectedProductLine] = useState<string>("all");
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  
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

  // Fetch products (product lines) for this brand
  const { data: productLines } = useQuery({
    queryKey: ["products", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("brand_id", brandId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });

  // Fetch campaigns for this brand
  const { data: campaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ["brand-campaigns", brandId, selectedProductLine, selectedCampaignType, selectedChannel],
    queryFn: async () => {
      let query = supabase
        .from("campaigns")
        .select(`
          *,
          brand:brands(id, name),
          channel:channels(id, name, channel_type),
          product:products(id, name),
          campaign_type:campaign_types(id, name, type_enum)
        `)
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      
      if (selectedProductLine !== "all") {
        query = query.eq("product_id", selectedProductLine);
      }
      if (selectedCampaignType !== "all") {
        query = query.eq("campaign_type_id", selectedCampaignType);
      }
      if (selectedChannel !== "all") {
        query = query.eq("channel_id", selectedChannel);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });

  // Fetch metrics for campaigns
  const { data: metrics } = useQuery({
    queryKey: ["brand-metrics", brandId, campaigns?.map(c => c.id)],
    queryFn: async () => {
      if (!campaigns?.length) return [];
      const campaignIds = campaigns.map(c => c.id);
      const { data, error } = await supabase
        .from("metrics")
        .select("*")
        .in("campaign_id", campaignIds);
      if (error) throw error;
      return data;
    },
    enabled: !!campaigns?.length,
  });

  const { data: campaignTypes } = useCampaignTypes();
  const { data: channels } = useChannels();

  // Aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    if (!metrics?.length) return {
      impressions: 0,
      clicks: 0,
      reach: 0,
      engagements: 0,
      spend: 0,
      ctr: 0,
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
    if (!campaigns?.length) return {
      totalSpend: 0,
      baseCost: 0,
      margin: 0,
      revenue: 0,
      markup: 20,
    };

    const totals = campaigns.reduce((acc, c) => ({
      totalSpend: acc.totalSpend + (aggregatedMetrics.spend || 0),
      baseCost: acc.baseCost + (c.cost_idr || 0),
      markup: c.markup_percent || 20,
    }), { totalSpend: 0, baseCost: 0, markup: 20 });

    const margin = totals.baseCost * (totals.markup / 100);
    const revenue = totals.baseCost + margin;

    return {
      ...totals,
      margin,
      revenue,
    };
  }, [campaigns, aggregatedMetrics]);

  if (brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Brand not found</p>
        <Button variant="link" onClick={() => navigate("/brands")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Brands
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/brands")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{brand.name}</h1>
                <p className="text-sm text-muted-foreground">Performance Hub • Last synced: Just now</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Dashboard / Data Sources Toggle */}
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button 
                  variant={activeTab === "dashboard" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant={activeTab === "datasources" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("datasources")}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Data Sources
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
                <Label htmlFor="view-mode" className="text-sm text-muted-foreground">
                  {viewMode === "agency" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Label>
                <Switch 
                  id="view-mode"
                  checked={viewMode === "client"}
                  onCheckedChange={(v) => setViewMode(v ? "client" : "agency")}
                />
                <span className="text-sm font-medium">{viewMode === "agency" ? "Agency" : "Client"}</span>
              </div>

              <Button variant="outline" size="icon" onClick={() => refetchCampaigns()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button asChild>
                <Link to={`/campaigns/new?brandId=${brandId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          </div>

          {/* Product Line Tabs */}
          <Tabs value={selectedProductLine} onValueChange={setSelectedProductLine} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All Product Lines</TabsTrigger>
              {productLines?.map((pl) => (
                <TabsTrigger key={pl.id} value={pl.id}>{pl.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Campaign Type:</Label>
              <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {campaignTypes?.filter(ct => ct.is_active).map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Channel:</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {channels?.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProductLine !== "all" || selectedCampaignType !== "all" || selectedChannel !== "all" ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedProductLine("all");
                  setSelectedCampaignType("all");
                  setSelectedChannel("all");
                }}
              >
                Clear Filters
              </Button>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                {campaigns?.length || 0} Campaigns
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === "dashboard" ? (
          <WidgetProvider>
            <div className="space-y-6">
              {/* Widget Grid with Drag & Drop */}
              <WidgetGrid />

              {/* Financial Performance */}
              <FinancialPerformance 
                metrics={financialMetrics} 
                viewMode={viewMode}
                exchangeRate={campaigns?.[0]?.exchange_rate || 16000}
              />

              {/* Campaign Cards with KPI Progress */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
                <CampaignCards 
                  campaigns={campaigns || []} 
                  metrics={metrics || []}
                />
              </div>
            </div>
          </WidgetProvider>
        ) : (
          <div className="text-center py-12">
            <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Data Sources</h2>
            <p className="text-muted-foreground mb-4">Connect Google Sheets or input data manually</p>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Connect Data Source
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Coming soon in Phase 2</p>
          </div>
        )}
      </div>
    </div>
  );
}
