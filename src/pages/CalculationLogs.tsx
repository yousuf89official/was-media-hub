import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserRole } from "@/hooks/useUserRole";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function CalculationLogs() {
  const { data: userRole } = useUserRole();
  const [selectedUser, setSelectedUser] = useState<string>("me");

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email");
      if (error) throw error;
      return data;
    },
    enabled: userRole === "MasterAdmin",
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ["calculation-logs", selectedUser],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("calculation_logs")
        .select(`
          *,
          brands(name),
          campaigns(name)
        `)
        .order("created_at", { ascending: false });

      // If not MasterAdmin or if "me" is selected, filter by current user
      if (userRole !== "MasterAdmin" || selectedUser === "me") {
        query = query.eq("user_id", user.id);
      } else if (selectedUser !== "all") {
        query = query.eq("user_id", selectedUser);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calculation Logs</h1>
          <p className="text-muted-foreground">View history of AVE calculations</p>
        </div>

        {userRole === "MasterAdmin" && (
          <div className="w-64">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">My Calculations</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculation History</CardTitle>
          <CardDescription>
            {selectedUser === "all" ? "All calculations" : selectedUser === "me" ? "Your calculations" : "User calculations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead className="text-right">Final AVE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const inputs = log.inputs as any;
                  const results = log.results as any;
                  const channels = inputs?.channels || [];
                  const finalAve = results?.final_ave || 0;
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.calculation_type}</Badge>
                      </TableCell>
                      <TableCell>{log.brands?.name || "Manual"}</TableCell>
                      <TableCell>{log.campaigns?.name || "Manual"}</TableCell>
                      <TableCell>{channels.length} channels</TableCell>
                      <TableCell className="text-right font-semibold">
                        IDR {finalAve.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No calculations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
