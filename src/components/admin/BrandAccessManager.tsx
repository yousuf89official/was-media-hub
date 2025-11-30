import { useState } from "react";
import { useBrands } from "@/hooks/useBrands";
import { useAllUsers } from "@/hooks/useUserManagement";
import { useBrandAccessByBrand, useGrantBrandAccess, useRevokeBrandAccess } from "@/hooks/useBrandAccess";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Trash2, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

export const BrandAccessManager = () => {
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: users } = useAllUsers();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const { data: brandAccess, isLoading: accessLoading } = useBrandAccessByBrand(selectedBrand);
  const grantAccess = useGrantBrandAccess();
  const revokeAccess = useRevokeBrandAccess();

  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: '',
    accessLevel: 'view' as 'view' | 'edit' | 'admin',
    expiresAt: '',
  });

  // Filter to only show client users for granting access
  const clientUsers = users?.filter(u => u.assignment?.userType === 'client');

  const handleGrantAccess = async () => {
    if (!selectedBrand || !grantForm.userId) return;
    
    await grantAccess.mutateAsync({
      userId: grantForm.userId,
      brandId: selectedBrand,
      accessLevel: grantForm.accessLevel,
      expiresAt: grantForm.expiresAt || null,
    });
    
    setShowGrantDialog(false);
    setGrantForm({ userId: '', accessLevel: 'view', expiresAt: '' });
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'edit': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  if (brandsLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Brand Selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Select Brand:</label>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Choose a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands?.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBrand && (
          <Button onClick={() => setShowGrantDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Grant Access
          </Button>
        )}
      </div>

      {!selectedBrand && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Select a brand above to manage client access
        </div>
      )}

      {selectedBrand && (
        <>
          {accessLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : brandAccess && brandAccess.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Granted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandAccess.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {access.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{access.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{access.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccessLevelColor(access.accessLevel)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {access.accessLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {access.expiresAt ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(access.expiresAt), 'PP')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(access.createdAt), 'PP')}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {access.user?.name}'s access to this brand. 
                                They will no longer be able to view or interact with this brand's data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => revokeAccess.mutate(access.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              No clients have access to this brand yet. Click "Grant Access" to add users.
            </div>
          )}
        </>
      )}

      {/* Grant Access Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Brand Access</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client User</Label>
              <Select 
                value={grantForm.userId} 
                onValueChange={(v) => setGrantForm(prev => ({ ...prev, userId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client user" />
                </SelectTrigger>
                <SelectContent>
                  {clientUsers?.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientUsers?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No client users found. Users must be assigned as "Client" type first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select 
                value={grantForm.accessLevel} 
                onValueChange={(v: 'view' | 'edit' | 'admin') => setGrantForm(prev => ({ ...prev, accessLevel: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only - Can view dashboards and reports</SelectItem>
                  <SelectItem value="edit">Edit - Can modify campaign data</SelectItem>
                  <SelectItem value="admin">Admin - Full control over brand</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expires (Optional)</Label>
              <Input
                type="date"
                value={grantForm.expiresAt}
                onChange={(e) => setGrantForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGrantAccess}
              disabled={!grantForm.userId || grantAccess.isPending}
            >
              {grantAccess.isPending ? "Granting..." : "Grant Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
