import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for trusted server-side work only (API routes / route
// handlers): deducting credits, crediting Lemon Squeezy top-ups, writing
// generated PDFs. Bypasses RLS — never import this into client components.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
