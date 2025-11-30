import { useState } from "react";
import { useJobTitles, useFeatures, useFeaturePermissions, useUpdateFeaturePermission } from "@/hooks/useUserManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Eye, Plus, Edit, Trash2, Download } from "lucide-react";

export const PermissionMatrix = () => {
  const { data: jobTitles, isLoading: jobTitlesLoading } = useJobTitles();
  const { data: features, isLoading: featuresLoading } = useFeatures();
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");
  
  const { data: permissions, isLoading: permissionsLoading } = useFeaturePermissions(selectedJobTitle);
  const updatePermission = useUpdateFeaturePermission();

  // Get only parent features (menus)
  const menuFeatures = features?.filter(f => !f.parentId && f.featureType === 'menu');

  // Create permission map for quick lookup
  const permissionMap = new Map(
    permissions?.map(p => [p.featureId, p])
  );

  const handlePermissionChange = async (
    featureId: string,
    permissionType: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport',
    value: boolean
  ) => {
    if (!selectedJobTitle) return;

    const existing = permissionMap.get(featureId);
    
    await updatePermission.mutateAsync({
      jobTitleId: selectedJobTitle,
      featureId,
      permissions: {
        canView: permissionType === 'canView' ? value : (existing?.canView ?? false),
        canCreate: permissionType === 'canCreate' ? value : (existing?.canCreate ?? false),
        canEdit: permissionType === 'canEdit' ? value : (existing?.canEdit ?? false),
        canDelete: permissionType === 'canDelete' ? value : (existing?.canDelete ?? false),
        canExport: permissionType === 'canExport' ? value : (existing?.canExport ?? false),
      }
    });
  };

  if (jobTitlesLoading || featuresLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Group job titles by department
  const jobTitlesByDept = jobTitles?.reduce((acc, jt) => {
    const deptName = jt.department?.name || 'No Department';
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(jt);
    return acc;
  }, {} as Record<string, typeof jobTitles>);

  return (
    <div className="space-y-6">
      {/* Job Title Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Select Job Title:</label>
        <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Choose a job title to edit permissions" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(jobTitlesByDept || {}).map(([dept, titles]) => (
              <div key={dept}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                  {dept}
                </div>
                {titles?.map(jt => (
                  <SelectItem key={jt.id} value={jt.id}>
                    {jt.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedJobTitle && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Select a job title above to view and edit its permissions
        </div>
      )}

      {selectedJobTitle && (
        <>
          {permissionsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px]">Feature</TableHead>
                    <TableHead className="text-center w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">View</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Create</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <Edit className="h-4 w-4" />
                        <span className="text-xs">Edit</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">Delete</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span className="text-xs">Export</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuFeatures?.map((feature) => {
                    const perm = permissionMap.get(feature.id);
                    return (
                      <TableRow key={feature.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{feature.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {feature.code}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.canView ?? false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(feature.id, 'canView', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.canCreate ?? false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(feature.id, 'canCreate', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.canEdit ?? false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(feature.id, 'canEdit', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.canDelete ?? false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(feature.id, 'canDelete', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm?.canExport ?? false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(feature.id, 'canExport', checked as boolean)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
