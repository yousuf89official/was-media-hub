import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CampaignServiceCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  icon_name: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CampaignService {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  category?: CampaignServiceCategory;
}

export const useCampaignServiceCategories = () => {
  return useQuery({
    queryKey: ["campaign-service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_service_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CampaignServiceCategory[];
    },
  });
};

export const useCampaignServices = (categoryId?: string) => {
  return useQuery({
    queryKey: ["campaign-services", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("campaign_services")
        .select("*, category:campaign_service_categories(*)")
        .order("name", { ascending: true });
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CampaignService[];
    },
  });
};

export const useCreateCampaignService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (service: { category_id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("campaign_services")
        .insert([service])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-services"] });
      toast.success("Service created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create service");
    },
  });
};

export const useUpdateCampaignService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from("campaign_services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-services"] });
      toast.success("Service updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update service");
    },
  });
};

export const useDeleteCampaignService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaign_services")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-services"] });
      toast.success("Service deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete service");
    },
  });
};
