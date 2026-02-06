import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";

export interface CampaignChannelConfig {
  id: string;
  campaign_id: string;
  channel_id: string;
  budget: number | null;
  objective_id: string | null;
  buying_model_id: string | null;
  targeting: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
  channel?: {
    id: string;
    name: string;
    brand_color: string | null;
    icon_url: string | null;
  };
  objective?: {
    id: string;
    name: string;
  };
  buying_model?: {
    id: string;
    name: string;
  };
}

export const useCampaignChannelConfigs = (campaignId?: string) => {
  return useQuery({
    queryKey: ["campaign-channel-configs", campaignId],
    queryFn: async () => {
      let query = supabase
        .from("campaign_channel_configs")
        .select(`
          *,
          channel:channels(id, name, brand_color, icon_url),
          objective:objectives(id, name),
          buying_model:buying_models(id, name)
        `);
      
      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CampaignChannelConfig[];
    },
    enabled: !!campaignId,
  });
};

export const useCreateCampaignChannelConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: { 
      campaign_id: string; 
      channel_id: string; 
      budget?: number;
      objective_id?: string;
      buying_model_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("campaign_channel_configs")
        .insert([config])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-channel-configs"] });
      toast.success("Channel configuration added");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add channel configuration");
    },
  });
};

export const useUpdateCampaignChannelConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { 
      id: string; 
      budget?: number;
      objective_id?: string | null;
      buying_model_id?: string | null;
      targeting?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from("campaign_channel_configs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-channel-configs"] });
      toast.success("Channel configuration updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update channel configuration");
    },
  });
};

export const useDeleteCampaignChannelConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaign_channel_configs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-channel-configs"] });
      toast.success("Channel configuration removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove channel configuration");
    },
  });
};
