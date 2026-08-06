import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export default defineTool({
  name: "update_campaign",
  title: "Update campaign",
  description:
    "Update an existing campaign's name, status, dates, KPI or cost. Only provided fields are changed.",
  inputSchema: {
    campaign_id: z.string().uuid().describe("Campaign to update."),
    name: z.string().trim().min(1).optional(),
    status: z.enum(["draft", "running", "finished"]).optional(),
    start_date: isoDate.optional(),
    end_date: isoDate.optional(),
    primary_kpi: z.string().trim().optional(),
    kpi_target: z.number().nonnegative().optional(),
    cost_idr: z.number().nonnegative().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ campaign_id, ...patch }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const updates = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(updates).length === 0) {
      return { content: [{ type: "text", text: "No fields to update" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", campaign_id)
      .select("id, name, status, start_date, end_date, primary_kpi, kpi_target, cost_idr")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: "Campaign not found or you lack permission to edit it." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { campaign: data },
    };
  },
});
