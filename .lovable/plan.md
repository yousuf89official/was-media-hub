

# Fix: "supabaseUrl is required" Blank Screen

## Problem

The auto-generated `src/integrations/supabase/client.ts` calls `createClient()` the instant it's imported. When Lovable Cloud hasn't injected environment variables yet, this throws an uncaught error that crashes the entire app -- even on pages like `/auth` that are lazy-loaded.

56 files across the project import directly from this file, so any page navigation triggers the crash.

## Solution

Create a **safe client wrapper** that all application code imports instead of the auto-generated file. The wrapper defers client creation and returns `null` when env vars are missing, letting the app render gracefully.

---

### Step 1: Create Safe Client Wrapper

**New file: `src/integrations/supabase/safeClient.ts`**

- Export a `getSupabase()` function that lazily creates the client only when called (not at import time)
- If `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` are missing, return `null`
- Also export a `supabase` getter for backward compatibility that logs a warning instead of crashing
- Export a boolean `isSupabaseConfigured` flag for conditional checks

### Step 2: Bulk-update all 56 importing files

Change every import from:
```ts
import { supabase } from "@/integrations/supabase/client";
```
to:
```ts
import { supabase } from "@/integrations/supabase/safeClient";
```

Files affected include:
- `src/pages/Auth.tsx` and all other pages
- All 40+ hooks (`useCreatives`, `useBrands`, `useCampaigns`, etc.)
- `src/utils/imageHelpers.ts`
- `src/components/DashboardLayout.tsx`
- All admin and dashboard components

### Step 3: Add null-safety guards in critical paths

In hooks and pages, add early-return guards:
```ts
const { data } = useQuery({
  queryKey: ['brands'],
  queryFn: async () => {
    if (!supabase) return [];
    // ... existing query
  },
  enabled: !!supabase,
});
```

For the Auth page specifically, show a "Backend unavailable" message instead of crashing.

### Step 4: Update ErrorBoundary for better UX

When the error message is "supabaseUrl is required", show a specific message like "Backend is connecting... please refresh in a moment" instead of the generic error.

---

## Technical Details

**`src/integrations/supabase/safeClient.ts`** implementation:

```ts
import type { Database } from './types';

let clientInstance: ReturnType<typeof import('@supabase/supabase-js').createClient<Database>> | null = null;
let initialized = false;

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

function initClient() {
  if (initialized) return clientInstance;
  initialized = true;
  
  if (!isSupabaseConfigured) {
    console.warn('Supabase environment variables not configured');
    return null;
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  // Dynamic import avoids crash at module load time
  // ... create and cache client
}

export const supabase = /* proxy or lazy getter */;
```

**Why not just fix the .env?**
The `.env` file doesn't exist (Lovable Cloud auto-injects). The injection may be temporarily unavailable during builds. This fix ensures the app never crashes regardless of env var timing.

## Files Changed Summary

| Action | Count | Details |
|--------|-------|---------|
| New file | 1 | `safeClient.ts` |
| Updated imports | 56 | All files importing from `client.ts` |
| Updated component | 1 | `ErrorBoundary.tsx` - better messaging |
| Updated page | 1 | `Auth.tsx` - backend unavailable state |
