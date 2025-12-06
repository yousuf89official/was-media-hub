# WAS MEDIA HUB - COMPREHENSIVE APPLICATION SPECIFICATION

## 1. APPLICATION OVERVIEW

**WAS Media Hub** is a full-stack media analytics and campaign management platform built for marketing agencies and their clients. It provides comprehensive tools for:

- **Brand & Campaign Management**: Hierarchical organization of brands, products, and campaigns
- **AVE (Advertising Value Equivalency) Calculator**: Calculate media value across channels with configurable multipliers
- **Performance Dashboards**: Real-time analytics with customizable widgets
- **Creative Gallery**: Platform-specific mockups for ad creatives
- **User & Permission Management**: Enterprise RBAC with granular feature-level permissions

---

## 2. TECHNOLOGY STACK

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | Core framework |
| Vite | Build tool |
| Tailwind CSS | Styling with semantic tokens |
| TanStack Query v5 | Server state management |
| React Router v6 | Client-side routing |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Data visualization |
| @dnd-kit | Drag-and-drop functionality |
| react-grid-layout | Resizable widget grid |
| @react-pdf/renderer | PDF generation |
| Lucide React | Icon library |
| Shadcn/ui | Component library |

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Database |
| Row Level Security (RLS) | Data access control |
| Edge Functions | Serverless backend logic |
| Supabase Auth | Authentication |
| Supabase Storage | File storage |
| Realtime | WebSocket subscriptions |

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables (46 total)

#### User & Authentication
```
profiles              - User profile data (name, email, company, etc.)
user_roles            - Role assignments (MasterAdmin, Director, Account, Client)
user_job_assignments  - Job title assignments with user_type (agency/client/guest)
departments           - Organization departments
job_titles            - Job titles within departments
features              - System features for permissions
feature_permissions   - Feature-level CRUD permissions per job title
```

#### Brands & Campaigns
```
companies             - Parent company entities
brands                - Brand entities with logo, markets, social handles
products              - Products under brands
campaigns             - Campaign records with type, dates, budget, status
campaign_types        - Campaign type definitions (Branding.Brand, etc.)
campaign_services     - Marketing services available
campaign_service_categories - Service category groupings
campaign_service_assignments - Services assigned to campaigns
```

#### Channels & Metrics
```
channel_categories    - Platform categories (Meta, Google, TikTok, etc.)
channels              - Individual channels with brand colors, icons
channel_objectives    - Channel-objective relationships
channel_buying_models - Channel-buying model relationships
channel_metrics       - Channel-metric relationships
objectives            - Campaign objectives (Awareness, Conversions, etc.)
buying_models         - Buying model definitions (CPM, CPC, etc.)
metric_definitions    - Metric definitions with formulas
metrics               - Actual metric data per campaign/channel/date
placements            - Ad placement formats per channel
```

#### AVE Calculator
```
cpm_rates             - CPM rates per channel
platform_multipliers  - Platform-specific multipliers
engagement_multipliers - Engagement level multipliers
sentiment_multipliers - Sentiment-based multipliers
ave_results           - Calculated AVE results
calculation_logs      - Audit trail for calculations
media_outlets         - PR media outlet data (tier, eCPM, page views)
pr_settings           - PR calculation settings
```

#### Ads Structure (Platform-mirroring)
```
campaign_channel_configs - Campaign-channel linking with budget
ad_sets               - Ad set configurations (targeting, placements)
ads                   - Individual ad creatives
creatives             - Creative assets with platform mockups
```

#### Data Sources
```
data_sources          - External data connections (Google Sheets)
data_source_mappings  - Cell range mappings for metrics
```

#### CMS
```
site_settings         - Site configuration
site_images           - Uploaded images
landing_features      - Landing page feature cards
landing_sections      - Landing page content sections
```

#### Other
```
brand_access_grants   - Client brand access permissions
user_activity_logs    - User activity tracking
sov_results           - Share of Voice calculations
```

---

## 4. ROUTING STRUCTURE

### Public Routes
```
/                     - Landing page (marketing site)
/auth                 - Authentication (login/signup)
/email-verification   - Email verification callback
/privacy-policy       - Privacy policy page
```

### Protected Routes (require authentication)
```
/dashboard            - Main dashboard with KPIs
/brands               - Brand listing and creation
/brands/:brandId/dashboard - Brand performance dashboard
/brands/:brandId/campaigns/new - New campaign form
/ave-calculator       - AVE calculation tool
/calculation-logs     - AVE calculation history
/reports              - Report generation
/data-export          - Data export tools
/profile              - User profile settings
```

### Admin Routes (MasterAdmin only)
```
/admin/brand-campaign-management - Platform configuration
/admin/content-management        - CMS editor
/admin/user-management          - User administration
/admin/media-outlets            - Media outlet management
```

---

## 5. SIDEBAR NAVIGATION

### All Authenticated Users
| Menu Item | Icon | Route | Description |
|-----------|------|-------|-------------|
| Dashboard | LayoutDashboard | /dashboard | Main overview |
| Brands | Building2 | /brands | Brand management |
| AVE Calculator | Calculator | /ave-calculator | Value calculation |
| Calculation Logs | History | /calculation-logs | Calculation history |
| Reports | FileText | /reports | Report generation |
| Data Export | Download | /data-export | Export tools |
| Profile | User | /profile | User settings |

### MasterAdmin Additional Items
| Menu Item | Icon | Route | Description |
|-----------|------|-------|-------------|
| Brand & Campaign Management | Settings2 | /admin/brand-campaign-management | Platform config |
| Content Management | Palette | /admin/content-management | CMS |
| User Management | Users | /admin/user-management | User admin |
| Media Outlets | Newspaper | /admin/media-outlets | PR outlets |

---

## 6. PAGE FLOWS & FEATURES

### 6.1 Landing Page (`/`)
**Components**: Hero section, Features grid, CTA section, Footer

**Flow**:
1. User lands on marketing page
2. Views hero with headline, subheading, CTA button
3. Scrolls to see feature cards (database-driven)
4. Clicks "Get Started" → navigates to `/auth`

**Dynamic Content**: All sections are CMS-editable via `landing_sections` and `landing_features` tables.

---

### 6.2 Authentication (`/auth`)
**Components**: Tabs (Login/Signup), Form fields, Social auth buttons

**Flow**:
1. User selects Login or Sign Up tab
2. Enters email/password
3. On signup: Creates auth user → Triggers `create_profile_for_user` function
4. On login: Validates credentials → Redirects to `/dashboard`

**Security**:
- Auto-confirm email enabled (development)
- Session managed via Supabase Auth
- Profile created automatically on signup

---

### 6.3 Dashboard (`/dashboard`)
**Components**: KPI cards, Performance chart, Channel comparison, Activity feed, Top campaigns

**Data Fetching**:
```typescript
useDashboardData() → {
  campaigns: Campaign[]
  stats: { activeCampaigns, totalAVE, totalReach, totalImpressions, totalSpend, engagementRate }
  performanceTrend: { date, impressions, reach, engagements }[]
  channelPerformance: { channel, impressions, clicks, spend }[]
  recentActivity: ActivityLog[]
}
```

**Widgets**:
- Active Campaigns count
- Total AVE (formatted currency)
- Total Reach
- Total Impressions
- Total Spend
- Engagement Rate (percentage)

**Conditional Rendering**:
- Shows `WelcomeWizard` for new users (via `useOnboarding`)
- Shows "Getting Started" section if no campaigns exist

---

### 6.4 Brands List (`/brands`)
**Components**: Brand cards, New Brand dialog

**Flow**:
1. Fetches brands via `useBrands()`
2. Displays grid of brand cards with:
   - Brand name
   - Creation date
   - Campaign count (from `campaigns` table)
   - Product count (from `products` table)
   - Categories/Markets badges
3. Click card → Navigate to `/brands/:brandId/dashboard`
4. Click "New Brand" → Opens creation dialog

**Hooks Used**:
- `useBrands()` - Fetch all brands
- `useCreateBrand()` - Create new brand mutation

---

### 6.5 Brand Performance Dashboard (`/brands/:brandId/dashboard`)
**Components**: Campaign tabs, Channel filters, Metric cards, Widget grid, Creative gallery

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ [All Campaigns] [Campaign 1] [Campaign 2] [Campaign 3]      │
├─────────────────────────────────────────────────────────────┤
│ Channel Filter: [Instagram ✓] [Facebook ✓] [TikTok] [...]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Total Spend │ │ Impressions │ │ Reach       │            │
│ │ $XX,XXX     │ │ X.XM        │ │ XXX,XXX     │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    Widget Grid                          │ │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │ │
│ │  │ Chart    │ │ Funnel   │ │ Table    │                │ │
│ │  └──────────┘ └──────────┘ └──────────┘                │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                  Creative Gallery                        │ │
│ │  [Platform Filter] [Placement Filter]                   │ │
│ │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │ │
│ │  │ IG  │ │ IG  │ │ TT  │ │ YT  │                       │ │
│ │  │Feed │ │Story│ │Feed │ │Short│                       │ │
│ │  └─────┘ └─────┘ └─────┘ └─────┘                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**State Management**:
- `selectedCampaignId`: Current campaign filter (null = all)
- `selectedChannels`: Array of selected channel IDs
- `viewMode`: 'client' | 'agency' (affects financial visibility)

**Data Aggregation**:
- When "All Campaigns" selected: Aggregates metrics across all brand campaigns
- When specific campaign selected: Shows campaign-specific data
- Channel filter further refines displayed metrics

---

### 6.6 Campaign Form (`/brands/:brandId/campaigns/new`)
**Components**: Multi-step form, Channel budget selector, Date pickers

**Form Fields**:
```typescript
{
  name: string
  brandId: string
  campaignTypeId: string
  productId?: string
  funnelType: 'TOP' | 'MID' | 'BOTTOM'
  startDate: Date
  endDate: Date
  channels: { channelId: string, budget: number }[]
  services: string[] // Service type IDs
  primaryKpi?: string
  kpiTarget?: number
  markets?: string[]
}
```

**Flow**:
1. Select campaign type
2. Choose product (optional, with inline creation)
3. Select channels with individual budgets
4. Set dates and KPI targets
5. Save as draft or submit

**Hooks Used**:
- `useCreateCampaign()` - Create mutation
- `useChannels()` - Fetch available channels
- `useCampaignTypes()` - Fetch campaign types
- `useProducts()` - Fetch brand products

---

### 6.7 AVE Calculator (`/ave-calculator`)
**Components**: Brand/Campaign selectors, Channel selection, Input forms, Results display

**Calculation Flow**:
```
1. Select Brand (optional) and Campaign (optional)
2. Select Channels (Social and/or Media Relations)
3. For Social Channels:
   - Enter impressions per channel
   - System fetches CPM rates from database
4. For Media Relations:
   - Select media outlets by tier
   - Enter publication count per outlet
   - System uses outlet-specific eCPM and page views
5. Apply multipliers:
   - Platform multiplier (per channel)
   - Engagement multiplier (Low/Moderate/High/Viral)
   - Sentiment multiplier (Positive/Neutral/Negative)
6. Calculate: AVE = (Impressions × CPM / 1000) × Multipliers
7. Display results with breakdown
8. Option to export as PDF
```

**Database Tables Used**:
- `cpm_rates` - Channel CPM values
- `platform_multipliers` - Platform-specific multipliers
- `engagement_multipliers` - Engagement level multipliers
- `sentiment_multipliers` - Sentiment multipliers
- `media_outlets` - PR outlet data
- `calculation_logs` - Stores calculation results

---

### 6.8 Calculation Logs (`/calculation-logs`)
**Components**: Filter dropdown, Logs table

**Features**:
- MasterAdmin can view all users' logs
- Regular users see only their own logs
- Filterable by user (MasterAdmin only)
- Displays: Date, Type, Brand, Campaign, Channels, Final AVE

---

### 6.9 Reports (`/reports`)
**Components**: Report type selector, Parameter inputs, Export options

**Report Types**:
- Campaign Performance Report
- Channel Comparison Report
- AVE Summary Report
- Creative Performance Report

---

### 6.10 Profile (`/profile`)
**Components**: Profile picture upload, Form fields, Email change dialog

**Editable Fields**:
- Profile picture (stored in Supabase Storage)
- Name, Username
- Phone, Date of Birth, Gender
- Company, Job Title, Industry
- Address (multi-line)
- Timezone, Language preference
- LinkedIn, Website URLs
- Bio

**Hooks Used**:
- `useProfileUpdate()` - Profile update mutation
- `useProfilePicture()` - Picture upload handling
- `useEmailChange()` - Email change flow

---

## 7. ADMIN FEATURES

### 7.1 Brand & Campaign Management
**Tabs**:
1. **Campaign Types** - CRUD for campaign type definitions
2. **Campaign Services** - Service categories and sub-services
3. **Platform & Channels** - Hierarchical channel configuration
4. **PR Settings** - AVE calculator PR parameters

**Platform & Channels Hierarchy**:
```
Channel Category (e.g., "Meta")
├── Channel (e.g., "Instagram")
│   ├── Objectives (e.g., "Brand Awareness", "Conversions")
│   ├── Buying Models (e.g., "CPM", "CPC")
│   ├── Metrics (e.g., "Impressions", "Reach", "CTR")
│   └── Placements (e.g., "Feed 1:1", "Story 9:16", "Reels")
```

---

### 7.2 Content Management
**Editable Sections**:
- Logo (upload/URL)
- Hero Section (headline, subheading, CTA)
- Features (icon, title, description, order)
- CTA Section
- Footer content

---

### 7.3 User Management
**Features**:
- View all users with status
- Edit user roles
- Manage job title assignments
- Configure brand access grants

**Role Hierarchy**:
```
MasterAdmin > Director > Account > Client
```

---

## 8. WIDGET SYSTEM

### 8.1 Widget Types
| Type | Description | Data Binding |
|------|-------------|--------------|
| `metric_card` | Single KPI display | Single value |
| `premium_stat_card` | KPI with icon and trend | Value + sparkline |
| `line_chart` | Time series visualization | Multi-series data |
| `bar_chart` | Comparison chart | Category + values |
| `pie_chart` | Distribution chart | Labels + values |
| `area_chart` | Filled time series | Multi-series data |
| `progress_bar` | Goal tracking | Current + target |
| `funnel` | Conversion funnel | Stage values |
| `speedometer` | Gauge visualization | Value + max |
| `data_table` | Tabular data | Rows + columns |
| `channel_performance` | Channel-specific card | Metrics per channel |

### 8.2 Widget Configuration
```typescript
interface Widget {
  id: string
  type: WidgetType
  title: string
  dataSource: 'manual' | 'google_sheets' | 'database'
  config: {
    channelId?: string      // For channel branding
    sheetRange?: string     // e.g., "Sheet1!A1:B10"
    metricKey?: string      // Database metric key
    refreshInterval?: number
  }
  layout: {
    x: number
    y: number
    w: number  // 1-4 columns
    h: number  // 1-4 rows
  }
}
```

### 8.3 Widget Grid
- Uses `react-grid-layout` for drag-and-resize
- 12-column grid system
- Constraints: minW: 1, maxW: 4, minH: 1, maxH: 4
- Layout persisted per dashboard

---

## 9. CREATIVE GALLERY

### 9.1 Platform Mockups
| Platform | Placements | Aspect Ratios |
|----------|------------|---------------|
| Instagram | Feed, Story, Reels, Explore | 1:1, 9:16, 4:5 |
| Facebook | Feed, Story, Reels, In-Stream | 1:1, 4:5, 9:16, 16:9 |
| TikTok | In-Feed, TopView, Spark | 9:16 |
| YouTube | Shorts, In-Stream, Discovery | 9:16, 16:9 |
| Google | Search, Display, Shopping | Text, Various |
| LinkedIn | Image, Video, Carousel | 1:1, 16:9 |

### 9.2 Creative Features
- Upload images/videos
- Assign to placement type
- Mark as collaboration/boosted
- Track source: organic/paid/KOL
- View in platform-accurate mockup
- Track performance metrics per creative

---

## 10. HOOKS ARCHITECTURE

### 10.1 Core Data Hooks
```typescript
// Brands & Campaigns
useBrands()              // Fetch all brands
useBrand(id)             // Fetch single brand
useCreateBrand()         // Create brand mutation
useCampaigns(brandId?)   // Fetch campaigns
useCreateCampaign()      // Create campaign mutation
useUpdateCampaign()      // Update campaign mutation

// Channels & Configuration
useChannels()            // Fetch all channels
useChannelCategories()   // Fetch channel categories
useHierarchicalChannels() // Channels with hierarchy
useObjectives()          // Fetch objectives
useBuyingModels()        // Fetch buying models
usePlacements()          // Fetch placements
useMetricDefinitions()   // Fetch metric definitions

// Products
useProducts(brandId)     // Fetch brand products
```

### 10.2 Dashboard Hooks
```typescript
useDashboardData()       // Aggregate dashboard data
useMetrics(campaignId, channelId) // Fetch metrics
useMetricTrends(campaignId, days) // Trend data
useRealtimeMetrics(campaignId)    // WebSocket subscription
```

### 10.3 Widget Data Hooks
```typescript
useWidgetData(widgetConfig)  // Fetch widget-specific data
useDataSources(campaignId)   // Fetch data source configs
```

### 10.4 Admin Hooks
```typescript
useUserRole()            // Current user's role
useUserManagement()      // User CRUD operations
usePermissions(userId)   // User permissions
usePRSettings()          // PR calculator settings
useSiteSettings()        // Site configuration
useSiteImages()          // CMS images
useLandingFeatures()     // Landing page features
useLandingSections()     // Landing page sections
```

### 10.5 Mutation Pattern
All mutations follow this pattern:
```typescript
const { mutate, isPending, error } = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase.from('table').insert(data)
    if (error) throw error
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['table'] })
    toast.success('Success message')
  },
  onError: (error) => {
    toast.error(error.message)
  }
})
```

---

## 11. SECURITY & RBAC

### 11.1 User Types
```typescript
type UserType = 'agency' | 'client' | 'guest'
```

### 11.2 Roles
```typescript
type AppRole = 'MasterAdmin' | 'Director' | 'Account' | 'Client'
```

### 11.3 Permission Matrix
```typescript
interface FeaturePermission {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_export: boolean
}
```

### 11.4 Permission Check Functions
```sql
-- Check if user has specific role
has_role(_user_id UUID, _role app_role) → boolean

-- Check feature permission
has_feature_permission(_user_id UUID, _feature_code TEXT, _permission TEXT) → boolean

-- Check brand access
can_access_brand(_user_id UUID, _brand_id UUID, _access_level TEXT) → boolean

-- Get user type
get_user_type(_user_id UUID) → user_type_enum
```

### 11.5 RLS Policies Pattern
```sql
-- Example: Users can only see their own data
CREATE POLICY "Users view own data"
ON public.table_name
FOR SELECT
USING (auth.uid() = user_id);

-- Example: MasterAdmin can see all
CREATE POLICY "MasterAdmin view all"
ON public.table_name
FOR SELECT
USING (has_role(auth.uid(), 'MasterAdmin'));
```

---

## 12. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
│  (Click, Form Submit, Filter Change, Drag Widget)               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REACT COMPONENTS                             │
│  (Pages, Layouts, UI Components, Widgets)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOM HOOKS                                │
│  (useQuery, useMutation, useEffect, useState)                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TANSTACK QUERY                                │
│  (Cache, Deduplication, Background Refetch, Optimistic Updates) │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                               │
│  (Auth, Database, Storage, Realtime)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │PostgreSQL│  │   Auth   │  │ Storage  │  │ Realtime │       │
│  │   + RLS  │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. KEY UI PATTERNS

### 13.1 Loading States
```tsx
// Skeleton loaders
<Skeleton className="h-4 w-[200px]" />

// Spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Table skeleton
<TableSkeleton rows={5} columns={4} />
```

### 13.2 Empty States
```tsx
<EmptyState
  icon={<FileQuestion className="h-12 w-12" />}
  title="No campaigns yet"
  description="Create your first campaign to get started"
  action={<Button>Create Campaign</Button>}
/>
```

### 13.3 Form Patterns
```tsx
// Using React Hook Form + Zod
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
})

<Form {...form}>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### 13.4 Toast Notifications
```tsx
import { toast } from 'sonner'

toast.success('Operation completed')
toast.error('Something went wrong')
toast.info('FYI message')
```

---

## 14. RESPONSIVE DESIGN

### 14.1 Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### 14.2 High-Resolution Scaling
```css
@media (min-width: 2560px) {
  html { font-size: 20px; }
  .card { padding: 1.5rem; }
}
```

---

## 15. ENVIRONMENT VARIABLES

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

---

## 16. KEY ENUMS

```typescript
// Campaign Status
type CampaignStatus = 'draft' | 'running' | 'finished'

// Funnel Type
type FunnelType = 'TOP' | 'MID' | 'BOTTOM'

// Channel Type
type ChannelType = 'Social' | 'Programmatic' | 'Display' | 'PR' | 'Email' | 'Owned'

// Engagement Level
type EngagementLevel = 'Low' | 'Moderate' | 'High' | 'Viral'

// Sentiment Type
type SentimentType = 'Positive' | 'Neutral' | 'Negative'

// Placement Mock Type
type PlacementMockType = 'MobileFeedMock' | 'StoryMock' | 'ReelsMock' | 
  'InStreamMock' | 'BillboardMock' | 'SearchAdMock' | 'DisplayAdMock'
```

---

## 17. FILE STRUCTURE

```
src/
├── components/
│   ├── ui/                    # Shadcn components
│   ├── admin/                 # Admin-specific components
│   ├── brand-dashboard/       # Brand dashboard components
│   ├── campaign-setup/        # Campaign form components
│   ├── creative-gallery/      # Gallery & mockups
│   ├── dashboard/             # Main dashboard components
│   ├── data-sources/          # Data source integration
│   ├── notifications/         # Notification center
│   ├── onboarding/           # Welcome wizard
│   ├── pdf/                   # PDF export components
│   ├── profile/               # Profile components
│   ├── skeletons/            # Loading skeletons
│   └── widgets/              # Widget system
├── contexts/                  # React contexts
├── hooks/                     # Custom hooks (50+)
├── integrations/
│   └── supabase/
│       ├── client.ts         # Supabase client
│       └── types.ts          # Generated types
├── lib/
│   └── utils.ts              # Utility functions
├── pages/                     # Route pages
├── schemas/                   # Zod schemas
└── utils/                     # Helper utilities
```

---

## 18. SUPABASE PROJECT INFO

- **Project ID**: kqenlckrxqqavpiytjpm
- **Region**: Managed by Lovable Cloud
- **Auth**: Email/password with auto-confirm enabled
- **Storage Buckets**: avatars, creatives, site-images

---

*Document generated for WAS Media Hub v1.0*
*Last updated: December 2024*
