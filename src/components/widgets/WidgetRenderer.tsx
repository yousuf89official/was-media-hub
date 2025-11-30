import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WidgetConfig, WidgetData } from './types';
import { Eye, Users, DollarSign, Zap, TrendingUp, TrendingDown, Target, MousePointer, Video, UserPlus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye,
  Users,
  DollarSign,
  Zap,
  TrendingUp,
  Target,
  MousePointer,
  Video,
  UserPlus,
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

interface WidgetRendererProps {
  widget: WidgetConfig;
  data?: WidgetData;
}

export function WidgetRenderer({ widget, data }: WidgetRendererProps) {
  const mockData = data || getMockData(widget);

  switch (widget.type) {
    case 'metric-card':
      return <MetricCardWidget widget={widget} data={mockData} />;
    case 'premium-stat':
      return <PremiumStatWidget widget={widget} data={mockData} />;
    case 'line-chart':
      return <LineChartWidget widget={widget} data={mockData} />;
    case 'bar-chart':
      return <BarChartWidget widget={widget} data={mockData} />;
    case 'pie-chart':
      return <PieChartWidget widget={widget} data={mockData} />;
    case 'progress-bar':
      return <ProgressBarWidget widget={widget} data={mockData} />;
    case 'funnel':
      return <FunnelWidget widget={widget} data={mockData} />;
    case 'speedometer':
      return <SpeedometerWidget widget={widget} data={mockData} />;
    case 'data-table':
      return <DataTableWidget widget={widget} data={mockData} />;
    default:
      return <PlaceholderWidget widget={widget} />;
  }
}

function MetricCardWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const IconComponent = widget.config.icon ? ICONS[widget.config.icon] : Eye;
  const trend = data.trend || 0;
  const isPositive = trend >= 0;

  const formatValue = (value: number) => {
    if (widget.config.format === 'currency') {
      return `${widget.config.currencyCode || 'IDR'} ${value.toLocaleString()}`;
    }
    if (widget.config.format === 'percentage') {
      return `${value.toFixed(2)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(data.value)}</div>
        {data.trend !== undefined && (
          <p className={cn(
            "text-xs flex items-center gap-1 mt-1",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PremiumStatWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const IconComponent = widget.config.icon ? ICONS[widget.config.icon] : Zap;
  
  return (
    <Card className="h-full bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{widget.title}</p>
            <p className="text-3xl font-bold mt-1">{data.value.toLocaleString()}</p>
            {data.target && (
              <p className="text-xs text-muted-foreground mt-2">
                Target: {data.target.toLocaleString()}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || generateChartData();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || generateChartData();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function PieChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || [
    { name: 'Social', value: 40 },
    { name: 'Display', value: 30 },
    { name: 'Search', value: 20 },
    { name: 'PR', value: 10 },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBarWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const target = widget.config.target || data.target || 100;
  const progress = Math.min((data.value / target) * 100, 100);
  
  const getProgressColor = (p: number) => {
    if (p >= 100) return 'bg-green-500';
    if (p >= 75) return 'bg-blue-500';
    if (p >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{data.value.toLocaleString()}</span>
            <span className="text-muted-foreground">/ {target.toLocaleString()}</span>
          </div>
          <Progress value={progress} className={cn("h-3", getProgressColor(progress))} />
          <p className="text-xs text-muted-foreground text-center">
            {progress.toFixed(1)}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const funnelData = [
    { stage: 'Awareness', value: 100000, width: '100%' },
    { stage: 'Consideration', value: 50000, width: '75%' },
    { stage: 'Conversion', value: 10000, width: '50%' },
    { stage: 'Retention', value: 5000, width: '30%' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {funnelData.map((stage, index) => (
            <div key={stage.stage} className="flex items-center gap-3">
              <div 
                className="h-8 bg-primary/80 rounded flex items-center justify-center text-xs text-primary-foreground font-medium transition-all"
                style={{ width: stage.width }}
              >
                {stage.stage}
              </div>
              <span className="text-sm text-muted-foreground">
                {stage.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SpeedometerWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const value = Math.min(data.value, 100);
  const rotation = (value / 100) * 180 - 90;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-16 overflow-hidden">
            <div className="absolute w-32 h-32 rounded-full border-8 border-muted" />
            <div 
              className="absolute bottom-0 left-1/2 w-1 h-14 bg-primary origin-bottom transition-transform"
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            />
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2" />
          </div>
          <p className="text-2xl font-bold mt-2">{value.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Performance Rate</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DataTableWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const tableData = [
    { campaign: 'Summer Sale', impressions: 125000, clicks: 3200, ctr: '2.56%' },
    { campaign: 'Brand Awareness', impressions: 89000, clicks: 1800, ctr: '2.02%' },
    { campaign: 'Product Launch', impressions: 67000, clicks: 2100, ctr: '3.13%' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Campaign</th>
                <th className="text-right py-2">Impressions</th>
                <th className="text-right py-2">Clicks</th>
                <th className="text-right py-2">CTR</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{row.campaign}</td>
                  <td className="text-right py-2">{row.impressions.toLocaleString()}</td>
                  <td className="text-right py-2">{row.clicks.toLocaleString()}</td>
                  <td className="text-right py-2">{row.ctr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full min-h-32">
        <p className="text-muted-foreground text-sm">Widget: {widget.type}</p>
      </CardContent>
    </Card>
  );
}

function getMockData(widget: WidgetConfig): WidgetData {
  const mockValues: Record<string, number> = {
    impressions: 1250000,
    reach: 890000,
    clicks: 45000,
    engagements: 78000,
    spend: 125000000,
    ctr: 3.6,
    cpm: 100000,
    cpc: 2778,
    roas: 4.2,
    conversions: 1250,
    video_views: 560000,
    followers: 12500,
  };

  return {
    value: mockValues[widget.config.metric || 'impressions'] || 0,
    trend: Math.random() * 20 - 5,
    target: widget.config.target,
    data: generateChartData(),
  };
}

function generateChartData() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({
    name,
    value: Math.floor(Math.random() * 10000) + 5000,
  }));
}
