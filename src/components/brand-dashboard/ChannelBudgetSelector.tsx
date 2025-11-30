import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  brand_color?: string | null;
}

export interface ChannelBudget {
  channel_id: string;
  budget: number;
}

interface ChannelBudgetSelectorProps {
  channels: Channel[];
  selectedChannels: ChannelBudget[];
  onSelectionChange: (channels: ChannelBudget[]) => void;
  disabled?: boolean;
}

export const ChannelBudgetSelector = ({
  channels,
  selectedChannels,
  onSelectionChange,
  disabled = false,
}: ChannelBudgetSelectorProps) => {
  const [open, setOpen] = useState(false);

  const toggleChannel = (channelId: string) => {
    const exists = selectedChannels.find((c) => c.channel_id === channelId);
    if (exists) {
      onSelectionChange(selectedChannels.filter((c) => c.channel_id !== channelId));
    } else {
      onSelectionChange([...selectedChannels, { channel_id: channelId, budget: 0 }]);
    }
  };

  const updateBudget = (channelId: string, budget: number) => {
    onSelectionChange(
      selectedChannels.map((c) =>
        c.channel_id === channelId ? { ...c, budget } : c
      )
    );
  };

  const removeChannel = (channelId: string) => {
    onSelectionChange(selectedChannels.filter((c) => c.channel_id !== channelId));
  };

  const getChannelName = (channelId: string) => {
    return channels.find((c) => c.id === channelId)?.name || "Unknown";
  };

  const getChannelColor = (channelId: string) => {
    return channels.find((c) => c.id === channelId)?.brand_color || "#6366f1";
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedChannels.length > 0
              ? `${selectedChannels.length} channel(s) selected`
              : "Select channels..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="max-h-60 overflow-y-auto space-y-1">
            {channels.map((channel) => {
              const isSelected = selectedChannels.some(
                (c) => c.channel_id === channel.id
              );
              return (
                <div
                  key={channel.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => toggleChannel(channel.id)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: channel.brand_color || "#6366f1" }}
                  />
                  <span className="text-sm">{channel.name}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {selectedChannels.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Set budget per channel:</p>
          {selectedChannels.map((channelBudget) => (
            <div
              key={channelBudget.channel_id}
              className="flex items-center gap-2 p-3 rounded-lg border bg-card"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getChannelColor(channelBudget.channel_id) }}
              />
              <Badge variant="secondary" className="shrink-0">
                {getChannelName(channelBudget.channel_id)}
              </Badge>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">IDR</span>
                <Input
                  type="number"
                  placeholder="Budget"
                  value={channelBudget.budget || ""}
                  onChange={(e) =>
                    updateBudget(channelBudget.channel_id, parseFloat(e.target.value) || 0)
                  }
                  className="flex-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => removeChannel(channelBudget.channel_id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="font-medium">Total Budget:</span>
            <span className="font-semibold">
              IDR {selectedChannels.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
