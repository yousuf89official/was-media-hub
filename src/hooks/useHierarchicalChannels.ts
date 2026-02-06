import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";

export interface ChannelWithDetails {
  id: string;
  name: string;
  channel_type: string;
  brand_color: string | null;
  icon_url: string | null;
  channel_category_id: string | null;
  display_order: number | null;
  objectives: Array<{
    id: string;
    name: string;
    description: string | null;
    funnel_type: string | null;
  }>;
  buyingModels: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  placements: Array<{
    id: string;
    name: string;
    mock_type: string;
    aspect_ratio: string | null;
    is_active: boolean;
  }>;
}

export interface CategoryWithChannels {
  id: string;
  name: string;
  brand_color: string | null;
  icon_url: string | null;
  is_active: boolean;
  channels: ChannelWithDetails[];
}

export function useHierarchicalChannels() {
  return useQuery({
    queryKey: ["hierarchical-channels"],
    queryFn: async () => {
      // Fetch all categories
      const { data: categories, error: catError } = await supabase
        .from("channel_categories")
        .select("*")
        .order("name");

      if (catError) throw catError;

      // Fetch all channels with their category
      const { data: channels, error: chError } = await supabase
        .from("channels")
        .select("*")
        .order("display_order", { ascending: true });

      if (chError) throw chError;

      // Fetch objectives
      const { data: objectives, error: objError } = await supabase
        .from("objectives")
        .select("*")
        .order("name");

      if (objError) throw objError;

      // Fetch buying models
      const { data: buyingModels, error: bmError } = await supabase
        .from("buying_models")
        .select("*")
        .order("name");

      if (bmError) throw bmError;

      // Fetch placements
      const { data: placements, error: plError } = await supabase
        .from("placements")
        .select("*")
        .order("name");

      if (plError) throw plError;

      // Build hierarchical structure
      const result: CategoryWithChannels[] = (categories || []).map((cat) => {
        const categoryChannels = (channels || [])
          .filter((ch) => ch.channel_category_id === cat.id)
          .map((ch) => ({
            id: ch.id,
            name: ch.name,
            channel_type: ch.channel_type,
            brand_color: ch.brand_color,
            icon_url: ch.icon_url,
            channel_category_id: ch.channel_category_id,
            display_order: ch.display_order,
            objectives: (objectives || []).filter((o) => o.channel_id === ch.id),
            buyingModels: (buyingModels || []).filter((b) => b.channel_id === ch.id),
            placements: (placements || []).filter((p) => p.channel_id === ch.id),
          }));

        return {
          id: cat.id,
          name: cat.name,
          brand_color: cat.brand_color,
          icon_url: cat.icon_url,
          is_active: cat.is_active ?? true,
          channels: categoryChannels,
        };
      });

      return result;
    },
  });
}
