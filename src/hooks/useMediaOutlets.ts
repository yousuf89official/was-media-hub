import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaOutlet {
  id: string;
  name: string;
  tier: number;
  pr_value_per_article: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMediaOutlets = () => {
  return useQuery({
    queryKey: ["media_outlets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_outlets")
        .select("*")
        .eq("is_active", true)
        .order("tier", { ascending: true })
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as MediaOutlet[];
    },
  });
};

export const useAllMediaOutlets = () => {
  return useQuery({
    queryKey: ["all_media_outlets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_outlets")
        .select("*")
        .order("tier", { ascending: true })
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as MediaOutlet[];
    },
  });
};

export const useAddMediaOutlet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (outlet: Omit<MediaOutlet, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("media_outlets")
        .insert(outlet)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media_outlets"] });
      queryClient.invalidateQueries({ queryKey: ["all_media_outlets"] });
      toast.success("Media outlet added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add media outlet: ${error.message}`);
    },
  });
};

export const useUpdateMediaOutlet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MediaOutlet> }) => {
      const { data, error } = await supabase
        .from("media_outlets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media_outlets"] });
      queryClient.invalidateQueries({ queryKey: ["all_media_outlets"] });
      toast.success("Media outlet updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update media outlet: ${error.message}`);
    },
  });
};

export const useDeleteMediaOutlet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("media_outlets")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media_outlets"] });
      queryClient.invalidateQueries({ queryKey: ["all_media_outlets"] });
      toast.success("Media outlet deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete media outlet: ${error.message}`);
    },
  });
};
