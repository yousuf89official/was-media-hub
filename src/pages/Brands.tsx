import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutDashboard, Package, Calendar, ExternalLink } from "lucide-react";
import { useBrands, useCreateBrand } from "@/hooks/useBrands";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Brands = () => {
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [brandName, setBrandName] = useState("");

  // Fetch campaign counts for each brand
  const { data: campaignCounts } = useQuery({
    queryKey: ["campaign-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("brand_id");
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((c) => {
        counts[c.brand_id] = (counts[c.brand_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch product counts for each brand
  const { data: productCounts } = useQuery({
    queryKey: ["product-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("brand_id");
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        counts[p.brand_id] = (counts[p.brand_id] || 0) + 1;
      });
      return counts;
    },
  });

  const handleCreate = async () => {
    if (!brandName.trim()) return;
    await createBrand.mutateAsync({ name: brandName });
    setBrandName("");
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Brands</h1>
            <p className="text-muted-foreground">Manage your brand portfolios and view performance dashboards</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Brand</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input
                    id="brand-name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
                <Button onClick={handleCreate} disabled={createBrand.isPending}>
                  {createBrand.isPending ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands?.map((brand) => (
            <Card key={brand.id} className="group hover:shadow-lg transition-all hover:border-primary/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{brand.name}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(brand.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{campaignCounts?.[brand.id] || 0}</p>
                    <p className="text-xs text-muted-foreground">Campaigns</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{productCounts?.[brand.id] || 0}</p>
                    <p className="text-xs text-muted-foreground">Product Lines</p>
                  </div>
                </div>

                {/* Categories & Markets */}
                {(brand.categories?.length > 0 || brand.markets?.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {brand.categories?.slice(0, 3).map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                    ))}
                    {brand.markets?.slice(0, 2).map((market: string) => (
                      <Badge key={market} variant="outline" className="text-xs">{market}</Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/brands/${brand.id}/dashboard`}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/campaigns/new?brandId=${brand.id}`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {brands?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No brands yet</h3>
              <p className="text-muted-foreground mb-4">Create your first brand to start tracking campaigns</p>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first brand
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Brands;
