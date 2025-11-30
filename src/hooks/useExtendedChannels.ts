import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ChannelType = Database["public"]["Enums"]["channel_type"];

export interface ExtendedChannel {
  id: string;
  name: string;
  channel_type: ChannelType;
  channel_category_id: string | null;
  parent_channel_id: string | null;
  icon_url: string | null;
  brand_color: string | null;
  display_order: number;
  created_at: string;
  updated_at: string | null;
  channel_category?: {
    id: string;
    name: string;
    brand_color: string | null;
  } | null;
  parent_channel?: {
    id: string;
    name: string;
  } | null;
}

type ChannelInsert = {
  name: string;
  channel_type: ChannelType;
  channel_category_id?: string;
  parent_channel_id?: string;
  icon_url?: string;
  brand_color?: string;
  display_order?: number;
};

type ChannelUpdate = Partial<ChannelInsert>;

export const useExtendedChannels = () => {
  return useQuery({
    queryKey: ["extended-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select(`
          *,
          channel_category:channel_categories(id, name, brand_color)
        `)
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data as unknown as ExtendedChannel[];
    },
  });
};

export const useCreateExtendedChannel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (channel: ChannelInsert) => {
      const { data, error } = await supabase
        .from("channels")
        .insert([channel])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-channels"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Channel created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create channel");
    },
  });
};

export const useUpdateExtendedChannel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ChannelUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("channels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-channels"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Channel updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update channel");
    },
  });
};

export const useDeleteExtendedChannel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-channels"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Channel deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete channel");
    },
  });
};
