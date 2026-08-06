import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_channels",
  title: "List channels",
  description: "List available media channels and their ids, used when creating campaigns.",
  inputSchema: {
    search: z.string().trim().optional().describe("Filter channels by name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("channels")
      .select("id, name, channel_type, display_order")
      .order("display_order", { nullsFirst: false })
      .order("name")
      .limit(300);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { channels: data ?? [] },
    };
  },
});
