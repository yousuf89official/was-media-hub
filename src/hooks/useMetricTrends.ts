import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { subDays, format } from "date-fns";

interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

interface TrendData {
  impressions: MetricTrend;
  clicks: MetricTrend;
  reach: MetricTrend;
  engagements: MetricTrend;
  spend: MetricTrend;
}

export function useMetricTrends(campaignIds?: string[], days: number = 14) {
  return useQuery({
    queryKey: ["metric-trends", campaignIds, days],
    queryFn: async () => {
      const today = new Date();
      const halfPeriod = Math.floor(days / 2);
      
      const currentStart = format(subDays(today, halfPeriod), "yyyy-MM-dd");
      const currentEnd = format(today, "yyyy-MM-dd");
      const previousStart = format(subDays(today, days), "yyyy-MM-dd");
      const previousEnd = format(subDays(today, halfPeriod + 1), "yyyy-MM-dd");

      let currentQuery = supabase
        .from("metrics")
        .select("impressions, clicks, reach, engagements, spend")
        .gte("date", currentStart)
        .lte("date", currentEnd);

      let previousQuery = supabase
        .from("metrics")
        .select("impressions, clicks, reach, engagements, spend")
        .gte("date", previousStart)
        .lte("date", previousEnd);

      if (campaignIds?.length) {
        currentQuery = currentQuery.in("campaign_id", campaignIds);
        previousQuery = previousQuery.in("campaign_id", campaignIds);
      }

      const [currentResult, previousResult] = await Promise.all([
        currentQuery,
        previousQuery,
      ]);

      if (currentResult.error) throw currentResult.error;
      if (previousResult.error) throw previousResult.error;

      const sumMetrics = (data: any[]) => ({
        impressions: data.reduce((sum, m) => sum + (m.impressions || 0), 0),
        clicks: data.reduce((sum, m) => sum + (m.clicks || 0), 0),
        reach: data.reduce((sum, m) => sum + (m.reach || 0), 0),
        engagements: data.reduce((sum, m) => sum + (m.engagements || 0), 0),
        spend: data.reduce((sum, m) => sum + (m.spend || 0), 0),
      });

      const current = sumMetrics(currentResult.data || []);
      const previous = sumMetrics(previousResult.data || []);

      const calculateTrend = (cur: number, prev: number): MetricTrend => ({
        current: cur,
        previous: prev,
        change: cur - prev,
        changePercent: prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0,
      });

      return {
        impressions: calculateTrend(current.impressions, previous.impressions),
        clicks: calculateTrend(current.clicks, previous.clicks),
        reach: calculateTrend(current.reach, previous.reach),
        engagements: calculateTrend(current.engagements, previous.engagements),
        spend: calculateTrend(current.spend, previous.spend),
      } as TrendData;
    },
    enabled: true,
  });
}

export function useChannelPerformance(campaignIds?: string[]) {
  return useQuery({
    queryKey: ["channel-performance", campaignIds],
    queryFn: async () => {
      let query = supabase
        .from("metrics")
        .select(`
          impressions, clicks, reach, engagements, spend,
          channel:channels(id, name, brand_color, icon_url)
        `);

      if (campaignIds?.length) {
        query = query.in("campaign_id", campaignIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by channel
      const channelMap = new Map<string, {
        name: string;
        color: string;
        impressions: number;
        clicks: number;
        reach: number;
        engagements: number;
        spend: number;
      }>();

      data?.forEach((m: any) => {
        if (!m.channel) return;
        const channelId = m.channel.id;
        const existing = channelMap.get(channelId) || {
          name: m.channel.name,
          color: m.channel.brand_color || "#6366f1",
          impressions: 0,
          clicks: 0,
          reach: 0,
          engagements: 0,
          spend: 0,
        };

        channelMap.set(channelId, {
          ...existing,
          impressions: existing.impressions + (m.impressions || 0),
          clicks: existing.clicks + (m.clicks || 0),
          reach: existing.reach + (m.reach || 0),
          engagements: existing.engagements + (m.engagements || 0),
          spend: existing.spend + (m.spend || 0),
        });
      });

      return Array.from(channelMap.values());
    },
  });
}

export function useDailyMetrics(campaignIds?: string[], days: number = 7) {
  return useQuery({
    queryKey: ["daily-metrics", campaignIds, days],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");

      let query = supabase
        .from("metrics")
        .select("date, impressions, clicks, reach, engagements, spend")
        .gte("date", startDate)
        .order("date", { ascending: true });

      if (campaignIds?.length) {
        query = query.in("campaign_id", campaignIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date
      const dateMap = new Map<string, {
        name: string;
        impressions: number;
        clicks: number;
        reach: number;
        engagements: number;
        spend: number;
      }>();

      data?.forEach((m) => {
        const dateKey = m.date;
        const existing = dateMap.get(dateKey) || {
          name: format(new Date(dateKey), "EEE"),
          impressions: 0,
          clicks: 0,
          reach: 0,
          engagements: 0,
          spend: 0,
        };

        dateMap.set(dateKey, {
          ...existing,
          impressions: existing.impressions + (m.impressions || 0),
          clicks: existing.clicks + (m.clicks || 0),
          reach: existing.reach + (m.reach || 0),
          engagements: existing.engagements + (m.engagements || 0),
          spend: existing.spend + (m.spend || 0),
        });
      });

      return Array.from(dateMap.values());
    },
  });
}

export function useFunnelMetrics(campaignIds?: string[]) {
  return useQuery({
    queryKey: ["funnel-metrics", campaignIds],
    queryFn: async () => {
      let query = supabase
        .from("metrics")
        .select("impressions, reach, clicks, engagements");

      if (campaignIds?.length) {
        query = query.in("campaign_id", campaignIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const totals = (data || []).reduce(
        (acc, m) => ({
          impressions: acc.impressions + (m.impressions || 0),
          reach: acc.reach + (m.reach || 0),
          clicks: acc.clicks + (m.clicks || 0),
          engagements: acc.engagements + (m.engagements || 0),
        }),
        { impressions: 0, reach: 0, clicks: 0, engagements: 0 }
      );

      return [
        { stage: "Awareness", value: totals.impressions, color: "#E4405F" },
        { stage: "Reach", value: totals.reach, color: "#1877F2" },
        { stage: "Engagement", value: totals.engagements, color: "#4285F4" },
        { stage: "Clicks", value: totals.clicks, color: "#34A853" },
      ];
    },
  });
}
