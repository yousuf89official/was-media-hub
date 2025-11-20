import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrands } from "@/hooks/useBrands";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useChannels, useCPMRates, useMultipliers } from "@/hooks/useChannels";
import { useMediaOutlets } from "@/hooks/useMediaOutlets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Calculator, Download, Edit2, Save, X } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AVEResultsPDF } from '@/components/pdf/AVEResultsPDF';

interface PROutletDetail {
  name: string;
  tier: number;
  average_page_views: number;
  ecpm: number;
  publicationCount: number;
  ave: number;
}

interface BreakdownItem {
  channel: string;
  isPR: boolean;
  finalAVE: number;
  outlets?: PROutletDetail[];
  formula?: string;
  impressions?: number;
  cpm?: number;
  baseAVE?: number;
  platformMult?: number;
  engagementMult?: number;
  sentimentMult?: number;
}

const AVECalculator = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [impressionsData, setImpressionsData] = useState<Record<string, number>>({});
  const [includePlatform, setIncludePlatform] = useState(false);
  const [includeEngagement, setIncludeEngagement] = useState(false);
  const [includeSentiment, setIncludeSentiment] = useState(false);
  const [engagementLevel, setEngagementLevel] = useState<string>("");
  const [sentimentType, setSentimentType] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [finalAVE, setFinalAVE] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [editingCpm, setEditingCpm] = useState<string | null>(null);
  const [editCpmValue, setEditCpmValue] = useState<string>("");
  const [selectedMediaOutlets, setSelectedMediaOutlets] = useState<Record<string, string[]>>({});
  const [publicationCounts, setPublicationCounts] = useState<Record<string, number>>({});
  const [calculationDate, setCalculationDate] = useState<string>("");

  const { data: brands } = useBrands();
  const { data: campaigns } = useCampaigns();
  const { data: channels, isLoading: isLoadingChannels } = useChannels();
  const { data: cpmRates, isLoading: isLoadingCpm, refetch: refetchCpm } = useCPMRates();
  const { data: multipliers } = useMultipliers();
  const { data: userRole } = useUserRole();
  const { data: mediaOutlets, isLoading: isLoadingMediaOutlets } = useMediaOutlets();

  const filteredCampaigns = campaigns?.filter((c) => 
    (!selectedBrand || c.brand_id === selectedBrand) && c.status === "finished"
  );

  const loadImpressions = async (channelId: string) => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign first");
      return;
    }
    
    const { data, error } = await supabase
      .from("metrics")
      .select("impressions")
      .eq("campaign_id", selectedCampaign)
      .eq("channel_id", channelId);

    if (error) {
      toast.error("Failed to load impressions");
      return;
    }

    if (data && data.length > 0) {
      const total = data.reduce((sum, m) => sum + (m.impressions || 0), 0);
      setImpressionsData((prev) => ({ ...prev, [channelId]: total }));
      toast.success(`Loaded ${total.toLocaleString()} impressions`);
    } else {
      toast.info("No metrics found for this channel");
    }
  };

  const handleUpdateCpm = async (channelId: string) => {
    const { error } = await supabase
      .from("cpm_rates")
      .update({ cpm_value: parseFloat(editCpmValue) })
      .eq("channel_id", channelId)
      .is("effective_to", null);

    if (error) {
      toast.error("Failed to update CPM rate");
    } else {
      toast.success("CPM rate updated successfully");
      setEditingCpm(null);
      refetchCpm();
    }
  };

  const calculateAVE = async () => {
    if (selectedChannels.length === 0) {
      toast.error("Please select at least one channel");
      return;
    }

    // Validate that media outlets data is loaded if Media Relations is selected
    const hasMediaRelations = selectedChannels.some(channelId => {
      const channel = channels?.find(c => c.id === channelId);
      return channel?.name === "Media Relations";
    });

    if (hasMediaRelations && !mediaOutlets) {
      toast.error("Media outlets data is still loading. Please wait...");
      return;
    }

    if (hasMediaRelations) {
      const mediaRelationsChannel = channels?.find(c => c.name === "Media Relations");
      const selectedOutlets = selectedMediaOutlets[mediaRelationsChannel?.id || ""] || [];
      
      if (selectedOutlets.length === 0) {
        toast.error("Please select at least one media outlet for Media Relations");
        return;
      }
    }

    if (!cpmRates || !multipliers) {
      toast.error("Loading multipliers data...");
      return;
    }

    // Check Media Relations channels
    const mediaRelationsChannel = channels?.find(c => c.name === "Media Relations");
    const isMediaRelationsSelected = selectedChannels.includes(mediaRelationsChannel?.id || "");
    
    // Check if Media Relations channels have media outlets selected
    if (isMediaRelationsSelected && mediaRelationsChannel) {
      const selectedOutlets = selectedMediaOutlets[mediaRelationsChannel.id] || [];
      if (selectedOutlets.length === 0) {
        toast.error("Please select at least one media outlet for Media Relations");
        return;
      }
    }

    // Check if non-PR channels have impressions
    const nonPRChannels = selectedChannels.filter(id => {
      const channel = channels?.find(c => c.id === id);
      return channel?.name !== "Media Relations";
    });
    
    const missingImpressions = nonPRChannels.filter(id => !impressionsData[id] || impressionsData[id] === 0);
    if (missingImpressions.length > 0) {
      toast.error("Please enter impressions for all selected social channels");
      return;
    }

    // Set calculation date
    setCalculationDate(new Date().toISOString());

    const channelBreakdown: BreakdownItem[] = [];
    let totalAVE = 0;

    for (const channelId of selectedChannels) {
      const channel = channels?.find(c => c.id === channelId);
      
      if (channel?.name === "Media Relations") {
        // ===== NEW PR CALCULATION =====
        const selectedOutletIds = selectedMediaOutlets[channelId] || [];
        let prAVE = 0;
        const outletDetails: PROutletDetail[] = [];
        
        for (const outletId of selectedOutletIds) {
          const outlet = mediaOutlets?.find(o => o.id === outletId);
          
          // DEBUG: Log outlet data
          console.log('Processing outlet:', {
            outletId,
            found: !!outlet,
            hasPageViews: outlet?.average_page_views_per_article !== undefined,
            hasECPM: outlet?.ecpm !== undefined,
            outlet
          });
          
          if (outlet) {
            // Validate required properties
            if (!outlet.average_page_views_per_article || !outlet.ecpm) {
              console.warn(`Media outlet ${outlet.name} is missing required data`, outlet);
              toast.error(`Media outlet "${outlet.name}" has incomplete data. Please update it in Media Outlets Management.`);
              continue; // Skip this outlet
            }
            
            const publicationCount = publicationCounts[outletId] || 1;
            // New formula: (Average Page Views × eCPM) × Publication Count
            const outletAVE = (outlet.average_page_views_per_article * outlet.ecpm) * publicationCount;
            prAVE += outletAVE;
            
            outletDetails.push({
              name: outlet.name || "Unknown Outlet",
              tier: outlet.tier || 0,
              average_page_views: outlet.average_page_views_per_article || 0,
              ecpm: outlet.ecpm || 0,
              publicationCount: publicationCount || 1,
              ave: outletAVE || 0
            });
          }
        }
        
        channelBreakdown.push({
          channel: "Media Relations",
          isPR: true,
          baseAVE: prAVE,
          platformMult: 1,
          engagementMult: 1,
          sentimentMult: 1,
          finalAVE: prAVE,
          outlets: outletDetails,
          formula: "(Avg Page Views × eCPM) × Publication Count"
        });
        
        totalAVE += prAVE;
      } else {
        // ===== SOCIAL CHANNEL CALCULATION =====
        const impressions = impressionsData[channelId] || 0;
        const cpm = cpmRates.find((r) => r.channel_id === channelId)?.cpm_value || 0;
        const baseAVE = (impressions / 1000) * Number(cpm);

        let platformMult = 1;
        let engagementMult = 1;
        let sentimentMult = 1;

        if (includePlatform) {
          const platMult = multipliers.platform.find((m) => m.channel_id === channelId);
          platformMult = platMult ? Number(platMult.multiplier) : 1;
        }

        if (includeEngagement && engagementLevel) {
          const engMult = multipliers.engagement.find((m) => m.level === engagementLevel);
          engagementMult = engMult ? Number(engMult.multiplier) : 1;
        }

        if (includeSentiment && sentimentType) {
          const sentMult = multipliers.sentiment.find((m) => m.sentiment === sentimentType);
          sentimentMult = sentMult ? Number(sentMult.multiplier) : 1;
        }

        const channelAVE = baseAVE * platformMult * engagementMult * sentimentMult;
        totalAVE += channelAVE;

        channelBreakdown.push({
          channel: channel?.name,
          isPR: false,
          impressions,
          cpm: Number(cpm),
          baseAVE,
          platformMult,
          engagementMult,
          sentimentMult,
          finalAVE: channelAVE,
        });
      }
    }

    setFinalAVE(totalAVE);
    setBreakdown(channelBreakdown);
    setShowResults(true);

    // Save to ave_results if campaign is selected
    if (selectedCampaign) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ave_results").insert([{
            campaign_id: selectedCampaign,
            channels_used: selectedChannels,
            base_ave_per_channel: channelBreakdown as any,
            weighted_components: {
              platform: includePlatform,
              engagement: includeEngagement ? engagementLevel : null,
              sentiment: includeSentiment ? sentimentType : null,
            },
            final_ave: totalAVE,
            created_by: user.id,
          }]);
        }
      } catch (error: any) {
        console.error("Failed to save AVE result:", error);
      }
    }

    toast.success("AVE calculated successfully!");
  };

  const resetCalculator = () => {
    setShowResults(false);
    setSelectedChannels([]);
    setImpressionsData({});
    setSelectedMediaOutlets({});
    setPublicationCounts({});
    setIncludePlatform(false);
    setIncludeEngagement(false);
    setIncludeSentiment(false);
    setEngagementLevel("");
    setSentimentType("");
    setCalculationDate("");
  };

  // Group media outlets by tier
  const groupedMediaOutlets = mediaOutlets?.reduce((acc, outlet) => {
    const tier = outlet.tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(outlet);
    return acc;
  }, {} as Record<number, typeof mediaOutlets>);

  if (showResults) {
    return (
      <div className="bg-background min-h-full">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">AVE Results</h1>
            <div className="flex gap-2">
              <PDFDownloadLink
                document={
                  <AVEResultsPDF
                    finalAVE={finalAVE}
                    breakdown={breakdown}
                    brandName={brands?.find(b => b.id === selectedBrand)?.name}
                    campaignName={campaigns?.find(c => c.id === selectedCampaign)?.name}
                    calculationDate={calculationDate}
                  />
                }
                fileName={`AVE-Report-${new Date().toISOString().split('T')[0]}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Generating PDF...' : 'Export as PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
              
              <Button variant="outline" onClick={resetCalculator}>
                New Calculation
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-2xl">Total AVE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">
                  IDR {finalAVE.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Breakdown</CardTitle>
                <CardDescription>Detailed calculation for each channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {breakdown.map((item, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold text-lg mb-3">{item.channel}</h3>
                      
                      {item.isPR ? (
                        // PR Channel Display
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            <strong>Formula:</strong> {item.formula}
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Selected Media Outlets:</p>
                            {item.outlets.map((outlet: any, outletIdx: number) => (
                              <div key={outletIdx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <div>
                                  <p className="font-medium">{outlet.name} (Tier {outlet.tier})</p>
                          <p className="text-xs text-muted-foreground">
                            {(outlet.average_page_views || 0).toLocaleString()} page views × IDR {(outlet.ecpm || 0).toLocaleString()} eCPM × {outlet.publicationCount || 1} publication{(outlet.publicationCount || 1) > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            IDR {(outlet.ave || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-semibold">Total PR AVE:</span>
                            <span className="text-xl font-bold text-primary">
                              IDR {item.finalAVE.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Social Channel Display
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Impressions:</span>
                            <span className="font-medium">{item.impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">CPM:</span>
                            <span className="font-medium">IDR {item.cpm.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base AVE:</span>
                            <span className="font-medium">IDR {item.baseAVE.toLocaleString()}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Platform Multiplier:</span>
                            <span className="font-medium">{item.platformMult}x</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Engagement Multiplier:</span>
                            <span className="font-medium">{item.engagementMult}x</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sentiment Multiplier:</span>
                            <span className="font-medium">{item.sentimentMult}x</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center pt-1">
                            <span className="font-semibold">Channel AVE:</span>
                            <span className="text-xl font-bold text-primary">
                              IDR {item.finalAVE.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8" />
        <h1 className="text-3xl font-bold">AVE Calculator</h1>
      </div>

      {/* Campaign Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Selection (Optional)</CardTitle>
          <CardDescription>
            Select a campaign to auto-load metrics or calculate manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
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
            <div>
              <Label htmlFor="campaign">Campaign</Label>
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
                disabled={!selectedBrand}
              >
                <SelectTrigger id="campaign">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCampaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Selection</CardTitle>
          <CardDescription>Select channels to include in AVE calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {channels?.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-2">
                <Checkbox
                  id={channel.id}
                  checked={selectedChannels.includes(channel.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedChannels([...selectedChannels, channel.id]);
                    } else {
                      setSelectedChannels(selectedChannels.filter((id) => id !== channel.id));
                      if (channel.name === "Media Relations") {
                        setSelectedMediaOutlets({});
                        setPublicationCounts({});
                      }
                    }
                  }}
                />
                <Label htmlFor={channel.id} className="cursor-pointer">
                  {channel.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impressions Input for Social Channels */}
      {selectedChannels.some(id => {
        const channel = channels?.find(c => c.id === id);
        return channel?.name !== "Media Relations";
      }) && (
        <Card>
          <CardHeader>
            <CardTitle>Impressions Input</CardTitle>
            <CardDescription>Enter impressions for each social channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedChannels.map((channelId) => {
              const channel = channels?.find((c) => c.id === channelId);
              if (channel?.name === "Media Relations") return null;

              const cpm = cpmRates?.find((r) => r.channel_id === channelId);
              return (
                <div key={channelId} className="space-y-2">
                  <Label>{channel?.name}</Label>
                  <div className="flex items-center gap-2 mb-2">
                    {editingCpm === channelId ? (
                      <>
                        <Input
                          type="number"
                          value={editCpmValue}
                          onChange={(e) => setEditCpmValue(e.target.value)}
                          className="w-24 h-8"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateCpm(channelId)}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCpm(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground">
                          CPM: IDR {cpm?.cpm_value.toLocaleString() || 0}
                        </span>
                        {userRole === "MasterAdmin" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCpm(channelId);
                              setEditCpmValue(cpm?.cpm_value.toString() || "0");
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter impressions"
                      value={impressionsData[channelId] || ""}
                      onChange={(e) =>
                        setImpressionsData((prev) => ({
                          ...prev,
                          [channelId]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="flex-1"
                    />
                    {selectedCampaign && (
                      <Button
                        variant="outline"
                        onClick={() => loadImpressions(channelId)}
                        size="sm"
                      >
                        Load from DB
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Media Relations Outlets Selection */}
      {selectedChannels.some(id => channels?.find(c => c.id === id)?.name === "Media Relations") && mediaOutlets && (
        <Card>
          <CardHeader>
            <CardTitle>Media Relations - Select Media Outlets</CardTitle>
            <CardDescription>
              Choose media outlets for PR Value calculation. Grouped by tier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupedMediaOutlets && Object.keys(groupedMediaOutlets).length > 0 && (
              <div className="space-y-4">
                {Object.entries(groupedMediaOutlets)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([tier, outlets]) => (
                    <div key={tier} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Tier {tier}</h3>
                      <div className="space-y-3">
                        {outlets?.map((outlet) => {
                          const mediaRelationsChannel = channels?.find(c => c.name === "Media Relations");
                          const isSelected = selectedMediaOutlets[mediaRelationsChannel?.id || ""]?.includes(outlet.id) || false;
                          const estimatedAVE = outlet.average_page_views_per_article * outlet.ecpm;
                          
                          return (
                            <div key={outlet.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                              <Checkbox
                                id={outlet.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const channelId = mediaRelationsChannel?.id || "";
                                  if (checked) {
                                    setSelectedMediaOutlets((prev) => ({
                                      ...prev,
                                      [channelId]: [...(prev[channelId] || []), outlet.id],
                                    }));
                                    setPublicationCounts((prev) => ({
                                      ...prev,
                                      [outlet.id]: 1,
                                    }));
                                  } else {
                                    setSelectedMediaOutlets((prev) => ({
                                      ...prev,
                                      [channelId]: (prev[channelId] || []).filter(id => id !== outlet.id),
                                    }));
                                    setPublicationCounts((prev) => {
                                      const newCounts = { ...prev };
                                      delete newCounts[outlet.id];
                                      return newCounts;
                                    });
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <Label htmlFor={outlet.id} className="cursor-pointer font-medium">
                                  {outlet.name}
                                </Label>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {outlet.average_page_views_per_article.toLocaleString()} page views × IDR {outlet.ecpm.toLocaleString()} eCPM = 
                                  <span className="font-semibold text-foreground"> IDR {estimatedAVE.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span> per article
                                </div>
                                {isSelected && (
                                  <div className="mt-2">
                                    <Label htmlFor={`pub-${outlet.id}`} className="text-xs">Number of Publications</Label>
                                    <Input
                                      id={`pub-${outlet.id}`}
                                      type="number"
                                      min="1"
                                      value={publicationCounts[outlet.id] || 1}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        setPublicationCounts((prev) => ({
                                          ...prev,
                                          [outlet.id]: value,
                                        }));
                                      }}
                                      className="w-24 h-8 mt-1"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Multiplier Options */}
      {selectedChannels.some(id => channels?.find(c => c.id === id)?.name !== "Media Relations") && (
        <Card>
          <CardHeader>
            <CardTitle>Multiplier Options (Social Channels Only)</CardTitle>
            <CardDescription>Apply optional multipliers to social channel calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="platform"
                checked={includePlatform}
                onCheckedChange={(checked) => setIncludePlatform(!!checked)}
              />
              <Label htmlFor="platform">Include Platform Multiplier</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="engagement"
                  checked={includeEngagement}
                  onCheckedChange={(checked) => setIncludeEngagement(!!checked)}
                />
                <Label htmlFor="engagement">Include Engagement Multiplier</Label>
              </div>
              {includeEngagement && (
                <Select value={engagementLevel} onValueChange={setEngagementLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement level" />
                  </SelectTrigger>
                  <SelectContent>
                    {multipliers?.engagement.map((m) => (
                      <SelectItem key={m.id} value={m.level}>
                        {m.level.charAt(0).toUpperCase() + m.level.slice(1)} ({m.multiplier}x)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sentiment"
                  checked={includeSentiment}
                  onCheckedChange={(checked) => setIncludeSentiment(!!checked)}
                />
                <Label htmlFor="sentiment">Include Sentiment Multiplier</Label>
              </div>
              {includeSentiment && (
                <Select value={sentimentType} onValueChange={setSentimentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sentiment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {multipliers?.sentiment.map((m) => (
                      <SelectItem key={m.id} value={m.sentiment}>
                        {m.sentiment.charAt(0).toUpperCase() + m.sentiment.slice(1)} ({m.multiplier}x)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={calculateAVE} 
        size="lg" 
        className="w-full"
        disabled={isLoadingMediaOutlets || isLoadingChannels || isLoadingCpm}
      >
        <Calculator className="h-5 w-5 mr-2" />
        {isLoadingMediaOutlets || isLoadingChannels || isLoadingCpm 
          ? "Loading data..." 
          : "Calculate AVE"}
      </Button>
    </div>
  );
};

export default AVECalculator;
