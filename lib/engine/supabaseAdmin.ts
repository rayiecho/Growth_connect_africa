import { createClient } from "@supabase/supabase-js";

// Service-role client — NEVER import this into anything that runs in the
// browser. It bypasses Row Level Security entirely, which is exactly what
// the automation engine needs (it isn't a logged-in user, so RLS's
// "authenticated" policies don't apply to it) but is dangerous if exposed
// client-side. Only ever used inside app/api/* route handlers.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
