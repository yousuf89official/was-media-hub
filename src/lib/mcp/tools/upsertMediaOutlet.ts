import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "upsert_media_outlet",
  title: "Add or update media outlet",
  description:
    "Add a PR media outlet (portal) or update an existing one by name, including tier, traffic and eCPM used for AVE.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Outlet name, e.g. 'Palpres.disway.id'."),
    tier: z.number().int().min(1).max(3).describe("Outlet tier: 1, 2 or 3."),
    average_monthly_visits: z.number().int().nonnegative().optional().describe("Average monthly visits."),
    average_page_views_per_article: z.number().int().nonnegative().optional().describe("Average page views per article."),
    ecpm: z.number().nonnegative().optional().describe("eCPM in IDR."),
    is_active: z.boolean().optional().describe("Whether the outlet is active."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const columns = "id, name, tier, average_monthly_visits, average_page_views_per_article, ecpm, is_active";

    const { data: existing, error: findError } = await supabase
      .from("media_outlets")
      .select("id")
      .ilike("name", input.name)
      .maybeSingle();
    if (findError) return { content: [{ type: "text", text: findError.message }], isError: true };

    const payload = {
      name: input.name,
      tier: input.tier,
      average_monthly_visits: input.average_monthly_visits ?? 0,
      average_page_views_per_article: input.average_page_views_per_article ?? 0,
      ecpm: input.ecpm ?? 0,
      is_active: input.is_active ?? true,
    };

    const { data, error } = existing
      ? await supabase.from("media_outlets").update(payload).eq("id", existing.id).select(columns).maybeSingle()
      : await supabase.from("media_outlets").insert(payload).select(columns).maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: "Not saved — you may lack permission to manage media outlets." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { outlet: data, created: !existing },
    };
  },
});
