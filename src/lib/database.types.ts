// Placeholder hand-maintained until the Supabase project exists and
// `supabase gen types typescript --linked > src/lib/database.types.ts` can be run for real
// (see docs/SUPABASE_SETUP.md). Kept intentionally minimal so the rest of the app can compile
// against a stable shape; regenerate and replace this file once migrations are applied to a
// live project. The shape below matches what @supabase/supabase-js expects from a generated
// types file, just with empty schemas.
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
