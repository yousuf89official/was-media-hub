import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get campaigns count
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id, status");
      
      if (campaignsError) throw campaignsError;

      // Get all metrics
      const { data: metrics, error: metricsError } = await supabase
        .from("metrics")
        .select("impressions, reach, spend, engagements");
      
      if (metricsError) throw metricsError;

      // Get AVE results
      const { data: aveResults, error: aveError } = await supabase
        .from("ave_results")
        .select("final_ave");
      
      if (aveError) throw aveError;

      // Calculate totals
      const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
      const totalReach = metrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
      const totalSpend = metrics?.reduce((sum, m) => sum + Number(m.spend || 0), 0) || 0;
      const totalEngagements = metrics?.reduce((sum, m) => sum + (m.engagements || 0), 0) || 0;
      const totalAVE = aveResults?.reduce((sum, r) => sum + Number(r.final_ave || 0), 0) || 0;

      const activeCampaigns = campaigns?.filter(c => c.status === "running").length || 0;
      const totalCampaigns = campaigns?.length || 0;

      return {
        activeCampaigns,
        totalCampaigns,
        totalImpressions,
        totalReach,
        totalSpend,
        totalEngagements,
        totalAVE,
        engagementRate: totalImpressions > 0 
          ? ((totalEngagements / totalImpressions) * 100).toFixed(2)
          : "0",
      };
    },
  });
};

export const useTopCampaigns = (limit = 5) => {
  return useQuery({
    queryKey: ["top-campaigns", limit],
    queryFn: async () => {
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select(`
          id,
          name,
          status,
          brand_id,
          brand:brands(name)
        `);
      
      if (campaignsError) throw campaignsError;

      // Get metrics for each campaign
      const campaignsWithMetrics = await Promise.all(
        campaigns.map(async (campaign) => {
          const { data: metrics } = await supabase
            .from("metrics")
            .select("impressions, engagements, reach, spend")
            .eq("campaign_id", campaign.id);

          const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
          const totalEngagements = metrics?.reduce((sum, m) => sum + (m.engagements || 0), 0) || 0;
          const totalReach = metrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
          const totalSpend = metrics?.reduce((sum, m) => sum + Number(m.spend || 0), 0) || 0;

          return {
            ...campaign,
            totalImpressions,
            totalEngagements,
            totalReach,
            totalSpend,
            engagementRate: totalImpressions > 0 
              ? ((totalEngagements / totalImpressions) * 100).toFixed(2)
              : "0",
          };
        })
      );

      // Sort by impressions and return top campaigns
      return campaignsWithMetrics
        .sort((a, b) => b.totalImpressions - a.totalImpressions)
        .slice(0, limit);
    },
  });
};

export const usePerformanceTrend = (days = 30) => {
  return useQuery({
    queryKey: ["performance-trend", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: metrics, error } = await supabase
        .from("metrics")
        .select("date, impressions, engagements, spend")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });
      
      if (error) throw error;

      // Group by date
      const grouped = metrics?.reduce((acc: any, metric) => {
        const date = metric.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            impressions: 0,
            engagements: 0,
            spend: 0,
          };
        }
        acc[date].impressions += metric.impressions || 0;
        acc[date].engagements += metric.engagements || 0;
        acc[date].spend += Number(metric.spend || 0);
        return acc;
      }, {});

      return Object.values(grouped || {});
    },
  });
};

export const useChannelPerformance = () => {
  return useQuery({
    queryKey: ["channel-performance"],
    queryFn: async () => {
      const { data: metrics, error } = await supabase
        .from("metrics")
        .select(`
          impressions,
          engagements,
          spend,
          channel:channels(id, name)
        `);
      
      if (error) throw error;

      // Group by channel
      const grouped = metrics?.reduce((acc: any, metric: any) => {
        const channelName = metric.channel?.name || "Unknown";
        if (!acc[channelName]) {
          acc[channelName] = {
            channel: channelName,
            impressions: 0,
            engagements: 0,
            spend: 0,
          };
        }
        acc[channelName].impressions += metric.impressions || 0;
        acc[channelName].engagements += metric.engagements || 0;
        acc[channelName].spend += Number(metric.spend || 0);
        return acc;
      }, {});

      return Object.values(grouped || {});
    },
  });
};

export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_activity_logs")
        .select(`
          id,
          activity_type,
          page_path,
          created_at,
          metadata
        `)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  });
};
