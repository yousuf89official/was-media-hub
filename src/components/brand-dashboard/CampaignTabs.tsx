import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Layers } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  channel?: { id: string; name: string; channel_type: string } | null;
  campaign_type?: { id: string; name: string; type_enum: string } | null;
}

interface CampaignTabsProps {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  onSelectCampaign: (campaignId: string | null) => void;
}

export function CampaignTabs({ campaigns, selectedCampaignId, onSelectCampaign }: CampaignTabsProps) {
  const activeCampaigns = campaigns.filter(c => c.status === "running");
  const otherCampaigns = campaigns.filter(c => c.status !== "running");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* All Campaigns Button */}
      <Button
        variant={selectedCampaignId === null ? "default" : "outline"}
        size="sm"
        className={cn(
          "h-7 text-xs gap-1.5 px-2.5",
          selectedCampaignId === null && "bg-primary text-primary-foreground"
        )}
        onClick={() => onSelectCampaign(null)}
      >
        <Layers className="h-3 w-3" />
        All Campaigns
        <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
          {campaigns.length}
        </Badge>
      </Button>

      {/* Divider */}
      {activeCampaigns.length > 0 && (
        <div className="h-5 w-px bg-border mx-1" />
      )}

      {/* Active Campaign Cards */}
      {activeCampaigns.map((campaign) => (
        <CampaignTabCard
          key={campaign.id}
          campaign={campaign}
          isSelected={selectedCampaignId === campaign.id}
          onSelect={() => onSelectCampaign(campaign.id)}
        />
      ))}

      {/* Other Campaigns (collapsed) */}
      {otherCampaigns.length > 0 && (
        <>
          <div className="h-5 w-px bg-border mx-1" />
          {otherCampaigns.map((campaign) => (
            <CampaignTabCard
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedCampaignId === campaign.id}
              onSelect={() => onSelectCampaign(campaign.id)}
              compact
            />
          ))}
        </>
      )}
    </div>
  );
}

function CampaignTabCard({ 
  campaign, 
  isSelected, 
  onSelect,
  compact = false
}: { 
  campaign: Campaign; 
  isSelected: boolean; 
  onSelect: () => void;
  compact?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-emerald-500";
      case "finished": return "bg-blue-500";
      default: return "bg-muted-foreground";
    }
  };

  const getCampaignTypeShort = (typeEnum?: string) => {
    if (!typeEnum) return null;
    const parts = typeEnum.split('.');
    return parts[parts.length - 1]?.slice(0, 3).toUpperCase();
  };

  if (compact) {
    return (
      <Button
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        className={cn(
          "h-6 text-[10px] px-2 gap-1",
          isSelected && "bg-primary text-primary-foreground",
          !isSelected && "text-muted-foreground hover:text-foreground"
        )}
        onClick={onSelect}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusColor(campaign.status))} />
        <span className="truncate max-w-[80px]">{campaign.name}</span>
      </Button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-all",
        "hover:shadow-sm cursor-pointer",
        isSelected 
          ? "bg-primary/10 border-primary/50 shadow-sm" 
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      {/* Status Indicator */}
      <span className={cn("w-2 h-2 rounded-full shrink-0 animate-pulse", getStatusColor(campaign.status))} />
      
      {/* Campaign Info */}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-xs font-medium truncate max-w-[120px]">{campaign.name}</span>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {campaign.channel && (
            <span className="truncate max-w-[60px]">{campaign.channel.name}</span>
          )}
          {campaign.campaign_type && (
            <>
              <span>•</span>
              <span>{getCampaignTypeShort(campaign.campaign_type.type_enum)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
