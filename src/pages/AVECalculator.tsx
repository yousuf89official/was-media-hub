import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrands } from "@/hooks/useBrands";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useChannels, useCPMRates, useMultipliers } from "@/hooks/useChannels";
import { useMetrics } from "@/hooks/useMetrics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AVECalculator = () => {
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [impressionsData, setImpressionsData] = useState<Record<string, number>>({});
  const [includePlatform, setIncludePlatform] = useState(false);
  const [includeEngagement, setIncludeEngagement] = useState(false);
  const [includeSentiment, setIncludeSentiment] = useState(false);
  const [engagementLevel, setEngagementLevel] = useState<string>("");
  const [sentimentType, setSentimentType] = useState<string>("");
  const [finalAVE, setFinalAVE] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);

  const { data: brands } = useBrands();
  const { data: campaigns } = useCampaigns();
  const { data: channels } = useChannels();
  const { data: cpmRates } = useCPMRates();
  const { data: multipliers } = useMultipliers();

  const filteredCampaigns = campaigns?.filter(
    (c) => c.brand_id === selectedBrand && c.status === "finished"
  );

  const calculateAVE = async () => {
    if (!cpmRates || !multipliers) return;

    const channelBreakdown: any[] = [];
    let totalAVE = 0;

    for (const channelId of selectedChannels) {
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

      const channel = channels?.find((c) => c.id === channelId);
      channelBreakdown.push({
        channel: channel?.name,
        impressions,
        baseAVE,
        platformMult,
        engagementMult,
        sentimentMult,
        finalAVE: channelAVE,
      });
    }

    setBreakdown(channelBreakdown);
    setFinalAVE(totalAVE);

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && selectedCampaigns.length > 0) {
        await supabase.from("ave_results").insert([{
          campaign_id: selectedCampaigns[0],
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
        toast.success("AVE result saved");
      }
    } catch (error: any) {
      toast.error("Failed to save AVE result");
    }
  };

  const loadImpressions = async (channelId: string) => {
    if (selectedCampaigns.length === 0) return;
    
    const { data } = await supabase
      .from("metrics")
      .select("impressions")
      .eq("campaign_id", selectedCampaigns[0])
      .eq("channel_id", channelId);

    if (data && data.length > 0) {
      const total = data.reduce((sum, m) => sum + (m.impressions || 0), 0);
      setImpressionsData((prev) => ({ ...prev, [channelId]: total }));
      toast.success("Impressions loaded from database");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="text-2xl font-bold text-primary">AVE Calculator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Brand</CardTitle>
              <CardDescription>Choose the brand for AVE calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
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
              <Button onClick={() => setStep(2)} disabled={!selectedBrand}>
                Next
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Finished Campaigns</CardTitle>
              <CardDescription>Choose one or more finished campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredCampaigns?.map((campaign) => (
                <div key={campaign.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={campaign.id}
                    checked={selectedCampaigns.includes(campaign.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                      } else {
                        setSelectedCampaigns(selectedCampaigns.filter((id) => id !== campaign.id));
                      }
                    }}
                  />
                  <Label htmlFor={campaign.id}>{campaign.name}</Label>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={selectedCampaigns.length === 0}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select Channels</CardTitle>
              <CardDescription>Choose channels for calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      }
                    }}
                  />
                  <Label htmlFor={channel.id}>{channel.name}</Label>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={selectedChannels.length === 0}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Input Impressions</CardTitle>
              <CardDescription>Enter or load impressions for each channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedChannels.map((channelId) => {
                const channel = channels?.find((c) => c.id === channelId);
                return (
                  <div key={channelId} className="space-y-2">
                    <Label>{channel?.name}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Impressions"
                        value={impressionsData[channelId] || ""}
                        onChange={(e) =>
                          setImpressionsData((prev) => ({
                            ...prev,
                            [channelId]: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <Button variant="outline" onClick={() => loadImpressions(channelId)}>
                        Load from DB
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>Next</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Configure Multipliers</CardTitle>
              <CardDescription>Choose which multipliers to apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="platform"
                  checked={includePlatform}
                  onCheckedChange={(checked) => setIncludePlatform(checked as boolean)}
                />
                <Label htmlFor="platform">Include Platform AVE</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="engagement"
                    checked={includeEngagement}
                    onCheckedChange={(checked) => setIncludeEngagement(checked as boolean)}
                  />
                  <Label htmlFor="engagement">Include Engagement AVE</Label>
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
                      <SelectItem value="Viral">Viral (4.0x)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sentiment"
                    checked={includeSentiment}
                    onCheckedChange={(checked) => setIncludeSentiment(checked as boolean)}
                  />
                  <Label htmlFor="sentiment">Include Sentiment AVE</Label>
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

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    calculateAVE();
                    setStep(6);
                  }}
                >
                  Calculate AVE
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 6 && finalAVE !== null && (
          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-3xl">Final AVE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">
                  IDR {finalAVE.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breakdown by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {breakdown.map((item, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <h3 className="font-semibold text-lg mb-2">{item.channel}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Impressions: {item.impressions.toLocaleString()}</div>
                        <div>Base AVE: IDR {item.baseAVE.toLocaleString()}</div>
                        <div>Platform Mult: {item.platformMult}x</div>
                        <div>Engagement Mult: {item.engagementMult}x</div>
                        <div>Sentiment Mult: {item.sentimentMult}x</div>
                        <div className="font-semibold">
                          Channel AVE: IDR {item.finalAVE.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => {
              setStep(1);
              setFinalAVE(null);
              setBreakdown([]);
              setSelectedBrand("");
              setSelectedCampaigns([]);
              setSelectedChannels([]);
              setImpressionsData({});
            }}>
              Start New Calculation
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AVECalculator;
