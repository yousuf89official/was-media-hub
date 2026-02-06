import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";

export const useChannels = () => {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCPMRates = () => {
  return useQuery({
    queryKey: ["cpm_rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cpm_rates")
        .select(`
          *,
          channel:channels(id, name)
        `)
        .is("effective_to", null)
        .order("channel_id");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useMultipliers = () => {
  return useQuery({
    queryKey: ["multipliers"],
    queryFn: async () => {
      const [platform, engagement, sentiment] = await Promise.all([
        supabase.from("platform_multipliers").select("*, channel:channels(id, name)"),
        supabase.from("engagement_multipliers").select("*"),
        supabase.from("sentiment_multipliers").select("*"),
      ]);

      if (platform.error) throw platform.error;
      if (engagement.error) throw engagement.error;
      if (sentiment.error) throw sentiment.error;

      return {
        platform: platform.data,
        engagement: engagement.data,
        sentiment: sentiment.data,
      };
    },
  });
};
