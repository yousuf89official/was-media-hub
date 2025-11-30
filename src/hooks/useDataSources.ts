import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DataSource {
  id: string;
  brand_id: string | null;
  campaign_id: string | null;
  name: string;
  source_type: string;
  sheet_id: string | null;
  sheet_url: string | null;
  sheet_name: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  sync_frequency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface DataSourceMapping {
  id: string;
  data_source_id: string;
  metric_key: string;
  cell_range: string;
  sheet_tab: string | null;
  transform_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useDataSources(brandId?: string) {
  return useQuery({
    queryKey: ["data-sources", brandId],
    queryFn: async () => {
      let query = supabase
        .from("data_sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (brandId) {
        query = query.eq("brand_id", brandId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DataSource[];
    },
    enabled: !!brandId,
  });
}

export function useDataSourceMappings(dataSourceId?: string) {
  return useQuery({
    queryKey: ["data-source-mappings", dataSourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_source_mappings")
        .select("*")
        .eq("data_source_id", dataSourceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DataSourceMapping[];
    },
    enabled: !!dataSourceId,
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dataSource: Omit<DataSource, "id" | "created_at" | "updated_at">) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("data_sources")
        .insert({ ...dataSource, created_by: user.user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", variables.brand_id] });
      toast.success("Data source connected successfully");
    },
    onError: (error) => {
      toast.error("Failed to connect data source: " + error.message);
    },
  });
}

export function useUpdateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DataSource> & { id: string }) => {
      const { data, error } = await supabase
        .from("data_sources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["data-sources"] });
      toast.success("Data source updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update data source: " + error.message);
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("data_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources"] });
      toast.success("Data source deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete data source: " + error.message);
    },
  });
}

export function useCreateMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mapping: Omit<DataSourceMapping, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("data_source_mappings")
        .insert(mapping)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-source-mappings", variables.data_source_id] });
      toast.success("Mapping created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create mapping: " + error.message);
    },
  });
}

export function useDeleteMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("data_source_mappings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-source-mappings"] });
      toast.success("Mapping deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete mapping: " + error.message);
    },
  });
}
