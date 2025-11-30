import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  brand_color?: string | null;
  icon_url?: string | null;
}

interface ChannelMultiSelectProps {
  channels: Channel[];
  selectedChannels: string[];
  onSelectionChange: (channels: string[]) => void;
  className?: string;
}

export function ChannelMultiSelect({ 
  channels, 
  selectedChannels, 
  onSelectionChange,
  className 
}: ChannelMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      onSelectionChange(selectedChannels.filter(id => id !== channelId));
    } else {
      onSelectionChange([...selectedChannels, channelId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAll = () => {
    onSelectionChange(channels.map(c => c.id));
  };

  const selectedChannelNames = channels
    .filter(c => selectedChannels.includes(c.id))
    .map(c => c.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn("h-8 justify-between min-w-[140px]", className)}
        >
          <span className="truncate text-xs">
            {selectedChannels.length === 0 
              ? "All Channels" 
              : selectedChannels.length === channels.length
                ? "All Channels"
                : `${selectedChannels.length} selected`}
          </span>
          <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="start">
        <div className="flex items-center justify-between mb-2 pb-2 border-b">
          <span className="text-xs font-medium">Channels</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={selectAll}>
              All
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {channels.map((channel) => (
            <label
              key={channel.id}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={selectedChannels.includes(channel.id)}
                onCheckedChange={() => toggleChannel(channel.id)}
                className="h-3.5 w-3.5"
              />
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {channel.icon_url && (
                  <img src={channel.icon_url} alt="" className="h-3.5 w-3.5 object-contain" />
                )}
                {channel.brand_color && !channel.icon_url && (
                  <div 
                    className="h-2.5 w-2.5 rounded-full" 
                    style={{ backgroundColor: channel.brand_color }}
                  />
                )}
                <span className="text-xs truncate">{channel.name}</span>
              </div>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}