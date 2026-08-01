import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  // Warn loudly, but do NOT let this crash module evaluation: `createClient` throws
  // synchronously on an invalid URL, and this module is imported eagerly by the router (via
  // RequireAdmin), so a throw here used to take down the *entire* SPA -- including the public
  // candidate flow, which needs no Supabase config until the final submit. A placeholder URL
  // keeps the client constructible; any real network call will simply fail visibly instead.
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
export const supabase = createClient(
  supabaseUrl || "https://placeholder.invalid",
  supabasePublishableKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
