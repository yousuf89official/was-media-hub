import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLandingFeatures = () => {
  return useQuery({
    queryKey: ["landing-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_features")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (feature: {
      title: string;
      description: string;
      icon_name: string;
      display_order: number;
    }) => {
      const { data, error } = await supabase
        .from("landing_features")
        .insert(feature)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-features"] });
      toast.success("Feature created successfully");
    },
    onError: () => {
      toast.error("Failed to create feature");
    },
  });
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string;
      icon_name?: string;
      display_order?: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("landing_features")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-features"] });
      toast.success("Feature updated successfully");
    },
    onError: () => {
      toast.error("Failed to update feature");
    },
  });
};

export const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("landing_features")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-features"] });
      toast.success("Feature deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete feature");
    },
  });
};

export const useReorderFeatures = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (features: { id: string; display_order: number }[]) => {
      const promises = features.map(({ id, display_order }) =>
        supabase
          .from("landing_features")
          .update({ display_order })
          .eq("id", id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) throw errors[0].error;
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-features"] });
      toast.success("Features reordered successfully");
    },
    onError: () => {
      toast.error("Failed to reorder features");
    },
  });
};
