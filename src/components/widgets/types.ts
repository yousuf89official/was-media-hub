export type WidgetType = 
  | 'metric-card'
  | 'premium-stat'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
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
  { type: 'metric-card', label: 'Metric Card', description: 'Display a single KPI value' },
  { type: 'premium-stat', label: 'Premium Stat', description: 'Enhanced stat with icon and color' },
  { type: 'line-chart', label: 'Line Chart', description: 'Trend visualization over time' },
  { type: 'bar-chart', label: 'Bar Chart', description: 'Compare values across categories' },
  { type: 'pie-chart', label: 'Pie Chart', description: 'Show distribution/composition' },
  { type: 'progress-bar', label: 'Progress Bar', description: 'Track progress toward goals' },
  { type: 'data-table', label: 'Data Table', description: 'Tabular data display' },
  { type: 'funnel', label: 'Marketing Funnel', description: 'Funnel stage visualization' },
  { type: 'speedometer', label: 'Speedometer', description: 'Gauge for rates/performance' },
  { type: 'channel-performance', label: 'Channel Performance', description: 'Channel metrics with branding' },
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