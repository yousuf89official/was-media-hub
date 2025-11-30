import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChannelCategory {
  id: string;
  name: string;
  icon_url: string | null;
  brand_color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type ChannelCategoryInsert = {
  name: string;
  icon_url?: string;
  brand_color?: string;
  is_active?: boolean;
};

type ChannelCategoryUpdate = Partial<ChannelCategoryInsert>;

export const useChannelCategories = () => {
  return useQuery({
    queryKey: ["channel-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as ChannelCategory[];
    },
  });
};

export const useCreateChannelCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: ChannelCategoryInsert) => {
      const { data, error } = await supabase
        .from("channel_categories")
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel-categories"] });
      toast.success("Channel category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create channel category");
    },
  });
};

export const useUpdateChannelCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ChannelCategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("channel_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel-categories"] });
      toast.success("Channel category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update channel category");
    },
  });
};

export const useDeleteChannelCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("channel_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel-categories"] });
      toast.success("Channel category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete channel category");
    },
  });
};
