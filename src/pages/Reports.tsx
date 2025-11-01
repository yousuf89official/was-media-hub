import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useBrands } from "@/hooks/useBrands";
import { useMetrics } from "@/hooks/useMetrics";
import { Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  const { data: campaigns } = useCampaigns();
  const { data: brands } = useBrands();
  const { data: metrics } = useMetrics(selectedCampaign);

  const handleExport = (format: "csv" | "pdf") => {
    if (!selectedCampaign && !selectedBrand) {
      toast.error("Please select a campaign or brand to generate a report");
      return;
    }
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // Export logic will be implemented
  };

  const generateCampaignReport = () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }

    const campaign = campaigns?.find(c => c.id === selectedCampaign);
    if (!campaign) return;

    const campaignMetrics = metrics?.filter(m => {
      const metricDate = new Date(m.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && metricDate < start) return false;
      if (end && metricDate > end) return false;
      return true;
    });

    const totals = campaignMetrics?.reduce(
      (acc, m) => ({
        impressions: acc.impressions + (m.impressions || 0),
        clicks: acc.clicks + (m.clicks || 0),
        engagements: acc.engagements + (m.engagements || 0),
        reach: acc.reach + (m.reach || 0),
        spend: acc.spend + Number(m.spend || 0),
      }),
      { impressions: 0, clicks: 0, engagements: 0, reach: 0, spend: 0 }
    );

    return {
      campaign,
      metrics: campaignMetrics,
      totals,
      dateRange: {
        start: startDate || campaign.start_date,
        end: endDate || campaign.end_date,
      },
    };
  };

  const reportData = generateCampaignReport();

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports for your campaigns and brands
          </p>
        </div>

        <Tabs defaultValue="campaign" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="campaign">Campaign Report</TabsTrigger>
            <TabsTrigger value="brand">Brand Report</TabsTrigger>
            <TabsTrigger value="channel">Channel Report</TabsTrigger>
          </TabsList>

          {/* Campaign Report */}
          <TabsContent value="campaign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Campaign Performance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Campaign</Label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns?.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start date"
                      />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>

                {reportData && selectedCampaign && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Report Preview</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Total Impressions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {reportData.totals.impressions.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Total Clicks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {reportData.totals.clicks.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Total Engagements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {reportData.totals.engagements.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Total Reach
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {reportData.totals.reach.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">
                            Total Spend
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            IDR {reportData.totals.spend.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Campaign:</strong> {reportData.campaign.name}
                      </p>
                      <p className="text-sm">
                        <strong>Brand:</strong> {reportData.campaign.brand?.name}
                      </p>
                      <p className="text-sm">
                        <strong>Period:</strong> {new Date(reportData.dateRange.start).toLocaleDateString()} - {new Date(reportData.dateRange.end).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <strong>Data Points:</strong> {reportData.metrics?.length || 0} entries
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => handleExport("csv")} disabled={!selectedCampaign}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => handleExport("pdf")} disabled={!selectedCampaign}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Report */}
          <TabsContent value="brand" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Brand Performance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Brand</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBrand && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Brand Overview</h3>
                    <p className="text-muted-foreground">
                      All campaigns and aggregated metrics for the selected brand will appear here.
                    </p>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Brand:</strong> {brands?.find(b => b.id === selectedBrand)?.name}
                      </p>
                      <p className="text-sm">
                        <strong>Total Campaigns:</strong> {campaigns?.filter(c => c.brand_id === selectedBrand).length || 0}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => handleExport("csv")} disabled={!selectedBrand}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => handleExport("pdf")} disabled={!selectedBrand}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channel Report */}
          <TabsContent value="channel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Channel Performance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Cross-campaign channel analysis showing performance metrics across all channels.
                </p>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    This report will show aggregated metrics for each channel across all campaigns,
                    allowing you to compare channel effectiveness and ROI.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => handleExport("csv")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => handleExport("pdf")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
