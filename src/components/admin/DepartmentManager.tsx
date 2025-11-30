import { useDepartments, useJobTitles } from "@/hooks/useUserManagement";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Briefcase } from "lucide-react";

export const DepartmentManager = () => {
  const { data: departments, isLoading: deptsLoading } = useDepartments();
  const { data: jobTitles, isLoading: jobsLoading } = useJobTitles();

  if (deptsLoading || jobsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Group job titles by department
  const jobsByDept = jobTitles?.reduce((acc, jt) => {
    if (!acc[jt.departmentId]) acc[jt.departmentId] = [];
    acc[jt.departmentId].push(jt);
    return acc;
  }, {} as Record<string, typeof jobTitles>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Building2 className="h-4 w-4" />
        <span>{departments?.length || 0} Departments</span>
        <span className="mx-2">•</span>
        <Briefcase className="h-4 w-4" />
        <span>{jobTitles?.length || 0} Job Titles</span>
      </div>

      <Accordion type="multiple" className="w-full">
        {departments?.map((dept) => {
          const deptJobs = jobsByDept?.[dept.id] || [];
          
          return (
            <AccordionItem key={dept.id} value={dept.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {deptJobs.length} position{deptJobs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-14 space-y-3 pt-2">
                  {dept.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {dept.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {deptJobs
                      .sort((a, b) => b.seniorityLevel - a.seniorityLevel)
                      .map((job) => (
                        <div 
                          key={job.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{job.name}</div>
                              {job.description && (
                                <div className="text-xs text-muted-foreground">
                                  {job.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Level {job.seniorityLevel}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>

                  {deptJobs.length === 0 && (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No job titles in this department
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
