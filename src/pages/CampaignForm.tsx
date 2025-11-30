import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCampaign, useCreateCampaign } from "@/hooks/useCampaigns";
import { useUpdateCampaign } from "@/hooks/useUpdateCampaign";
import { useBrands } from "@/hooks/useBrands";
import { useProducts, useCreateProduct } from "@/hooks/useProducts";
import { useChannels } from "@/hooks/useChannels";
import { useCampaignChannelConfigs } from "@/hooks/useCampaignChannelConfigs";
import { ChannelBudgetSelector, type ChannelBudget } from "@/components/brand-dashboard/ChannelBudgetSelector";
import { ArrowLeft, Plus, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";


const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  brand_id: z.string().min(1, "Brand is required"),
  product_id: z.string().optional(),
  funnel_type: z.enum(["TOP", "MID", "BOTTOM"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "running", "finished"]),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const CampaignForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [selectedChannels, setSelectedChannels] = useState<ChannelBudget[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");

  const { data: campaign, isLoading: loadingCampaign } = useCampaign(id || "");
  const { data: existingChannelConfigs, isLoading: loadingConfigs } = useCampaignChannelConfigs(id);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const { data: brands } = useBrands();
  const { data: channels } = useChannels();
  const createProduct = useCreateProduct();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      brand_id: "",
      product_id: "",
      funnel_type: "TOP",
      start_date: "",
      end_date: "",
      status: "draft",
    },
  });

  const brandId = form.watch("brand_id");
  const { data: products, refetch: refetchProducts } = useProducts(brandId);

  // Load existing campaign data for edit mode
  useEffect(() => {
    if (campaign && isEdit) {
      form.reset({
        name: campaign.name,
        brand_id: campaign.brand_id,
        product_id: campaign.product_id || "",
        funnel_type: campaign.funnel_type,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: campaign.status,
      });
    }
  }, [campaign, isEdit, form]);

  // Load existing channel configurations from campaign_channel_configs
  useEffect(() => {
    if (existingChannelConfigs && existingChannelConfigs.length > 0 && isEdit) {
      setSelectedChannels(
        existingChannelConfigs.map((config) => ({
          channel_id: config.channel_id,
          budget: config.budget || 0,
        }))
      );
    } else if (campaign && isEdit && !loadingConfigs) {
      // Fallback to campaign.channel_ids if no configs exist
      if (campaign.channel_ids && campaign.channel_ids.length > 0) {
        setSelectedChannels(
          campaign.channel_ids.map((ch_id: string) => ({
            channel_id: ch_id,
            budget: 0,
          }))
        );
      } else if (campaign.channel_id) {
        setSelectedChannels([{ channel_id: campaign.channel_id, budget: 0 }]);
      }
    }
  }, [existingChannelConfigs, campaign, isEdit, loadingConfigs]);

  const handleCreateProduct = async () => {
    if (!newProductName.trim() || !brandId) return;

    try {
      await createProduct.mutateAsync({
        name: newProductName.trim(),
        brand_id: brandId,
        category: newProductCategory.trim() || undefined,
      });
      setShowProductDialog(false);
      setNewProductName("");
      setNewProductCategory("");
      refetchProducts();
      toast.success("Product created successfully");
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (selectedChannels.length === 0) {
      toast.error("Please select at least one channel");
      return;
    }

    const hasZeroBudget = selectedChannels.some((c) => c.budget <= 0);
    if (hasZeroBudget) {
      toast.error("Please set a budget for all selected channels");
      return;
    }

    // Use first channel as primary channel_id for backward compatibility
    const primaryChannelId = selectedChannels[0].channel_id;
    const channelIds = selectedChannels.map((c) => c.channel_id);

    const payload = {
      ...data,
      channel_id: primaryChannelId,
      channel_ids: channelIds,
      product_id: data.product_id || null,
      objective_id: null,
      buying_model_id: null,
      primary_kpi: null,
      secondary_kpi: null,
    };

    try {
      if (isEdit) {
        await updateCampaign.mutateAsync({ 
          id, 
          ...payload,
          channelBudgets: selectedChannels,
        });
      } else {
        await createCampaign.mutateAsync({
          ...payload,
          channelBudgets: selectedChannels,
        });
      }
      // Navigate back to brand dashboard
      navigate(`/brands/${data.brand_id}/dashboard`);
    } catch (error) {
      toast.error("Failed to save campaign");
    }
  };

  if (isEdit && (loadingCampaign || loadingConfigs)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasNoProducts = brandId && products && products.length === 0;

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
            <CardDescription>
              {isEdit 
                ? "Update campaign details. Additional settings can be configured in the Data Sources tab."
                : "Set up basic campaign details. You can complete additional setup in the Data Sources tab after creation."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands?.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product (Optional)</FormLabel>
                        <div className="flex gap-2">
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            disabled={!brandId}
                          >
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder={hasNoProducts ? "No products available" : "Select product"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {brandId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowProductDialog(true)}
                              title="Add new product"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {hasNoProducts && (
                          <p className="text-sm text-muted-foreground">
                            No products for this brand. Click + to create one.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Channels & Budget</FormLabel>
                <ChannelBudgetSelector
                    channels={channels || []}
                    selectedChannels={selectedChannels}
                    onSelectionChange={setSelectedChannels}
                  />
                  {selectedChannels.length === 0 && (
                    <p className="text-sm text-destructive">
                      At least one channel is required
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="funnel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funnel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select funnel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TOP">Top (Awareness)</SelectItem>
                          <SelectItem value="MID">Mid (Consideration)</SelectItem>
                          <SelectItem value="BOTTOM">Bottom (Conversion)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Campaign will be created as <strong>Draft</strong>. Complete objectives, buying models, KPIs, and ad setup in the Data Sources tab to set it Live.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCampaign.isPending || updateCampaign.isPending || selectedChannels.length === 0}
                  >
                    {isEdit ? "Update Campaign" : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Inline Product Creation Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="Enter product name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category (Optional)</Label>
              <Input
                id="product-category"
                placeholder="e.g., Electronics, Beauty"
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProduct}
              disabled={!newProductName.trim() || createProduct.isPending}
            >
              {createProduct.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignForm;
