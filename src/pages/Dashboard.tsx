import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: campaigns } = useCampaigns();

  const activeCampaigns = campaigns?.filter((c) => c.status === "running").length || 0;

  return (
    <div className="bg-background min-h-full">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your campaigns and media analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{activeCampaigns}</div>
                <BarChart3 className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {activeCampaigns === 0 ? "No campaigns yet" : "Currently running"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total AVE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">IDR 0</div>
                <TrendingUp className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Lifetime value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">0</div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Set up your first campaign to start tracking media performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/campaigns")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Campaigns
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/brands")}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Brands
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/ave-calculator")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Calculate AVE
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
