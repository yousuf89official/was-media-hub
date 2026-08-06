import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBrandsTool from "./tools/listBrands";
import listCampaignsTool from "./tools/listCampaigns";
import getCampaignPerformanceTool from "./tools/getCampaignPerformance";
import listChannelsTool from "./tools/listChannels";
import listMediaOutletsTool from "./tools/listMediaOutlets";
import createBrandTool from "./tools/createBrand";
import createCampaignTool from "./tools/createCampaign";
import updateCampaignTool from "./tools/updateCampaign";
import upsertMediaOutletTool from "./tools/upsertMediaOutlet";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// that Vite inlines at build time (keeps this module import-safe).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "was-media-hub",
  title: "WAS Media Hub",
  version: "0.2.0",
  instructions:
    "Tools for WAS Media Hub, a media campaign performance platform. Read: `list_brands`, `list_campaigns`, `get_campaign_performance`, `list_channels`, `list_media_outlets`. Write: `create_brand`, `create_campaign`, `update_campaign`, `upsert_media_outlet`. Fetch ids with the list tools before writing. All tools act as the signed-in user and respect their access permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listBrandsTool,
    listCampaignsTool,
    getCampaignPerformanceTool,
    listChannelsTool,
    listMediaOutletsTool,
    createBrandTool,
    createCampaignTool,
    updateCampaignTool,
    upsertMediaOutletTool,
  ],
});
