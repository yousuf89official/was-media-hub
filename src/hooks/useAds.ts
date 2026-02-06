import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";

export interface Ad {
  id: string;
  ad_set_id: string;
  name: string;
  status: string;
  creative_url: string | null;
  headline: string | null;
  description: string | null;
  cta_text: string | null;
  destination_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useAds = (adSetId?: string) => {
  return useQuery({
    queryKey: ["ads", adSetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("ad_set_id", adSetId!)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Ad[];
    },
    enabled: !!adSetId,
  });
};

export const useAdsByAdSetIds = (adSetIds?: string[]) => {
  return useQuery({
    queryKey: ["ads-by-adsets", adSetIds],
    queryFn: async () => {
      if (!adSetIds || adSetIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .in("ad_set_id", adSetIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Ad[];
    },
    enabled: !!adSetIds && adSetIds.length > 0,
  });
};

interface CreateAdPayload {
  ad_set_id: string;
  name: string;
  status?: string;
  creative_url?: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  destination_url?: string;
}

export const useCreateAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateAdPayload) => {
      const { data, error } = await supabase
        .from("ads")
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads-by-adsets"] });
      toast.success("Ad created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create ad");
    },
  });
};

interface UpdateAdPayload {
  id: string;
  name?: string;
  status?: string;
  creative_url?: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  destination_url?: string;
}

export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateAdPayload) => {
      const { data, error } = await supabase
        .from("ads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads-by-adsets"] });
      toast.success("Ad updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update ad");
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads-by-adsets"] });
      toast.success("Ad deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete ad");
    },
  });
};
