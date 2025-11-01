import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeMetrics = (campaignId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!campaignId) return;

    const channel = supabase
      .channel(`metrics-${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "metrics",
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          console.log("Metrics changed:", payload);
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ["metrics", campaignId] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["performance-trend"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, queryClient]);
};

export const useRealtimeCampaigns = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("campaigns-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaigns",
        },
        (payload) => {
          console.log("Campaign changed:", payload);
          queryClient.invalidateQueries({ queryKey: ["campaigns"] });
          queryClient.invalidateQueries({ queryKey: ["campaign"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
