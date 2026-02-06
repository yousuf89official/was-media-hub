import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

let clientInstance: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> | null {
  if (clientInstance) return clientInstance;
  if (!isSupabaseConfigured) {
    console.warn('[safeClient] Supabase env vars not available – backend calls will be skipped.');
    return null;
  }
  clientInstance = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return clientInstance;
}

// Backward-compatible export – may be null when env vars are missing
export const supabase = getClient();
