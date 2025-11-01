import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as Icons from "lucide-react";

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
}

const iconList = [
  "BarChart3",
  "TrendingUp",
  "Users",
  "Award",
  "Target",
  "Zap",
  "Shield",
  "Globe",
  "Sparkles",
  "Lightbulb",
  "Heart",
  "Star",
  "Rocket",
  "Bell",
  "Lock",
  "Eye",
  "MessageCircle",
  "Share2",
];

export const IconSelector = ({ value, onChange }: IconSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = iconList.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value && (Icons as any)[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {SelectedIcon && <SelectedIcon className="mr-2 h-4 w-4" />}
          {value || "Select icon"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-2">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 max-h-64 overflow-y-auto">
          {filteredIcons.map((iconName) => {
            const IconComponent = (Icons as any)[iconName];
            return (
              <Button
                key={iconName}
                variant={value === iconName ? "default" : "ghost"}
                size="sm"
                className="h-12 relative"
                onClick={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
                {value === iconName && (
                  <Check className="absolute top-1 right-1 h-3 w-3" />
                )}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
