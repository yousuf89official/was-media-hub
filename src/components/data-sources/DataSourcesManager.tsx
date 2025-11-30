import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database, 
  FileSpreadsheet, 
  Trash2, 
  RefreshCw, 
  Link2, 
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronRight,
  Grid3X3
} from 'lucide-react';
import { 
  useDataSources, 
  useDataSourceMappings, 
  useDeleteDataSource, 
  useDeleteMapping,
  useUpdateDataSource
} from '@/hooks/useDataSources';
import { GoogleSheetsConnector } from './GoogleSheetsConnector';
import { CellRangeSelector } from './CellRangeSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

interface DataSourcesManagerProps {
  brandId: string;
}

export function DataSourcesManager({ brandId }: DataSourcesManagerProps) {
  const { data: dataSources, isLoading, refetch } = useDataSources(brandId);
  const deleteDataSource = useDeleteDataSource();
  const updateDataSource = useUpdateDataSource();
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSources(newExpanded);
  };

  const handleSync = async (id: string) => {
    // In a real implementation, this would trigger a sync edge function
    await updateDataSource.mutateAsync({ 
      id, 
      last_synced_at: new Date().toISOString() 
    });
  };

  const getSyncBadge = (frequency: string) => {
    switch (frequency) {
      case 'hourly':
        return <Badge variant="secondary">Hourly</Badge>;
      case 'daily':
        return <Badge variant="secondary">Daily</Badge>;
      case 'weekly':
        return <Badge variant="secondary">Weekly</Badge>;
      default:
        return <Badge variant="outline">Manual</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Sources
            </CardTitle>
            <CardDescription>
              Connect Google Sheets to import metrics data
            </CardDescription>
          </div>
          <GoogleSheetsConnector brandId={brandId} onSuccess={() => refetch()} />
        </div>
      </CardHeader>
      <CardContent>
        {!dataSources?.length ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No data sources connected</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Connect a Google Sheet to automatically import metrics data for your campaigns and widgets.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dataSources.map((source) => (
              <DataSourceCard
                key={source.id}
                source={source}
                isExpanded={expandedSources.has(source.id)}
                onToggle={() => toggleExpanded(source.id)}
                onSync={() => handleSync(source.id)}
                onDelete={() => deleteDataSource.mutate(source.id)}
                getSyncBadge={getSyncBadge}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DataSourceCardProps {
  source: any;
  isExpanded: boolean;
  onToggle: () => void;
  onSync: () => void;
  onDelete: () => void;
  getSyncBadge: (frequency: string) => React.ReactNode;
}

function DataSourceCard({ source, isExpanded, onToggle, onSync, onDelete, getSyncBadge }: DataSourceCardProps) {
  const { data: mappings, refetch: refetchMappings } = useDataSourceMappings(isExpanded ? source.id : undefined);
  const deleteMapping = useDeleteMapping();

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="border rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer flex-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {source.sheet_name || 'Default sheet'}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            <div className="flex items-center gap-2">
              {getSyncBadge(source.sync_frequency)}
              
              <Badge variant={source.is_active ? "default" : "secondary"}>
                {source.is_active ? 'Active' : 'Inactive'}
              </Badge>

              {source.sheet_url && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={source.sheet_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={onSync}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Data Source?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{source.name}" and all its mappings. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {source.last_synced_at && (
            <p className="text-xs text-muted-foreground mt-2 ml-7">
              Last synced: {new Date(source.last_synced_at).toLocaleString()}
            </p>
          )}
        </div>

        <CollapsibleContent>
          <div className="border-t px-4 py-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Cell Range Mappings
              </h5>
              <CellRangeSelector 
                dataSourceId={source.id} 
                dataSourceName={source.name}
                onSuccess={() => refetchMappings()}
              />
            </div>

            {!mappings?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No mappings configured. Add a mapping to connect sheet data to metrics.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Cell Range</TableHead>
                    <TableHead>Transform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{mapping.metric_key}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {mapping.sheet_tab ? `${mapping.sheet_tab}!` : ''}{mapping.cell_range}
                        </code>
                      </TableCell>
                      <TableCell className="capitalize">{mapping.transform_type}</TableCell>
                      <TableCell>
                        <Badge variant={mapping.is_active ? "default" : "secondary"} className="text-xs">
                          {mapping.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteMapping.mutate(mapping.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
