import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCampaign } from "@/hooks/useCampaigns";
import { useDeleteCampaign } from "@/hooks/useUpdateCampaign";
import { useMetrics } from "@/hooks/useMetrics";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import { CampaignSetupTab } from "@/components/campaign-setup";
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, Settings, BarChart3 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isLoading } = useCampaign(id || "");
  const { data: metrics, isLoading: loadingMetrics } = useMetrics(id);
  const deleteCampaign = useDeleteCampaign();
  
  // Enable real-time metrics updates
  useRealtimeMetrics(id);

  const handleDelete = async () => {
    if (id) {
      await deleteCampaign.mutateAsync(id);
      navigate("/campaigns");
    }
  };

  if (isLoading || loadingMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <Button onClick={() => navigate("/campaigns")}>Back to Campaigns</Button>
        </div>
      </div>
    );
  }

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

  // Calculate totals
  const totals = metrics?.reduce(
    (acc, metric) => ({
      impressions: acc.impressions + (metric.impressions || 0),
      clicks: acc.clicks + (metric.clicks || 0),
      engagements: acc.engagements + (metric.engagements || 0),
      reach: acc.reach + (metric.reach || 0),
      spend: acc.spend + Number(metric.spend || 0),
    }),
    { impressions: 0, clicks: 0, engagements: 0, reach: 0, spend: 0 }
  ) || { impressions: 0, clicks: 0, engagements: 0, reach: 0, spend: 0 };

  // Format chart data
  const chartData = metrics?.map((metric) => ({
    date: new Date(metric.date).toLocaleDateString(),
    impressions: metric.impressions || 0,
    engagements: metric.engagements || 0,
  })) || [];

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/campaigns/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the campaign
                    and all associated metrics.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Campaign Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{campaign.name}</CardTitle>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Brand: {campaign.brand?.name}</span>
                  <span>Channel: {campaign.channel?.name}</span>
                  {campaign.product && <span>Product: {campaign.product.name}</span>}
                </div>
              </div>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium">
                  {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                  {new Date(campaign.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Funnel Type</p>
                <p className="font-medium capitalize">{campaign.funnel_type}</p>
              </div>
              {campaign.primary_kpi && (
                <div>
                  <p className="text-sm text-muted-foreground">Primary KPI</p>
                  <p className="font-medium">{campaign.primary_kpi}</p>
                </div>
              )}
              {campaign.secondary_kpi && (
                <div>
                  <p className="text-sm text-muted-foreground">Secondary KPI</p>
                  <p className="font-medium">{campaign.secondary_kpi}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ad Setup
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totals.impressions.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totals.clicks.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Engagements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totals.engagements.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totals.reach.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Spend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    IDR {totals.spend.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="impressions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="engagements"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="setup">
            {id && <CampaignSetupTab campaignId={id} />}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => navigate(`/campaigns/${id}/metrics`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Metrics
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Metrics Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && metrics.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Engagements</TableHead>
                        <TableHead className="text-right">Reach</TableHead>
                        <TableHead className="text-right">Spend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell>
                            {new Date(metric.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(metric.impressions || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(metric.clicks || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(metric.engagements || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(metric.reach || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            IDR {Number(metric.spend || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No metrics data yet</p>
                    <Button onClick={() => navigate(`/campaigns/${id}/metrics`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Metrics
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CampaignDetail;
