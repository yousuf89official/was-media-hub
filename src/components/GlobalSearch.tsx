import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useBrands } from "@/hooks/useBrands";
import { Search, BarChart3, Package } from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const { data: campaigns } = useCampaigns();
  const { data: brands } = useBrands();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search campaigns, brands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {campaigns && campaigns.length > 0 && (
          <CommandGroup heading="Campaigns">
            {campaigns.slice(0, 5).map((campaign) => (
              <CommandItem
                key={campaign.id}
                value={campaign.name}
                onSelect={() => handleSelect(`/brands/${campaign.brand_id}/dashboard`)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>{campaign.name}</span>
                {campaign.brand?.name && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {campaign.brand.name}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {brands && brands.length > 0 && (
          <CommandGroup heading="Brands">
            {brands.slice(0, 5).map((brand) => (
              <CommandItem
                key={brand.id}
                value={brand.name}
                onSelect={() => handleSelect("/brands")}
              >
                <Package className="mr-2 h-4 w-4" />
                <span>{brand.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
