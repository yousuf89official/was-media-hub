import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type FunnelType = Database["public"]["Enums"]["funnel_type"];

export interface ExtendedObjective {
  id: string;
  name: string;
  description: string | null;
  channel_id: string | null;
  funnel_type: FunnelType | null;
  created_at: string;
  updated_at: string | null;
  channel?: {
    id: string;
    name: string;
  } | null;
}

type ObjectiveInsert = {
  name: string;
  description?: string;
  channel_id?: string;
  funnel_type?: FunnelType;
};

type ObjectiveUpdate = Partial<ObjectiveInsert>;

export const useExtendedObjectives = (channelId?: string) => {
  return useQuery({
    queryKey: ["extended-objectives", channelId],
    queryFn: async () => {
      let query = supabase
        .from("objectives")
        .select("*, channel:channels(id, name)")
        .order("name");
      
      if (channelId) {
        query = query.eq("channel_id", channelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ExtendedObjective[];
    },
  });
};

export const useCreateObjective = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (objective: ObjectiveInsert) => {
      const { data, error } = await supabase
        .from("objectives")
        .insert([objective])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-objectives"] });
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objective created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create objective");
    },
  });
};

export const useUpdateObjective = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ObjectiveUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("objectives")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-objectives"] });
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objective updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update objective");
    },
  });
};

export const useDeleteObjective = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("objectives")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-objectives"] });
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objective deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete objective");
    },
  });
};
