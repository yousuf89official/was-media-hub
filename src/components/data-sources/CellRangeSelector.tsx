import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid3X3, Plus } from 'lucide-react';
import { useCreateMapping } from '@/hooks/useDataSources';

interface CellRangeSelectorProps {
  dataSourceId: string;
  dataSourceName: string;
  onSuccess?: () => void;
}

const METRIC_OPTIONS = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'reach', label: 'Reach' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'engagements', label: 'Engagements' },
  { key: 'spend', label: 'Spend' },
  { key: 'conversions', label: 'Conversions' },
  { key: 'ctr', label: 'CTR' },
  { key: 'cpm', label: 'CPM' },
  { key: 'cpc', label: 'CPC' },
  { key: 'roas', label: 'ROAS' },
  { key: 'video_views', label: 'Video Views' },
  { key: 'followers', label: 'Followers' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'shares', label: 'Shares' },
  { key: 'custom', label: 'Custom Metric' },
];

const TRANSFORM_OPTIONS = [
  { key: 'none', label: 'None' },
  { key: 'sum', label: 'Sum' },
  { key: 'average', label: 'Average' },
  { key: 'latest', label: 'Latest Value' },
  { key: 'percentage', label: 'Percentage' },
];

export function CellRangeSelector({ dataSourceId, dataSourceName, onSuccess }: CellRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [metricKey, setMetricKey] = useState('impressions');
  const [customMetric, setCustomMetric] = useState('');
  const [cellRange, setCellRange] = useState('');
  const [sheetTab, setSheetTab] = useState('');
  const [transform, setTransform] = useState('none');

  const createMapping = useCreateMapping();

  const validateCellRange = (range: string): boolean => {
    // Basic validation for cell range formats like A1, A1:B10, Sheet1!A1:B10
    const pattern = /^([A-Za-z0-9_]+!)?[A-Z]+[0-9]+(:[A-Z]+[0-9]+)?$/i;
    return pattern.test(range.trim());
  };

  const handleSubmit = async () => {
    const finalMetricKey = metricKey === 'custom' ? customMetric : metricKey;
    if (!finalMetricKey.trim() || !cellRange.trim()) return;

    await createMapping.mutateAsync({
      data_source_id: dataSourceId,
      metric_key: finalMetricKey.trim(),
      cell_range: cellRange.trim().toUpperCase(),
      sheet_tab: sheetTab.trim() || null,
      transform_type: transform,
      is_active: true,
    });

    setOpen(false);
    resetForm();
    onSuccess?.();
  };

  const resetForm = () => {
    setMetricKey('impressions');
    setCustomMetric('');
    setCellRange('');
    setSheetTab('');
    setTransform('none');
  };

  const isValidRange = cellRange ? validateCellRange(cellRange) : true;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Mapping
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Map Cell Range
          </DialogTitle>
          <DialogDescription>
            Map a cell range from "{dataSourceName}" to a metric.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select value={metricKey} onValueChange={setMetricKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {metricKey === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Metric Name</Label>
              <Input
                placeholder="e.g., brand_mentions"
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Cell Range</Label>
            <Input
              placeholder="e.g., A1 or B2:B100"
              value={cellRange}
              onChange={(e) => setCellRange(e.target.value)}
              className={!isValidRange ? 'border-destructive' : ''}
            />
            {!isValidRange && (
              <p className="text-xs text-destructive">
                Invalid cell range format. Use formats like A1, B2:D10, or Sheet1!A1:B10
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Sheet Tab (optional)</Label>
            <Input
              placeholder="e.g., Sheet1 or Metrics"
              value={sheetTab}
              onChange={(e) => setSheetTab(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default tab from the data source
            </p>
          </div>

          <div className="space-y-2">
            <Label>Transform</Label>
            <Select value={transform} onValueChange={setTransform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSFORM_OPTIONS.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How to process the data from the range
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-1">Preview</h4>
            <code className="text-xs text-muted-foreground">
              {sheetTab ? `${sheetTab}!` : ''}{cellRange || '[range]'} → {metricKey === 'custom' ? customMetric || '[metric]' : metricKey}
              {transform !== 'none' && ` (${transform})`}
            </code>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                !cellRange.trim() || 
                !isValidRange || 
                (metricKey === 'custom' && !customMetric.trim()) ||
                createMapping.isPending
              }
            >
              {createMapping.isPending ? 'Creating...' : 'Create Mapping'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
