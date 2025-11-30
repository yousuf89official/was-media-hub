import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WidgetConfig, WidgetType, WidgetSize, WIDGET_TYPES, WIDGET_SIZES, METRIC_OPTIONS } from './types';
import { useWidgets } from './WidgetContext';

// Channel options with branding colors
const CHANNEL_OPTIONS = [
  { key: 'default', label: 'Default Theme', color: 'hsl(var(--primary))' },
  { key: 'instagram', label: 'Instagram', color: '#E4405F' },
  { key: 'facebook', label: 'Facebook', color: '#1877F2' },
  { key: 'tiktok', label: 'TikTok', color: '#69C9D0' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000' },
  { key: 'google', label: 'Google', color: '#4285F4' },
  { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { key: 'twitter', label: 'X (Twitter)', color: '#1DA1F2' },
];

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
  const [channel, setChannel] = useState(editWidget?.config.channel || 'default');
  const [format, setFormat] = useState<'number' | 'currency' | 'percentage'>(
    editWidget?.config.format || 'number'
  );
  const [target, setTarget] = useState(editWidget?.config.target?.toString() || '');

  // Widget types that support channel branding
  const supportsChannelBranding = [
    'line-chart', 'bar-chart', 'pie-chart', 'area-chart', 
    'premium-stat', 'channel-performance'
  ].includes(type);

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
        channel: supportsChannelBranding ? channel : undefined,
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
    setChannel('default');
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

  const selectedChannel = CHANNEL_OPTIONS.find(c => c.key === channel);

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

          {/* Channel Branding Selector */}
          {supportsChannelBranding && (
            <div className="space-y-2">
              <Label>Channel Branding</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: selectedChannel?.color }}
                      />
                      <span>{selectedChannel?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map(c => (
                    <SelectItem key={c.key} value={c.key}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: c.color }}
                        />
                        <span>{c.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Apply platform-specific colors to charts and stats
              </p>
            </div>
          )}

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

          {/* Preview of selected channel color */}
          {supportsChannelBranding && channel !== 'default' && (
            <div 
              className="p-3 rounded-lg border border-border/50 flex items-center gap-3"
              style={{ 
                background: `linear-gradient(135deg, ${selectedChannel?.color}15 0%, ${selectedChannel?.color}05 100%)`,
                borderColor: `${selectedChannel?.color}30`
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: selectedChannel?.color }}
              >
                {selectedChannel?.label.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{selectedChannel?.label} Branding</p>
                <p className="text-xs text-muted-foreground">
                  Widget will use {selectedChannel?.label} colors
                </p>
              </div>
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
