export type WidgetType = 
  | 'metric-card'
  | 'premium-stat'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'progress-bar'
  | 'data-table'
  | 'funnel'
  | 'speedometer'
  | 'channel-performance';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  layout?: WidgetLayout;
  config: {
    metric?: string;
    dataSource?: string;
    color?: string;
    icon?: string;
    target?: number;
    format?: 'number' | 'currency' | 'percentage';
    currencyCode?: string;
    channel?: string;
  };
}

export interface WidgetData {
  value: number;
  previousValue?: number;
  target?: number;
  trend?: number;
  label?: string;
  data?: Array<{ name: string; value: number }>;
}

export const WIDGET_TYPES: { type: WidgetType; label: string; description: string }[] = [
  { type: 'metric-card', label: 'Metric Card', description: 'Display a single KPI value with sparkline' },
  { type: 'premium-stat', label: 'Premium Stat', description: 'Enhanced stat with icon and channel branding' },
  { type: 'line-chart', label: 'Line Chart', description: 'Trend visualization with gradients' },
  { type: 'bar-chart', label: 'Bar Chart', description: 'Compare values with channel colors' },
  { type: 'pie-chart', label: 'Pie Chart', description: 'Show distribution with platform colors' },
  { type: 'area-chart', label: 'Stacked Area Chart', description: 'Multi-channel trend comparison' },
  { type: 'progress-bar', label: 'Progress Bar', description: 'Track progress toward goals' },
  { type: 'data-table', label: 'Data Table', description: 'Tabular data with channel indicators' },
  { type: 'funnel', label: 'Marketing Funnel', description: 'Animated funnel visualization' },
  { type: 'speedometer', label: 'Speedometer', description: 'Animated gauge for performance rates' },
  { type: 'channel-performance', label: 'Channel Performance', description: 'Horizontal bar chart by channel' },
];

export const WIDGET_SIZES: { size: WidgetSize; label: string; cols: number }[] = [
  { size: 'small', label: 'Small (1 col)', cols: 1 },
  { size: 'medium', label: 'Medium (2 cols)', cols: 2 },
  { size: 'large', label: 'Large (3 cols)', cols: 3 },
  { size: 'full', label: 'Full Width (4 cols)', cols: 4 },
];

export const METRIC_OPTIONS = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'reach', label: 'Reach' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'engagements', label: 'Engagements' },
  { key: 'spend', label: 'Spend' },
  { key: 'ctr', label: 'CTR' },
  { key: 'cpm', label: 'CPM' },
  { key: 'cpc', label: 'CPC' },
  { key: 'roas', label: 'ROAS' },
  { key: 'conversions', label: 'Conversions' },
  { key: 'video_views', label: 'Video Views' },
  { key: 'followers', label: 'Followers' },
];