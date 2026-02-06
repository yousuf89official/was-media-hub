import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";

export interface CampaignType {
  id: string;
  name: string;
  type_enum: string;
  description: string | null;
  icon_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type CampaignTypeInsert = {
  name: string;
  type_enum: "Branding.Brand" | "Branding.Category" | "Branding.Product" | "Performance.Product";
  description?: string;
  icon_name?: string;
  is_active?: boolean;
};

type CampaignTypeUpdate = Partial<Omit<CampaignTypeInsert, 'type_enum'>> & {
  type_enum?: "Branding.Brand" | "Branding.Category" | "Branding.Product" | "Performance.Product";
};

export const useCampaignTypes = () => {
  return useQuery({
    queryKey: ["campaign-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CampaignType[];
    },
  });
};

export const useCreateCampaignType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignType: CampaignTypeInsert) => {
      const { data, error } = await supabase
        .from("campaign_types")
        .insert([campaignType])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
      toast.success("Campaign type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create campaign type");
    },
  });
};

export const useUpdateCampaignType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CampaignTypeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("campaign_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
      toast.success("Campaign type updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update campaign type");
    },
  });
};

export const useDeleteCampaignType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaign_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
      toast.success("Campaign type deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete campaign type");
    },
  });
};
