import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_brand",
  title: "Create brand",
  description: "Create a new brand for the signed-in user's organisation.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Brand name."),
    website: z.string().trim().url().optional().describe("Brand website URL."),
    markets: z.array(z.string().trim().min(1)).optional().describe("Markets, e.g. ['ID','SG']."),
    categories: z.array(z.string().trim().min(1)).optional().describe("Brand categories."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ name, website, markets, categories }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("brands")
      .insert({ name, website, markets, categories })
      .select("id, name, website, markets, categories")
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { brand: data },
    };
  },
});
