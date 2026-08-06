import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Publishable (anon) values are safe to ship in the browser bundle.
// Fallbacks guarantee the app works even if build-time env injection is missing.
const FALLBACK_URL = 'https://kqenlckrxqqavpiytjpm.supabase.co';
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZW5sY2tyeHFxYXZwaXl0anBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTE4MzcsImV4cCI6MjA3NzM4NzgzN30.w9M6OuZc_m3yJRmnxlLtp7M23v4IgKY99VwM4LdQNUc';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

/** Some mobile browsers (private mode, in-app webviews) throw on localStorage access. */
function safeStorage(): Storage | undefined {
  try {
    const probe = '__sb_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => void memory.set(k, v),
      removeItem: (k: string) => void memory.delete(k),
      clear: () => memory.clear(),
      key: (i: number) => Array.from(memory.keys())[i] ?? null,
      get length() {
        return memory.size;
      },
    } as Storage;
  }
}

let clientInstance: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> | null {
  if (clientInstance) return clientInstance;
  try {
    clientInstance = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: safeStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('[safeClient] Failed to initialize backend client', err);
    return null;
  }
  return clientInstance;
}

// Backward-compatible export
export const supabase = getClient();

export const isSupabaseConfigured = Boolean(supabase);
