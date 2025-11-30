import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtendedBuyingModel {
  id: string;
  name: string;
  description: string | null;
  channel_id: string | null;
  objective_id: string | null;
  created_at: string;
  updated_at: string | null;
  channel?: {
    id: string;
    name: string;
  } | null;
  objective?: {
    id: string;
    name: string;
  } | null;
}

type BuyingModelInsert = {
  name: string;
  description?: string;
  channel_id?: string;
  objective_id?: string;
};

type BuyingModelUpdate = Partial<BuyingModelInsert>;

export const useExtendedBuyingModels = (channelId?: string, objectiveId?: string) => {
  return useQuery({
    queryKey: ["extended-buying-models", channelId, objectiveId],
    queryFn: async () => {
      let query = supabase
        .from("buying_models")
        .select("*, channel:channels(id, name), objective:objectives(id, name)")
        .order("name");
      
      if (channelId) {
        query = query.eq("channel_id", channelId);
      }
      
      if (objectiveId) {
        query = query.eq("objective_id", objectiveId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ExtendedBuyingModel[];
    },
  });
};

export const useCreateBuyingModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (buyingModel: BuyingModelInsert) => {
      const { data, error } = await supabase
        .from("buying_models")
        .insert([buyingModel])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-buying-models"] });
      queryClient.invalidateQueries({ queryKey: ["buying-models"] });
      toast.success("Buying model created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create buying model");
    },
  });
};

export const useUpdateBuyingModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: BuyingModelUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("buying_models")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-buying-models"] });
      queryClient.invalidateQueries({ queryKey: ["buying-models"] });
      toast.success("Buying model updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update buying model");
    },
  });
};

export const useDeleteBuyingModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("buying_models")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-buying-models"] });
      queryClient.invalidateQueries({ queryKey: ["buying-models"] });
      toast.success("Buying model deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete buying model");
    },
  });
};
