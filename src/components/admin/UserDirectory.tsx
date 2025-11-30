import { useState } from "react";
import { useAllUsers, useJobTitles, useAssignUserJob } from "@/hooks/useUserManagement";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, UserCog, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserWithAssignment } from "@/hooks/useUserManagement";

export const UserDirectory = () => {
  const { data: users, isLoading } = useAllUsers();
  const { data: jobTitles } = useJobTitles();
  const assignUserJob = useAssignUserJob();

  const [search, setSearch] = useState("");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<UserWithAssignment | null>(null);
  const [editForm, setEditForm] = useState({
    userType: 'guest' as 'agency' | 'client' | 'guest',
    jobTitleId: '',
  });

  const departments = [...new Set(jobTitles?.map(jt => jt.department?.name).filter(Boolean))];

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterUserType === "all" || user.assignment?.userType === filterUserType;
    const matchesDept = filterDepartment === "all" || 
                        user.assignment?.jobTitle?.department?.name === filterDepartment;
    return matchesSearch && matchesType && matchesDept;
  });

  const handleEditUser = (user: UserWithAssignment) => {
    setEditingUser(user);
    setEditForm({
      userType: user.assignment?.userType || 'guest',
      jobTitleId: user.assignment?.jobTitleId || '',
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    await assignUserJob.mutateAsync({
      userId: editingUser.id,
      userType: editForm.userType,
      jobTitleId: editForm.jobTitleId || null,
    });
    
    setEditingUser(null);
  };

  const getUserTypeColor = (type?: string) => {
    switch (type) {
      case 'agency': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'client': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterUserType} onValueChange={setFilterUserType}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Job Title</TableHead>
              <TableHead className="hidden lg:table-cell">System Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profilePictureUrl || undefined} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getUserTypeColor(user.assignment?.userType)}>
                    {user.assignment?.userType || 'guest'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.assignment?.jobTitle?.department?.name || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.assignment?.jobTitle?.name || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {user.role ? (
                    <Badge variant="outline">{user.role}</Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your criteria
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Assignment</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={editingUser.profilePictureUrl || undefined} />
                  <AvatarFallback>
                    {editingUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{editingUser.name}</div>
                  <div className="text-sm text-muted-foreground">{editingUser.email}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <Select 
                    value={editForm.userType} 
                    onValueChange={(v: 'agency' | 'client' | 'guest') => setEditForm(prev => ({ ...prev, userType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency">Agency Employee</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editForm.userType === 'agency' && (
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Select 
                      value={editForm.jobTitleId || "none"} 
                      onValueChange={(v) => setEditForm(prev => ({ ...prev, jobTitleId: v === "none" ? "" : v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No job title</SelectItem>
                        {jobTitles?.map((jt) => (
                          <SelectItem key={jt.id} value={jt.id}>
                            <span className="flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {jt.department?.name} - {jt.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUser}
              disabled={assignUserJob.isPending}
            >
              {assignUserJob.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
