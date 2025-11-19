import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrands } from "@/hooks/useBrands";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useChannels, useCPMRates, useMultipliers } from "@/hooks/useChannels";
import { useMediaOutlets } from "@/hooks/useMediaOutlets";
import { useECPMValue } from "@/hooks/usePRSettings";
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
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [editingCpm, setEditingCpm] = useState<string | null>(null);
  const [editCpmValue, setEditCpmValue] = useState<string>("");
  const [selectedMediaOutlets, setSelectedMediaOutlets] = useState<Record<string, string[]>>({});
  const [currentECPM, setCurrentECPM] = useState<number>(45000);
  const [calculationDate, setCalculationDate] = useState<string>("");

  const { data: brands } = useBrands();
  const { data: campaigns } = useCampaigns();
  const { data: channels } = useChannels();
  const { data: cpmRates, refetch: refetchCpm } = useCPMRates();
  const { data: multipliers } = useMultipliers();
  const { data: userRole } = useUserRole();
  const { data: mediaOutlets } = useMediaOutlets();
  const { data: defaultECPM } = useECPMValue();

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

    const channelBreakdown: any[] = [];
    let totalAVE = 0;

    for (const channelId of selectedChannels) {
      const channel = channels?.find(c => c.id === channelId);
      
      if (channel?.name === "Media Relations") {
        // ===== PR CALCULATION =====
        const selectedOutletIds = selectedMediaOutlets[channelId] || [];
        let prAVE = 0;
        const outletDetails: any[] = [];
        
        for (const outletId of selectedOutletIds) {
          const outlet = mediaOutlets?.find(o => o.id === outletId);
          if (outlet) {
            const outletAVE = (outlet.pr_value_per_article / 1000) * currentECPM;
            prAVE += outletAVE;
            
            outletDetails.push({
              name: outlet.name,
              tier: outlet.tier,
              pr_value: outlet.pr_value_per_article,
              ave: outletAVE
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
          ecpm: currentECPM,
          formula: "(PR Value / 1000) × eCPM"
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

    setBreakdown(channelBreakdown);
    setFinalAVE(totalAVE);
    setCalculationDate(new Date().toISOString());
    setShowResults(true);
    toast.success("AVE calculated successfully!");

    // Save calculation log to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("calculation_logs").insert({
          user_id: user.id,
          calculation_type: "AVE",
          brand_id: selectedBrand && selectedBrand !== "none" ? selectedBrand : null,
          campaign_id: selectedCampaign || null,
          inputs: {
            channels: selectedChannels,
            impressions: impressionsData,
            media_outlets: selectedMediaOutlets,
            ecpm_used: currentECPM,
            multipliers: {
              platform: includePlatform,
              engagement: includeEngagement ? engagementLevel : null,
              sentiment: includeSentiment ? sentimentType : null,
            }
          },
          results: {
            breakdown: channelBreakdown,
            final_ave: totalAVE,
          }
        });
      }
    } catch (error: any) {
      console.error("Failed to log calculation:", error);
    }

    // Save to ave_results if campaign is selected
    if (selectedCampaign) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ave_results").insert([{
            campaign_id: selectedCampaign,
            channels_used: selectedChannels,
            base_ave_per_channel: channelBreakdown,
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
  };

  const resetCalculator = () => {
    setShowResults(false);
    setSelectedChannels([]);
    setImpressionsData({});
    setSelectedMediaOutlets({});
    setCurrentECPM(defaultECPM || 45000);
    setIncludePlatform(false);
    setIncludeEngagement(false);
    setIncludeSentiment(false);
    setEngagementLevel("");
    setSentimentType("");
    setCalculationDate("");
  };

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
                          <div className="text-sm">
                            <strong>eCPM Used:</strong> IDR {item.ecpm.toLocaleString()}
                          </div>
                          
                          <div>
                            <strong className="text-sm">Selected Media Outlets:</strong>
                            <div className="mt-2 space-y-2">
                              {item.outlets.map((outlet: any, outletIdx: number) => (
                                <div key={outletIdx} className="flex justify-between text-sm p-2 bg-muted rounded">
                                  <span>
                                    {outlet.name} <span className="text-muted-foreground">(Tier {outlet.tier})</span>
                                  </span>
                                  <span className="font-medium">
                                    IDR {outlet.ave.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-between font-semibold">
                            <span>Total PR AVE:</span>
                            <span className="text-primary">
                              IDR {item.finalAVE.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Social Channel Display
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Impressions:</span>
                            <div className="font-medium">{item.impressions.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CPM:</span>
                            <div className="font-medium">IDR {item.cpm.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Base AVE:</span>
                            <div className="font-medium">IDR {item.baseAVE.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Platform Multiplier:</span>
                            <div className="font-medium">{item.platformMult}x</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Engagement Multiplier:</span>
                            <div className="font-medium">{item.engagementMult}x</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sentiment Multiplier:</span>
                            <div className="font-medium">{item.sentimentMult}x</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Channel AVE:</span>
                            <div className="font-bold text-lg text-primary">
                              IDR {item.finalAVE.toLocaleString()}
                            </div>
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
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AVE Calculator</h1>
          <p className="text-muted-foreground">
            Calculate Advertising Value Equivalence for your campaigns
          </p>
        </div>

        <div className="space-y-6">
          {/* Campaign Selection (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Selection (Optional)</CardTitle>
              <CardDescription>
                Select a brand and campaign to load metrics, or skip to enter manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={selectedBrand} onValueChange={(value) => {
                    setSelectedBrand(value);
                    setSelectedCampaign("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Manual Input)</SelectItem>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Campaign</Label>
                  <Select 
                    value={selectedCampaign} 
                    onValueChange={setSelectedCampaign}
                    disabled={!selectedBrand || selectedBrand === "none"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select finished campaign" />
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
              <CardTitle>Select Channels</CardTitle>
              <CardDescription>Choose the channels to include in the calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
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
                          const newData = { ...impressionsData };
                          delete newData[channel.id];
                          setImpressionsData(newData);
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

          {/* Impressions Input */}
          {selectedChannels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Impressions</CardTitle>
                <CardDescription>
                  Enter impressions manually or load from selected campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedChannels.map((channelId) => {
                  const channel = channels?.find((c) => c.id === channelId);
                  
                  // Skip Media Relations channel (it doesn't use impressions)
                  if (channel?.name === "Media Relations") {
                    return null;
                  }
                  
                  const cpm = cpmRates?.find((r) => r.channel_id === channelId);
                  const isEditingThisCpm = editingCpm === channelId;
                  
                  return (
                    <div key={channelId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">{channel?.name}</Label>
                        <div className="flex items-center gap-2">
                          {isEditingThisCpm ? (
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
                {/* eCPM Editor */}
                <div className="space-y-2">
                  <Label htmlFor="ecpm-input">eCPM Value (IDR)</Label>
                  <Input
                    id="ecpm-input"
                    type="number"
                    value={currentECPM}
                    onChange={(e) => setCurrentECPM(parseFloat(e.target.value) || 0)}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground">
                    Default: IDR {defaultECPM?.toLocaleString() || "45,000"}. Formula: (PR Value / 1000) × eCPM
                  </p>
                </div>

                <Separator />

                {/* Media Outlets by Tier */}
                {[1, 2, 3].map(tier => {
                  const tierOutlets = mediaOutlets.filter(o => o.tier === tier);
                  if (tierOutlets.length === 0) return null;
                  
                  const mediaRelationsChannel = channels?.find(c => c.name === "Media Relations");
                  const mrChannelId = mediaRelationsChannel?.id || "";
                  
                  return (
                    <div key={tier} className="space-y-3">
                      <h4 className="font-semibold">Tier {tier}</h4>
                      <div className="space-y-2">
                        {tierOutlets.map(outlet => (
                          <div key={outlet.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={outlet.id}
                              checked={selectedMediaOutlets[mrChannelId]?.includes(outlet.id)}
                              onCheckedChange={(checked) => {
                                setSelectedMediaOutlets(prev => {
                                  const current = prev[mrChannelId] || [];
                                  return {
                                    ...prev,
                                    [mrChannelId]: checked
                                      ? [...current, outlet.id]
                                      : current.filter(id => id !== outlet.id)
                                  };
                                });
                              }}
                            />
                            <Label htmlFor={outlet.id} className="flex-1 cursor-pointer">
                              <span className="font-medium">{outlet.name}</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                (IDR {outlet.pr_value_per_article.toLocaleString()})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Multipliers */}
          {selectedChannels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Multipliers (Optional)</CardTitle>
                <CardDescription>Apply additional multipliers to the base AVE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="platform"
                    checked={includePlatform}
                    onCheckedChange={(checked) => setIncludePlatform(checked as boolean)}
                  />
                  <Label htmlFor="platform" className="cursor-pointer">
                    Include Platform Multipliers (varies by channel)
                  </Label>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="engagement"
                      checked={includeEngagement}
                      onCheckedChange={(checked) => {
                        setIncludeEngagement(checked as boolean);
                        if (!checked) setEngagementLevel("");
                      }}
                    />
                    <Label htmlFor="engagement" className="cursor-pointer">
                      Include Engagement Multiplier
                    </Label>
                  </div>
                  {includeEngagement && (
                    <Select value={engagementLevel} onValueChange={setEngagementLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select engagement level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low (1.5x)</SelectItem>
                        <SelectItem value="Moderate">Moderate (1.8x)</SelectItem>
                        <SelectItem value="High">High (2.5x)</SelectItem>
                        <SelectItem value="Viral">Viral / Influencer (4.0x)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sentiment"
                      checked={includeSentiment}
                      onCheckedChange={(checked) => {
                        setIncludeSentiment(checked as boolean);
                        if (!checked) setSentimentType("");
                      }}
                    />
                    <Label htmlFor="sentiment" className="cursor-pointer">
                      Include Sentiment Multiplier
                    </Label>
                  </div>
                  {includeSentiment && (
                    <Select value={sentimentType} onValueChange={setSentimentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Positive">Positive (1.5x)</SelectItem>
                        <SelectItem value="Neutral">Neutral (1.0x)</SelectItem>
                        <SelectItem value="Negative">Negative (0.8x)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calculate Button */}
          {selectedChannels.length > 0 && (
            <Button
              onClick={calculateAVE}
              size="lg"
              className="w-full"
              disabled={selectedChannels.length === 0}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calculate AVE
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AVECalculator;
