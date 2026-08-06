import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export default defineTool({
  name: "create_campaign",
  title: "Create campaign",
  description:
    "Create a draft campaign under a brand. Use `list_brands` for brand_id and `list_channels` for channel_id.",
  inputSchema: {
    brand_id: z.string().uuid().describe("Brand the campaign belongs to."),
    name: z.string().trim().min(1).describe("Campaign name."),
    channel_id: z.string().uuid().describe("Primary channel id."),
    funnel_type: z.enum(["TOP", "MID", "BOTTOM"]).describe("Funnel stage."),
    start_date: isoDate.describe("Start date (YYYY-MM-DD)."),
    end_date: isoDate.describe("End date (YYYY-MM-DD)."),
    status: z.enum(["draft", "running", "finished"]).optional().describe("Defaults to draft."),
    primary_kpi: z.string().trim().optional().describe("Primary KPI name."),
    kpi_target: z.number().nonnegative().optional().describe("Primary KPI target value."),
    cost_idr: z.number().nonnegative().optional().describe("Campaign cost in IDR."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (input.end_date < input.start_date) {
      return { content: [{ type: "text", text: "end_date must be on or after start_date" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        ...input,
        status: input.status ?? "draft",
        created_by: ctx.getUserId(),
      })
      .select("id, name, brand_id, channel_id, funnel_type, status, start_date, end_date")
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { campaign: data },
    };
  },
});
