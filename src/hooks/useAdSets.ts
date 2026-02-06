import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface AdSet {
  id: string;
  campaign_channel_config_id: string;
  name: string;
  status: string;
  audience_targeting: Json | null;
  placements: string[] | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useAdSets = (campaignChannelConfigId?: string) => {
  return useQuery({
    queryKey: ["ad-sets", campaignChannelConfigId],
    queryFn: async () => {
      let query = supabase.from("ad_sets").select("*");
      
      if (campaignChannelConfigId) {
        query = query.eq("campaign_channel_config_id", campaignChannelConfigId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdSet[];
    },
    enabled: !!campaignChannelConfigId,
  });
};

export const useAdSetsByCampaign = (campaignId?: string) => {
  return useQuery({
    queryKey: ["ad-sets-by-campaign", campaignId],
    queryFn: async () => {
      // First get all channel configs for this campaign
      const { data: configs, error: configError } = await supabase
        .from("campaign_channel_configs")
        .select("id")
        .eq("campaign_id", campaignId!);
      
      if (configError) throw configError;
      if (!configs || configs.length === 0) return [];

      const configIds = configs.map(c => c.id);
      
      const { data, error } = await supabase
        .from("ad_sets")
        .select(`
          *,
          campaign_channel_config:campaign_channel_configs(
            id,
            channel:channels(id, name, brand_color, icon_url)
          )
        `)
        .in("campaign_channel_config_id", configIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });
};

interface CreateAdSetPayload {
  campaign_channel_config_id: string;
  name: string;
  status?: string;
  audience_targeting?: Record<string, any>;
  placements?: string[];
  budget?: number;
  start_date?: string;
  end_date?: string;
}

export const useCreateAdSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateAdSetPayload) => {
      const { data, error } = await supabase
        .from("ad_sets")
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-sets"] });
      queryClient.invalidateQueries({ queryKey: ["ad-sets-by-campaign"] });
      toast.success("Ad Set created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create ad set");
    },
  });
};

interface UpdateAdSetPayload {
  id: string;
  name?: string;
  status?: string;
  audience_targeting?: Record<string, any>;
  placements?: string[];
  budget?: number;
  start_date?: string;
  end_date?: string;
}

export const useUpdateAdSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateAdSetPayload) => {
      const { data, error } = await supabase
        .from("ad_sets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-sets"] });
      queryClient.invalidateQueries({ queryKey: ["ad-sets-by-campaign"] });
      toast.success("Ad Set updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update ad set");
    },
  });
};

export const useDeleteAdSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ad_sets")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-sets"] });
      queryClient.invalidateQueries({ queryKey: ["ad-sets-by-campaign"] });
      toast.success("Ad Set deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete ad set");
    },
  });
};
