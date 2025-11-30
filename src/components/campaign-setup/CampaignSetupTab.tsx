import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignChannelConfigs } from "@/hooks/useCampaignChannelConfigs";
import { useAdSetsByCampaign } from "@/hooks/useAdSets";
import { AdSetEditor } from "./AdSetEditor";

interface CampaignSetupTabProps {
  campaignId: string;
}

export const CampaignSetupTab = ({ campaignId }: CampaignSetupTabProps) => {
  const { data: channelConfigs, isLoading: loadingConfigs } = useCampaignChannelConfigs(campaignId);
  const { data: adSets, isLoading: loadingAdSets } = useAdSetsByCampaign(campaignId);

  if (loadingConfigs || loadingAdSets) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!channelConfigs || channelConfigs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No channels configured for this campaign. Edit the campaign to add channels.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group ad sets by channel config
  const adSetsByConfig = (adSets || []).reduce((acc, adSet) => {
    const configId = adSet.campaign_channel_config_id;
    if (!acc[configId]) acc[configId] = [];
    acc[configId].push(adSet);
    return acc;
  }, {} as Record<string, typeof adSets>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Campaign Setup</h3>
        <p className="text-sm text-muted-foreground">
          Configure ad sets and creatives for each channel in your campaign.
        </p>
      </div>

      {channelConfigs.map((config) => {
        const channel = config.channel;
        const configAdSets = adSetsByConfig[config.id] || [];

        return (
          <Card key={config.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {channel?.icon_url && (
                    <img src={channel.icon_url} alt={channel.name} className="w-6 h-6" />
                  )}
                  <div>
                    <CardTitle className="text-base">{channel?.name || "Channel"}</CardTitle>
                    <CardDescription>
                      Budget: {(config.budget || 0).toLocaleString()} IDR
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.objective?.name && (
                    <Badge variant="outline">{config.objective.name}</Badge>
                  )}
                  {config.buying_model?.name && (
                    <Badge variant="secondary">{config.buying_model.name}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AdSetEditor
                campaignChannelConfigId={config.id}
                channelId={config.channel_id}
                channelName={channel?.name || "Channel"}
                adSets={configAdSets}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
