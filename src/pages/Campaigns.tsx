import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Badge } from "@/components/ui/badge";

const Campaigns = () => {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCampaigns = campaigns?.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Campaigns</h1>
          <Button onClick={() => navigate("/campaigns/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No campaigns found</p>
            <Button onClick={() => navigate("/campaigns/new")}>
              Create your first campaign
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Campaigns;
