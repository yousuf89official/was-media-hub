import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MetricDefinition {
  id: string;
  name: string;
  key: string;
  description: string | null;
  category: string;
  data_type: string;
  aggregation_method: string;
  formula: string | null;
  is_system: boolean;
  is_active: boolean;
  icon_name: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

type MetricDefinitionInsert = {
  name: string;
  key: string;
  category: string;
  description?: string;
  data_type?: string;
  aggregation_method?: string;
  formula?: string;
  is_system?: boolean;
  is_active?: boolean;
  icon_name?: string;
  display_order?: number;
};

type MetricDefinitionUpdate = Partial<MetricDefinitionInsert>;

export const useMetricDefinitions = (category?: string) => {
  return useQuery({
    queryKey: ["metric-definitions", category],
    queryFn: async () => {
      let query = supabase
        .from("metric_definitions")
        .select("*")
        .order("display_order");
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MetricDefinition[];
    },
  });
};

export const useCreateMetricDefinition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metric: MetricDefinitionInsert) => {
      const { data, error } = await supabase
        .from("metric_definitions")
        .insert([{ ...metric, is_system: false }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metric-definitions"] });
      toast.success("Metric definition created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create metric definition");
    },
  });
};

export const useUpdateMetricDefinition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: MetricDefinitionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("metric_definitions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metric-definitions"] });
      toast.success("Metric definition updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update metric definition");
    },
  });
};

export const useDeleteMetricDefinition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("metric_definitions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metric-definitions"] });
      toast.success("Metric definition deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete metric definition");
    },
  });
};
