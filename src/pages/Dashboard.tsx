import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Eye, Zap } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { 
  useDashboardStats, 
  useTopCampaigns, 
  usePerformanceTrend,
  useChannelPerformance,
  useRecentActivity 
} from "@/hooks/useDashboardData";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TopCampaigns from "@/components/dashboard/TopCampaigns";
import ChannelComparison from "@/components/dashboard/ChannelComparison";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: campaigns } = useCampaigns();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topCampaigns, isLoading: topCampaignsLoading } = useTopCampaigns(5);
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceTrend(30);
  const { data: channelData, isLoading: channelLoading } = useChannelPerformance();
  const { data: activityData, isLoading: activityLoading } = useRecentActivity(10);

  const hasNoCampaigns = !campaigns || campaigns.length === 0;

  return (
    <div className="bg-background min-h-full">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : stats?.activeCampaigns || 0}
                </div>
                <BarChart3 className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                of {stats?.totalCampaigns || 0} total
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
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : `IDR ${(stats?.totalAVE || 0).toLocaleString()}`}
                </div>
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
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : (stats?.totalReach || 0).toLocaleString()}
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Impressions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : (stats?.totalImpressions || 0).toLocaleString()}
                </div>
                <Eye className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : `IDR ${(stats?.totalSpend || 0).toLocaleString()}`}
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Media investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : `${stats?.engagementRate || 0}%`}
                </div>
                <Zap className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average rate</p>
            </CardContent>
          </Card>
        </div>

        {hasNoCampaigns ? (
          /* Getting Started */
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up your first campaign to start tracking media performance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate("/campaigns/new")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Create Campaign
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
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate("/admin-settings")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Performance Trend Chart */}
            <div className="mb-8">
              <PerformanceChart data={performanceData || []} isLoading={performanceLoading} />
            </div>

            {/* Two Column Layout for Charts */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ChannelComparison data={channelData || []} isLoading={channelLoading} />
              <ActivityFeed data={activityData || []} isLoading={activityLoading} />
            </div>

            {/* Top Campaigns Table */}
            <TopCampaigns data={topCampaigns || []} isLoading={topCampaignsLoading} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
