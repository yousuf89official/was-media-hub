import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_campaigns",
  title: "List campaigns",
  description:
    "List campaigns visible to the signed-in user, optionally filtered by brand, status, or name.",
  inputSchema: {
    brandId: z.string().uuid().optional().describe("Only campaigns for this brand id."),
    status: z.string().trim().optional().describe("Campaign status filter, e.g. active."),
    search: z.string().trim().optional().describe("Filter by campaign name."),
    limit: z.number().int().optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ brandId, status, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("campaigns")
      .select(
        "id, name, status, funnel_type, start_date, end_date, cost_idr, primary_kpi, kpi_target, brand:brands(id, name), channel:channels(id, name)"
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 25, 1), 100));

    if (brandId) query = query.eq("brand_id", brandId);
    if (status) query = query.eq("status", status as never);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { campaigns: data ?? [] },
    };
  },
});
