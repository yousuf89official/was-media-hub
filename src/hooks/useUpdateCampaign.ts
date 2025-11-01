import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...campaign }: any) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(campaign)
        .eq("id", id)
        .select(`
          *,
          brand:brands(id, name),
          channel:channels(id, name),
          product:products(id, name)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign"] });
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
