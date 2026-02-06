import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";

export const useBuyingModels = (channelId?: string, objectiveId?: string) => {
  return useQuery({
    queryKey: ["buying-models", channelId, objectiveId],
    queryFn: async () => {
      let query = supabase
        .from("buying_models")
        .select("*")
        .order("name", { ascending: true });
      
      if (channelId) {
        query = query.eq("channel_id", channelId);
      }
      
      if (objectiveId) {
        query = query.eq("objective_id", objectiveId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
