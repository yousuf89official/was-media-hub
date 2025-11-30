import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WidgetConfig, WidgetData } from './types';
import { Eye, Users, DollarSign, Zap, TrendingUp, TrendingDown, Target, MousePointer, Video, UserPlus } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
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

// Channel branding colors with gradients
const CHANNEL_COLORS: Record<string, { primary: string; secondary: string; gradient: string }> = {
  instagram: { primary: '#E4405F', secondary: '#FCAF45', gradient: 'url(#instagramGradient)' },
  facebook: { primary: '#1877F2', secondary: '#4267B2', gradient: 'url(#facebookGradient)' },
  tiktok: { primary: '#000000', secondary: '#69C9D0', gradient: 'url(#tiktokGradient)' },
  youtube: { primary: '#FF0000', secondary: '#CC0000', gradient: 'url(#youtubeGradient)' },
  google: { primary: '#4285F4', secondary: '#34A853', gradient: 'url(#googleGradient)' },
  linkedin: { primary: '#0A66C2', secondary: '#0077B5', gradient: 'url(#linkedinGradient)' },
  twitter: { primary: '#1DA1F2', secondary: '#14171A', gradient: 'url(#twitterGradient)' },
  default: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--primary)/0.6)', gradient: 'url(#defaultGradient)' },
};

const CHART_COLORS = [
  '#E4405F', // Instagram pink
  '#1877F2', // Facebook blue
  '#FF0000', // YouTube red
  '#69C9D0', // TikTok cyan
  '#4285F4', // Google blue
  '#0A66C2', // LinkedIn blue
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 animate-fade-in">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// SVG Gradient Definitions component
const ChartGradients = () => (
  <defs>
    <linearGradient id="instagramGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#E4405F" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#FCAF45" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="facebookGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#1877F2" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#4267B2" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="tiktokGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#69C9D0" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#EE1D52" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="youtubeGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#CC0000" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="googleGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#34A853" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="linkedinGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#0077B5" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#E4405F"/>
      <stop offset="50%" stopColor="#1877F2"/>
      <stop offset="100%" stopColor="#4285F4"/>
    </linearGradient>
  </defs>
);

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
    case 'area-chart':
      return <AreaChartWidget widget={widget} data={mockData} />;
    case 'channel-performance':
      return <ChannelPerformanceWidget widget={widget} data={mockData} />;
    default:
      return <PlaceholderWidget widget={widget} />;
  }
}

function MetricCardWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const IconComponent = widget.config.icon ? ICONS[widget.config.icon] : Eye;
  const trend = data.trend || 0;
  const isPositive = trend >= 0;
  const sparklineData = data.data || generateChartData();

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
    <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-end justify-between">
          <div>
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
          </div>
          {/* Mini sparkline */}
          <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`spark-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={1.5}
                  fill={`url(#spark-${widget.id})`}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PremiumStatWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const IconComponent = widget.config.icon ? ICONS[widget.config.icon] : Zap;
  const channel = widget.config.channel || 'default';
  const colors = CHANNEL_COLORS[channel] || CHANNEL_COLORS.default;
  
  return (
    <Card 
      className="h-full overflow-hidden relative group"
      style={{ 
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}08 100%)`,
        borderColor: `${colors.primary}30`
      }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}10 100%)`
        }}
      />
      <CardContent className="p-6 relative z-10">
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
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${colors.primary}25` }}
          >
            {IconComponent && <IconComponent className="h-6 w-6" style={{ color: colors.primary }} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || generateChartData();
  const channel = widget.config.channel || 'default';
  const colors = CHANNEL_COLORS[channel] || CHANNEL_COLORS.default;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Value"
                stroke={colors.primary}
                strokeWidth={2.5}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2, fill: 'white' }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function AreaChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || generateMultiSeriesData();
  const channels = ['instagram', 'facebook', 'youtube'];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                iconType="circle"
              />
              {channels.map((channel, index) => {
                const colors = CHANNEL_COLORS[channel];
                return (
                  <Area
                    key={channel}
                    type="monotone"
                    dataKey={channel}
                    name={channel.charAt(0).toUpperCase() + channel.slice(1)}
                    stackId="1"
                    stroke={colors.primary}
                    fill={colors.gradient}
                    animationDuration={1500 + index * 200}
                    animationEasing="ease-out"
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || generateChartData();
  const channel = widget.config.channel || 'default';
  const colors = CHANNEL_COLORS[channel] || CHANNEL_COLORS.default;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Value"
                fill={colors.gradient}
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function PieChartWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const chartData = data.data || [
    { name: 'Instagram', value: 40 },
    { name: 'Facebook', value: 30 },
    { name: 'YouTube', value: 20 },
    { name: 'TikTok', value: 10 },
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
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                paddingAngle={2}
                animationDuration={1500}
                animationEasing="ease-out"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {chartData.map((entry, index) => {
                  const channelKey = entry.name.toLowerCase();
                  const colors = CHANNEL_COLORS[channelKey] || { primary: CHART_COLORS[index % CHART_COLORS.length] };
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.primary}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ChannelPerformanceWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const channelData = [
    { name: 'Instagram', impressions: 450000, engagements: 12500, color: '#E4405F' },
    { name: 'Facebook', impressions: 320000, engagements: 8900, color: '#1877F2' },
    { name: 'YouTube', impressions: 280000, engagements: 7200, color: '#FF0000' },
    { name: 'TikTok', impressions: 520000, engagements: 18900, color: '#69C9D0' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
              <Bar 
                dataKey="impressions" 
                name="Impressions"
                radius={[0, 4, 4, 0]}
                animationDuration={1200}
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                ))}
              </Bar>
              <Bar 
                dataKey="engagements" 
                name="Engagements"
                radius={[0, 4, 4, 0]}
                animationDuration={1400}
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.5} />
                ))}
              </Bar>
            </BarChart>
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
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000 ease-out", getProgressColor(progress))}
              style={{ width: `${progress}%` }}
            />
          </div>
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
    { stage: 'Awareness', value: 100000, color: '#E4405F' },
    { stage: 'Consideration', value: 50000, color: '#1877F2' },
    { stage: 'Conversion', value: 10000, color: '#4285F4' },
    { stage: 'Retention', value: 5000, color: '#34A853' },
  ];

  const maxValue = funnelData[0].value;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {funnelData.map((stage, index) => {
            const width = (stage.value / maxValue) * 100;
            return (
              <div key={stage.stage} className="flex items-center gap-3 group">
                <div 
                  className="h-9 rounded-r-lg flex items-center justify-center text-xs text-white font-medium transition-all duration-500 group-hover:brightness-110"
                  style={{ 
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}cc 100%)`,
                    minWidth: '80px',
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  {stage.stage}
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {stage.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SpeedometerWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const value = Math.min(data.value, 100);
  const rotation = (value / 100) * 180 - 90;
  
  const getColor = (v: number) => {
    if (v >= 75) return '#22c55e';
    if (v >= 50) return '#3b82f6';
    if (v >= 25) return '#eab308';
    return '#ef4444';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-18 overflow-hidden">
            {/* Background arc */}
            <svg className="w-36 h-18" viewBox="0 0 144 72">
              <defs>
                <linearGradient id="speedoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="33%" stopColor="#eab308" />
                  <stop offset="66%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <path
                d="M 12 72 A 60 60 0 0 1 132 72"
                fill="none"
                stroke="url(#speedoGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                opacity={0.3}
              />
              <path
                d="M 12 72 A 60 60 0 0 1 132 72"
                fill="none"
                stroke="url(#speedoGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(value / 100) * 188} 188`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Needle */}
            <div 
              className="absolute bottom-0 left-1/2 w-1 h-14 origin-bottom transition-transform duration-1000 ease-out"
              style={{ 
                transform: `translateX(-50%) rotate(${rotation}deg)`,
                background: `linear-gradient(to top, ${getColor(value)}, ${getColor(value)}80)`
              }}
            />
            <div 
              className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 translate-y-1/2"
              style={{ backgroundColor: getColor(value) }}
            />
          </div>
          <p className="text-2xl font-bold mt-3" style={{ color: getColor(value) }}>
            {value.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">Performance Rate</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DataTableWidget({ widget, data }: { widget: WidgetConfig; data: WidgetData }) {
  const tableData = [
    { campaign: 'Summer Sale', impressions: 125000, clicks: 3200, ctr: '2.56%', channel: 'instagram' },
    { campaign: 'Brand Awareness', impressions: 89000, clicks: 1800, ctr: '2.02%', channel: 'facebook' },
    { campaign: 'Product Launch', impressions: 67000, clicks: 2100, ctr: '3.13%', channel: 'youtube' },
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
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Campaign</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Impressions</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Clicks</th>
                <th className="text-right py-2 font-medium text-muted-foreground">CTR</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => {
                const colors = CHANNEL_COLORS[row.channel] || CHANNEL_COLORS.default;
                return (
                  <tr 
                    key={i} 
                    className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2.5 flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                      {row.campaign}
                    </td>
                    <td className="text-right py-2.5">{row.impressions.toLocaleString()}</td>
                    <td className="text-right py-2.5">{row.clicks.toLocaleString()}</td>
                    <td className="text-right py-2.5 font-medium">{row.ctr}</td>
                  </tr>
                );
              })}
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

function generateMultiSeriesData() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({
    name,
    instagram: Math.floor(Math.random() * 5000) + 2000,
    facebook: Math.floor(Math.random() * 4000) + 1500,
    youtube: Math.floor(Math.random() * 3000) + 1000,
  }));
}
