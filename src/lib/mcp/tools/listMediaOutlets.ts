import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_media_outlets",
  title: "List media outlets",
  description: "List PR media outlets (portals) with tier, traffic and eCPM values used for AVE.",
  inputSchema: {
    search: z.string().trim().optional().describe("Filter outlets by name."),
    tier: z.number().int().min(1).max(3).optional().describe("Filter by tier."),
    limit: z.number().int().optional().describe("Max rows to return (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, tier, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("media_outlets")
      .select("id, name, tier, average_monthly_visits, average_page_views_per_article, ecpm, is_active")
      .order("tier")
      .order("name")
      .limit(Math.min(Math.max(limit ?? 100, 1), 500));
    if (search) query = query.ilike("name", `%${search}%`);
    if (tier) query = query.eq("tier", tier);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { outlets: data ?? [] },
    };
  },
});
