import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelBudget {
  channel_id: string;
  budget: number;
}

interface UpdateCampaignPayload {
  id: string;
  name?: string;
  brand_id?: string;
  channel_id?: string;
  channel_ids?: string[];
  funnel_type?: "TOP" | "MID" | "BOTTOM";
  start_date?: string;
  end_date?: string;
  status?: "draft" | "running" | "finished";
  product_id?: string | null;
  objective_id?: string | null;
  buying_model_id?: string | null;
  primary_kpi?: string | null;
  secondary_kpi?: string | null;
  channelBudgets?: ChannelBudget[];
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, channelBudgets, ...campaignData }: UpdateCampaignPayload) => {
      // Update the campaign
      const { data, error } = await supabase
        .from("campaigns")
        .update(campaignData)
        .eq("id", id)
        .select(`
          *,
          brand:brands(id, name),
          channel:channels(id, name),
          product:products(id, name)
        `)
        .single();
      
      if (error) throw error;

      // Sync channel configs if provided
      if (channelBudgets) {
        // Delete existing configs for this campaign
        const { error: deleteError } = await supabase
          .from("campaign_channel_configs")
          .delete()
          .eq("campaign_id", id);

        if (deleteError) {
          console.error("Failed to delete old channel configs:", deleteError);
        }

        // Insert new configs
        if (channelBudgets.length > 0) {
          const channelConfigs = channelBudgets.map((cb) => ({
            campaign_id: id,
            channel_id: cb.channel_id,
            budget: cb.budget,
          }));

          const { error: insertError } = await supabase
            .from("campaign_channel_configs")
            .insert(channelConfigs);

          if (insertError) {
            console.error("Failed to create channel configs:", insertError);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-channel-configs"] });
      toast.success("Campaign updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update campaign");
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete campaign");
    },
  });
};
