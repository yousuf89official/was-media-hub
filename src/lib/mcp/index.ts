import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBrandsTool from "./tools/listBrands";
import listCampaignsTool from "./tools/listCampaigns";
import getCampaignPerformanceTool from "./tools/getCampaignPerformance";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// that Vite inlines at build time (keeps this module import-safe).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "was-media-hub",
  title: "WAS Media Hub",
  version: "0.1.0",
  instructions:
    "Tools for WAS Media Hub, a media campaign performance platform. Use `list_brands` to find brands, `list_campaigns` to browse campaigns (optionally by brand or status), and `get_campaign_performance` for a campaign's details plus aggregated metrics. All tools act as the signed-in user and respect their access permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listBrandsTool, listCampaignsTool, getCampaignPerformanceTool],
});
