import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useObjectives = (channelId?: string) => {
  return useQuery({
    queryKey: ["objectives", channelId],
    queryFn: async () => {
      let query = supabase
        .from("objectives")
        .select("*")
        .order("name", { ascending: true });
      
      if (channelId) {
        query = query.eq("channel_id", channelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
