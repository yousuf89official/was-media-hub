import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_brands",
  title: "List brands",
  description:
    "List brands the signed-in user can access, with optional name search.",
  inputSchema: {
    search: z.string().trim().optional().describe("Filter brands by name."),
    limit: z.number().int().optional().describe("Max rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("brands")
      .select("id, name, website, markets, categories, created_at")
      .order("name")
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { brands: data ?? [] },
    };
  },
});
