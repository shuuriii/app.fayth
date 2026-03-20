import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service role key.
 * This bypasses RLS — use only for server-side data aggregation
 * where cross-table joins are needed (e.g., assembling AI context).
 *
 * NEVER expose this client to the browser.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
