-- Correspondance privee option -> type. Voir docs/SOURCE_MAPPING.md §4.4 pour la justification
-- de ce choix (table Postgres protegée par RLS plutot qu'un seed local non versionne).
--
-- CRITIQUE : cette table ne doit JAMAIS avoir de politique RLS permissive pour `anon` ou
-- `authenticated`. Seul le role `service_role` (utilise exclusivement par les Edge Functions,
-- jamais expose au navigateur) peut la lire -- il contourne RLS par defaut sur Supabase, donc
-- aucune politique explicite n'est necessaire pour lui.

create table public.scoring_key (
  item_id integer not null check (item_id between 1 and 45),
  option_id text not null,
  type_code public.type_code not null,
  assessment_version text not null default 'v0.2',
  primary key (item_id, option_id)
);

comment on table public.scoring_key is
  'PRIVEE. Correspondance option -> type pour le scoring autoritatif cote serveur. '
  'Alimentee par supabase/seed/scoring_key.seed.sql, genere depuis supabase/seed/items.v0.2.ts. '
  'RLS activee sans aucune politique publique : voir supabase/migrations/..._rls_policies.sql.';
