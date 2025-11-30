import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Placement {
  id: string;
  channel_id: string;
  name: string;
  description: string | null;
  mock_type: string;
  aspect_ratio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  channel?: {
    id: string;
    name: string;
  };
}

type PlacementMockType = "MobileFeedMock" | "StoryMock" | "ReelsMock" | "InStreamMock" | "BillboardMock" | "SearchAdMock" | "DisplayAdMock";

type PlacementInsert = {
  channel_id: string;
  name: string;
  mock_type: PlacementMockType;
  description?: string;
  aspect_ratio?: string;
  is_active?: boolean;
};

type PlacementUpdate = Partial<Omit<PlacementInsert, 'mock_type'>> & {
  mock_type?: PlacementMockType;
};

export const usePlacements = (channelId?: string) => {
  return useQuery({
    queryKey: ["placements", channelId],
    queryFn: async () => {
      let query = supabase
        .from("placements")
        .select("*, channel:channels(id, name)")
        .order("name");
      
      if (channelId) {
        query = query.eq("channel_id", channelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Placement[];
    },
  });
};

export const useCreatePlacement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (placement: PlacementInsert) => {
      const { data, error } = await supabase
        .from("placements")
        .insert([placement])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      toast.success("Placement created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create placement");
    },
  });
};

export const useUpdatePlacement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: PlacementUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("placements")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      toast.success("Placement updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update placement");
    },
  });
};

export const useDeletePlacement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("placements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      toast.success("Placement deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete placement");
    },
  });
};
