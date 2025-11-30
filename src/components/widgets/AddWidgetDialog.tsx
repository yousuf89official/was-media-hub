import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WidgetConfig, WidgetType, WidgetSize, WIDGET_TYPES, WIDGET_SIZES, METRIC_OPTIONS } from './types';
import { useWidgets } from './WidgetContext';

interface AddWidgetDialogProps {
  editWidget?: WidgetConfig | null;
  onClose?: () => void;
}

export function AddWidgetDialog({ editWidget, onClose }: AddWidgetDialogProps) {
  const { addWidget, updateWidget } = useWidgets();
  const [open, setOpen] = useState(!!editWidget);
  const [type, setType] = useState<WidgetType>(editWidget?.type || 'metric-card');
  const [title, setTitle] = useState(editWidget?.title || '');
  const [size, setSize] = useState<WidgetSize>(editWidget?.size || 'small');
  const [metric, setMetric] = useState(editWidget?.config.metric || 'impressions');
  const [format, setFormat] = useState<'number' | 'currency' | 'percentage'>(
    editWidget?.config.format || 'number'
  );
  const [target, setTarget] = useState(editWidget?.config.target?.toString() || '');

  const handleSubmit = () => {
    const widgetData = {
      type,
      title: title || WIDGET_TYPES.find(w => w.type === type)?.label || 'Widget',
      size,
      config: {
        metric,
        format,
        target: target ? parseInt(target) : undefined,
        icon: getIconForMetric(metric),
      },
    };

    if (editWidget) {
      updateWidget(editWidget.id, widgetData);
    } else {
      addWidget(widgetData);
    }

    setOpen(false);
    resetForm();
    onClose?.();
  };

  const resetForm = () => {
    setType('metric-card');
    setTitle('');
    setSize('small');
    setMetric('impressions');
    setFormat('number');
    setTarget('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!editWidget && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editWidget ? 'Edit Widget' : 'Add New Widget'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Widget Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as WidgetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIDGET_TYPES.map(w => (
                  <SelectItem key={w.type} value={w.type}>
                    <div>
                      <p className="font-medium">{w.label}</p>
                      <p className="text-xs text-muted-foreground">{w.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Widget title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={size} onValueChange={(v) => setSize(v as WidgetSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIDGET_SIZES.map(s => (
                  <SelectItem key={s.size} value={s.size}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Metric</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map(m => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(type === 'metric-card' || type === 'premium-stat') && (
            <div className="space-y-2">
              <Label>Value Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency (IDR)</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'progress-bar' && (
            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input
                type="number"
                placeholder="e.g., 1000000"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full">
            {editWidget ? 'Update Widget' : 'Add Widget'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getIconForMetric(metric: string): string {
  const iconMap: Record<string, string> = {
    impressions: 'Eye',
    reach: 'Users',
    clicks: 'MousePointer',
    engagements: 'Zap',
    spend: 'DollarSign',
    conversions: 'Target',
    video_views: 'Video',
    followers: 'UserPlus',
  };
  return iconMap[metric] || 'Eye';
}
