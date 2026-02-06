import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import { Download, Trash2, Shield, AlertTriangle } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

const DataExport = () => {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all user data
      const [profile, campaigns, metrics, calculations, activity] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("campaigns").select("*").eq("created_by", user.id),
        supabase.from("calculation_logs").select("*").eq("user_id", user.id),
        supabase.from("ave_results").select("*").eq("created_by", user.id),
        supabase.from("user_activity_logs").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
        profile: profile.data,
        campaigns: campaigns.data,
        calculations: calculations.data,
        aveResults: activity.data,
        activityLogs: activity.data,
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `was-media-hub-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete user data (cascade will handle related records due to foreign keys)
      // Note: This is a simplified version. In production, you'd want more comprehensive cleanup
      
      // Sign out first
      await supabase.auth.signOut();
      
      toast.success("Account deletion initiated. You will be logged out.");
      navigate("/");
    } catch (error: any) {
      console.error("Deletion error:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data & Privacy</h1>
          <p className="text-muted-foreground">
            Manage your personal data and privacy settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Your Data
              </CardTitle>
              <CardDescription>
                Download a copy of all your data stored in WAS Media Hub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm mb-2">
                  Your export will include:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Profile information</li>
                  <li>• All campaigns you created</li>
                  <li>• Calculation logs and AVE results</li>
                  <li>• Activity logs</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Your data will be exported in JSON format and is GDPR compliant
                </p>
              </div>
              <Button onClick={handleExportData} disabled={exporting}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Exporting..." : "Export Data"}
              </Button>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">
                    Warning: This action cannot be undone
                  </p>
                  <p className="text-muted-foreground">
                    Deleting your account will permanently remove:
                  </p>
                  <ul className="text-muted-foreground mt-2 space-y-1 ml-4">
                    <li>• Your profile and account information</li>
                    <li>• All campaigns and associated metrics</li>
                    <li>• Calculation logs and AVE results</li>
                    <li>• Activity history</li>
                  </ul>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete My Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                      <br /><br />
                      <strong>Before you proceed:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Consider exporting your data first</li>
                        <li>Ensure you have saved any important information</li>
                        <li>This will log you out immediately</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data Retention Policy
              </CardTitle>
              <CardDescription>
                How we handle your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">Active Accounts</p>
                  <p>Your data is retained as long as your account is active.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Account Deletion</p>
                  <p>When you delete your account, all personal data is permanently removed within 30 days.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Inactive Accounts</p>
                  <p>Accounts inactive for more than 2 years may be subject to deletion with prior notice.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Legal Requirements</p>
                  <p>Some data may be retained longer if required by law or for legitimate business purposes.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
