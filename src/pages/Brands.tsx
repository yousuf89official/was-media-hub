import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useBrands, useCreateBrand } from "@/hooks/useBrands";

const Brands = () => {
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [brandName, setBrandName] = useState("");

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
          <h1 className="text-3xl font-bold">Brands</h1>
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
            <Card key={brand.id}>
              <CardHeader>
                <CardTitle>{brand.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(brand.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {brands?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No brands found</p>
            <Button onClick={() => setIsOpen(true)}>Create your first brand</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
