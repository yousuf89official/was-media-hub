import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMetrics = (campaignId?: string) => {
  return useQuery({
    queryKey: ["metrics", campaignId],
    queryFn: async () => {
      let query = supabase
        .from("metrics")
        .select(`
          *,
          campaign:campaigns(id, name),
          channel:channels(id, name)
        `)
        .order("date", { ascending: false });

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: campaignId !== undefined,
  });
};

export const useCreateMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metric: any) => {
      const { data, error } = await supabase
        .from("metrics")
        .insert([metric])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast.success("Metrics added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add metrics");
    },
  });
};
