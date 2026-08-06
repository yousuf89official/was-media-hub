import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_campaign_performance",
  title: "Get campaign performance",
  description:
    "Return a campaign's details plus aggregated performance metrics (impressions, reach, clicks, engagements, spend) over an optional date range.",
  inputSchema: {
    campaignId: z.string().uuid().describe("Campaign id."),
    startDate: z.string().trim().optional().describe("Inclusive start date, YYYY-MM-DD."),
    endDate: z.string().trim().optional().describe("Inclusive end date, YYYY-MM-DD."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ campaignId, startDate, endDate }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select(
        "id, name, status, funnel_type, start_date, end_date, cost_idr, primary_kpi, kpi_target, brand:brands(id, name)"
      )
      .eq("id", campaignId)
      .maybeSingle();

    if (campaignError) {
      return { content: [{ type: "text", text: campaignError.message }], isError: true };
    }
    if (!campaign) {
      return {
        content: [{ type: "text", text: "Campaign not found or not accessible." }],
        isError: true,
      };
    }

    let metricsQuery = supabase
      .from("metrics")
      .select("date, impressions, reach, clicks, engagements, video_views, spend")
      .eq("campaign_id", campaignId)
      .order("date");
    if (startDate) metricsQuery = metricsQuery.gte("date", startDate);
    if (endDate) metricsQuery = metricsQuery.lte("date", endDate);

    const { data: metrics, error: metricsError } = await metricsQuery;
    if (metricsError) {
      return { content: [{ type: "text", text: metricsError.message }], isError: true };
    }

    const rows = metrics ?? [];
    const sum = (key: keyof (typeof rows)[number]) =>
      rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);

    const totals = {
      days: rows.length,
      impressions: sum("impressions"),
      reach: sum("reach"),
      clicks: sum("clicks"),
      engagements: sum("engagements"),
      videoViews: sum("video_views"),
      spend: sum("spend"),
    };
    const ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
    const summary = { ...totals, ctr };

    return {
      content: [
        { type: "text", text: JSON.stringify({ campaign, summary }, null, 2) },
      ],
      structuredContent: { campaign, summary, metrics: rows },
    };
  },
});
