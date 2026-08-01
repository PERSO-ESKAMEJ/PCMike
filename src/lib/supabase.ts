import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  // Fails fast in dev/build rather than silently issuing requests to "undefined".
  // In production this should never happen if VITE_* variables are set by CI (see docs/DEPLOYMENT.md).
  console.error(
    "Variables Supabase manquantes (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). " +
      "Voir .env.example et docs/SUPABASE_SETUP.md."
  );
}

// This client only ever holds the public "anon"/"publishable" key. It is safe to ship in the
// browser bundle by design: every sensitive read/write is gated by Postgres RLS policies or
// goes through an Edge Function using the service_role key on the server. See
// docs/PRIVACY_AND_SECURITY.md.
//
// Not parametrized with a generated `Database` type yet: hand-modeling PostgREST's dynamic
// nested `select("...")` join strings accurately is impractical, and no live Supabase project
// exists in this environment to run `supabase gen types typescript --linked`. Once a project is
// linked, regenerate real types into src/lib/database.types.ts and parametrize this client
// (`createClient<Database>(...)`) for full compile-time query safety -- see docs/SUPABASE_SETUP.md.
export const supabase = createClient(supabaseUrl ?? "", supabasePublishableKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
