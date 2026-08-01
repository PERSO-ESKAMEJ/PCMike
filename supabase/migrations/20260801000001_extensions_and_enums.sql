-- Extensions et types enumeres partages par les migrations suivantes.

create extension if not exists "pgcrypto"; -- gen_random_uuid()

create type public.submission_status as enum (
  'submitted',
  'calculated',
  'error',
  'anonymized'
);

create type public.report_status as enum (
  'not_generated',
  'generated',
  'downloaded',
  'sent',
  'error'
);

create type public.type_code as enum ('AN', 'PE', 'EM', 'IM', 'EN', 'PR');

create type public.duration_category as enum ('weeks', 'months', 'over_a_year', 'several_years');

comment on type public.submission_status is
  'Cycle de vie d''une soumission cote administrateur : voir docs/ADMIN_GUIDE.md.';
