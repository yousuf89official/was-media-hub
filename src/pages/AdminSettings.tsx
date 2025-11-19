import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChannels } from "@/hooks/useChannels";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PRSettingsEditor } from "@/components/admin/PRSettingsEditor";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { data: userRole, isLoading } = useUserRole();
  const { toast } = useToast();
  const { data: channels } = useChannels();

  useEffect(() => {
    if (!isLoading && userRole !== "MasterAdmin") {
      navigate("/dashboard");
    }
  }, [userRole, isLoading, navigate]);

  const { data: cpmRates, refetch: refetchCpm } = useQuery({
    queryKey: ["cpm-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cpm_rates")
        .select("*, channels(name)")
        .order("effective_from", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: platformMultipliers, refetch: refetchPlatform } = useQuery({
    queryKey: ["platform-multipliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_multipliers")
        .select("*, channels(name)");
      if (error) throw error;
      return data;
    },
  });

  const { data: engagementMultipliers, refetch: refetchEngagement } = useQuery({
    queryKey: ["engagement-multipliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_multipliers")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: sentimentMultipliers, refetch: refetchSentiment } = useQuery({
    queryKey: ["sentiment-multipliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sentiment_multipliers")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const [editingCpm, setEditingCpm] = useState<string | null>(null);
  const [cpmValue, setCpmValue] = useState("");

  const handleUpdateCpm = async (id: string) => {
    const { error } = await supabase
      .from("cpm_rates")
      .update({ cpm_value: parseFloat(cpmValue) })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update CPM rate", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "CPM rate updated successfully" });
      setEditingCpm(null);
      refetchCpm();
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (userRole !== "MasterAdmin") {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Manage reference data and system configurations</p>
      </div>

      <Tabs defaultValue="cpm" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="cpm">CPM Rates</TabsTrigger>
          <TabsTrigger value="platform">Platform Multipliers</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Multipliers</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Multipliers</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="pr">PR Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="cpm" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CPM Rates</CardTitle>
              <CardDescription>Manage Cost Per Mille rates for each channel</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>CPM Value</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cpmRates?.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.channels?.name}</TableCell>
                      <TableCell>
                        {editingCpm === rate.id ? (
                          <Input
                            type="number"
                            value={cpmValue}
                            onChange={(e) => setCpmValue(e.target.value)}
                            className="w-32"
                          />
                        ) : (
                          rate.cpm_value
                        )}
                      </TableCell>
                      <TableCell>{rate.currency}</TableCell>
                      <TableCell>{new Date(rate.effective_from).toLocaleDateString()}</TableCell>
                      <TableCell>{rate.effective_to ? new Date(rate.effective_to).toLocaleDateString() : "Current"}</TableCell>
                      <TableCell>
                        {editingCpm === rate.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateCpm(rate.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingCpm(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingCpm(rate.id);
                              setCpmValue(rate.cpm_value.toString());
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Multipliers</CardTitle>
              <CardDescription>Multipliers applied based on platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Multiplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformMultipliers?.map((mult) => (
                    <TableRow key={mult.id}>
                      <TableCell>{mult.channels?.name}</TableCell>
                      <TableCell>{mult.multiplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Multipliers</CardTitle>
              <CardDescription>Multipliers based on engagement levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Multiplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engagementMultipliers?.map((mult) => (
                    <TableRow key={mult.id}>
                      <TableCell className="capitalize">{mult.level}</TableCell>
                      <TableCell>{mult.multiplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Multipliers</CardTitle>
              <CardDescription>Multipliers based on sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Multiplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sentimentMultipliers?.map((mult) => (
                    <TableRow key={mult.id}>
                      <TableCell className="capitalize">{mult.sentiment}</TableCell>
                      <TableCell>{mult.multiplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Channels</CardTitle>
              <CardDescription>Available marketing channels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels?.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell>{channel.name}</TableCell>
                      <TableCell className="capitalize">{channel.channel_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pr" className="mt-6">
          <PRSettingsEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
