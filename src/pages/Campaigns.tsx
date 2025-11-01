import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Badge } from "@/components/ui/badge";
import AdvancedFilters, { FilterState } from "@/components/AdvancedFilters";
import { CampaignGridSkeleton } from "@/components/skeletons/CampaignSkeleton";
import EmptyState from "@/components/EmptyState";

const Campaigns = () => {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({});

  const filteredCampaigns = campaigns?.filter((campaign) => {
    // Text search
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.brand?.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Brand filter
    const matchesBrand = !filters.brandId || filters.brandId === "all" || campaign.brand_id === filters.brandId;

    // Channel filter
    const matchesChannel = !filters.channelId || filters.channelId === "all" || campaign.channel_id === filters.channelId;

    // Status filter
    const matchesStatus = !filters.status || filters.status === "all" || campaign.status === filters.status;

    // Date filters
    const campaignStart = new Date(campaign.start_date);
    const campaignEnd = new Date(campaign.end_date);
    const filterStart = filters.startDate ? new Date(filters.startDate) : null;
    const filterEnd = filters.endDate ? new Date(filters.endDate) : null;

    const matchesDateRange =
      (!filterStart || campaignEnd >= filterStart) &&
      (!filterEnd || campaignStart <= filterEnd);

    return matchesSearch && matchesBrand && matchesChannel && matchesStatus && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "finished":
        return "bg-gray-500";
      default:
        return "bg-yellow-500";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-full">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <div className="flex gap-2">
              <Button disabled>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Input placeholder="Search campaigns..." disabled />
            </div>
          </div>
          <CampaignGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <div className="flex gap-2">
            <AdvancedFilters onFiltersChange={setFilters} initialFilters={filters} />
            <Button onClick={() => navigate("/campaigns/new")}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns?.map((campaign) => (
            <Card
              key={campaign.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Brand:</span> {campaign.brand?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Channel:</span> {campaign.channel?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Period:</span>{" "}
                  {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                  {new Date(campaign.end_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCampaigns?.length === 0 && (
          <EmptyState
            icon={BarChart3}
            title="No campaigns found"
            description={
              searchTerm || Object.values(filters).some((v) => v)
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first campaign to track media performance and calculate AVE."
            }
            actionLabel={!searchTerm && !Object.values(filters).some((v) => v) ? "Create Campaign" : undefined}
            onAction={!searchTerm && !Object.values(filters).some((v) => v) ? () => navigate("/campaigns/new") : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default Campaigns;
