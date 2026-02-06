import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { format, subDays } from "date-fns";

interface CampaignTableRow {
  campaign: string;
  impressions: number;
  clicks: number;
  ctr: string;
  channel: string;
}

export function useCampaignTableData(brandId?: string) {
  return useQuery({
    queryKey: ["campaign-table-data", brandId],
    queryFn: async () => {
      let campaignsQuery = supabase
        .from("campaigns")
        .select(`
          id, name,
          channel:channels(id, name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (brandId) {
        campaignsQuery = campaignsQuery.eq("brand_id", brandId);
      }

      const { data: campaigns, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;

      if (!campaigns?.length) return [];

      const campaignIds = campaigns.map((c) => c.id);
      const { data: metrics, error: metricsError } = await supabase
        .from("metrics")
        .select("campaign_id, impressions, clicks")
        .in("campaign_id", campaignIds);

      if (metricsError) throw metricsError;

      // Aggregate metrics by campaign
      const metricsMap = new Map<string, { impressions: number; clicks: number }>();
      metrics?.forEach((m) => {
        const existing = metricsMap.get(m.campaign_id) || { impressions: 0, clicks: 0 };
        metricsMap.set(m.campaign_id, {
          impressions: existing.impressions + (m.impressions || 0),
          clicks: existing.clicks + (m.clicks || 0),
        });
      });

      return campaigns.map((c): CampaignTableRow => {
        const campaignMetrics = metricsMap.get(c.id) || { impressions: 0, clicks: 0 };
        const ctr = campaignMetrics.impressions > 0
          ? ((campaignMetrics.clicks / campaignMetrics.impressions) * 100).toFixed(2)
          : "0.00";

        return {
          campaign: c.name,
          impressions: campaignMetrics.impressions,
          clicks: campaignMetrics.clicks,
          ctr: `${ctr}%`,
          channel: (c.channel as any)?.name?.toLowerCase() || "default",
        };
      });
    },
  });
}

export function useSpendDistribution(campaignIds?: string[]) {
  return useQuery({
    queryKey: ["spend-distribution", campaignIds],
    queryFn: async () => {
      let query = supabase
        .from("metrics")
        .select(`
          spend,
          channel:channels(id, name, brand_color)
        `);

      if (campaignIds?.length) {
        query = query.in("campaign_id", campaignIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by channel
      const channelMap = new Map<string, { name: string; value: number; color: string }>();
      data?.forEach((m: any) => {
        if (!m.channel) return;
        const channelId = m.channel.id;
        const existing = channelMap.get(channelId);
        
        if (existing) {
          existing.value += m.spend || 0;
        } else {
          channelMap.set(channelId, {
            name: m.channel.name,
            value: m.spend || 0,
            color: m.channel.brand_color || "#6366f1",
          });
        }
      });

      return Array.from(channelMap.values()).filter(c => c.value > 0);
    },
  });
}

export function useChannelMultiSeriesData(campaignIds?: string[], days: number = 7) {
  return useQuery({
    queryKey: ["channel-multi-series", campaignIds, days],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");

      let query = supabase
        .from("metrics")
        .select(`
          date, impressions,
          channel:channels(id, name)
        `)
        .gte("date", startDate)
        .order("date", { ascending: true });

      if (campaignIds?.length) {
        query = query.in("campaign_id", campaignIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date, then by channel
      const dateMap = new Map<string, Record<string, number>>();
      const channelNames = new Set<string>();

      data?.forEach((m: any) => {
        if (!m.channel) return;
        const channelName = m.channel.name.toLowerCase();
        channelNames.add(channelName);
        
        const dateKey = m.date;
        const existing = dateMap.get(dateKey) || {};
        existing[channelName] = (existing[channelName] || 0) + (m.impressions || 0);
        dateMap.set(dateKey, existing);
      });

      // Convert to array format for recharts
      return {
        data: Array.from(dateMap.entries()).map(([date, channels]) => ({
          name: format(new Date(date), "EEE"),
          ...channels,
        })),
        channels: Array.from(channelNames),
      };
    },
  });
}

export function useAggregatedMetricValue(
  metric: string,
  campaignIds?: string[]
) {
  return useQuery({
    queryKey: ["aggregated-metric", metric, campaignIds],
    queryFn: async () => {
      let query = supabase.from("metrics").select(metric);

      if (campaignIds?.length) {
        query = query.in("campaign_id", campaignIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const total = (data || []).reduce(
        (sum, m) => sum + ((m as any)[metric] || 0),
        0
      );

      return total;
    },
  });
}
