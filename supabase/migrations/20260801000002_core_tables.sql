-- Tables principales. Voir docs/SUPABASE_SETUP.md et docs/PRIVACY_AND_SECURITY.md.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- assessment_versions
-- ---------------------------------------------------------------------------
create table public.assessment_versions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  questionnaire_version text not null,
  scoring_version text not null,
  report_template_version text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.assessment_versions is
  'Une ligne par combinaison (questionnaire, scoring, template de rapport) deployee. Une seule version active a la fois.';

-- Une seule version active a la fois.
create unique index assessment_versions_single_active
  on public.assessment_versions (is_active)
  where is_active;

-- ---------------------------------------------------------------------------
-- participants
-- ---------------------------------------------------------------------------
create or replace function public.generate_reference_code()
returns text
language plpgsql
as $$
declare
  charset text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- sans 0/O/1/I/L (ambigus a l'oeil)
  code text;
begin
  loop
    select 'QPC-' || string_agg(substr(charset, (floor(random() * length(charset)) + 1)::int, 1), '')
      into code
      from generate_series(1, 6);
    exit when not exists (select 1 from public.participants where reference_code = code);
  end loop;
  return code;
end;
$$;

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default public.generate_reference_code(),
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 50),
  organization text check (char_length(organization) <= 200),
  job_title text check (char_length(job_title) <= 200),
  comment text check (char_length(comment) <= 2000),
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  anonymized_at timestamptz
);

comment on table public.participants is
  'Donnees d''identification du candidat. Voir docs/PRIVACY_AND_SECURITY.md pour l''anonymisation.';

create index participants_email_idx on public.participants (lower(email));

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  assessment_version uuid not null references public.assessment_versions (id),
  scoring_version text not null,
  status public.submission_status not null default 'submitted',
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  idempotency_key uuid not null unique,
  -- {itemId: [optionId, ...]} -- ordre de presentation des 6 options par item pour ce candidat.
  option_order_snapshot jsonb not null,
  -- {answers: [...], phaseHistory: {...} | null} -- contenu brut du questionnaire uniquement.
  -- Les champs d'identite (nom/e-mail/...) restent exclusivement dans `participants`, jamais
  -- dupliques ici, pour eviter la dispersion de donnees personnelles (docs/PRIVACY_AND_SECURITY.md).
  raw_payload_snapshot jsonb not null,
  -- Sortie complete de scoreAssessment() au moment de la soumission (ScoringResult).
  result_snapshot jsonb not null,
  -- Extrait pratique de result_snapshot pour filtrage rapide cote tableau de bord admin.
  confidence_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at >= started_at)
);

comment on table public.submissions is
  'Une soumission complete et validee du questionnaire, avec son resultat de scoring autoritatif.';

create index submissions_participant_idx on public.submissions (participant_id);
create index submissions_status_idx on public.submissions (status);
create index submissions_created_at_idx on public.submissions (created_at desc);

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- submission_answers
-- ---------------------------------------------------------------------------
create table public.submission_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  item_id integer not null check (item_id between 1 and 45),
  ranked_option_ids text[] not null default '{}',
  unranked_option_ids text[] not null default '{}',
  explicit_no_match boolean not null default false,
  presented_option_order text[] not null,
  created_at timestamptz not null default now(),
  unique (submission_id, item_id),
  check (cardinality(presented_option_order) = 6),
  check (cardinality(ranked_option_ids) <= 6)
);

comment on table public.submission_answers is
  'Reponse brute par item (45 lignes par soumission), y compris les propositions non classees.';

create index submission_answers_submission_idx on public.submission_answers (submission_id);

-- ---------------------------------------------------------------------------
-- phase_history_answers
-- ---------------------------------------------------------------------------
create table public.phase_history_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  type_code public.type_code not null,
  period_label text,
  period_start date,
  period_end date,
  duration_category public.duration_category,
  still_current boolean not null default false,
  deep_need boolean not null default true,
  contextual_skill boolean not null default false,
  major_change boolean not null default false,
  historical_stress_evidence text,
  created_at timestamptz not null default now()
);

comment on table public.phase_history_answers is
  'Mini ligne de vie post-item-45 (matrice p.18). type_code est derive cote serveur par '
  'l''Edge Function a partir du rang 1 de l''item 45, jamais envoye par le candidat.';

create index phase_history_answers_submission_idx on public.phase_history_answers (submission_id);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  report_template_version text not null,
  scoring_version text not null,
  generated_by uuid references auth.users (id),
  generated_at timestamptz not null default now(),
  storage_path text,
  file_hash text,
  status public.report_status not null default 'generated',
  downloaded_at timestamptz,
  sent_at timestamptz,
  notes text check (char_length(notes) <= 5000)
);

comment on table public.reports is
  'Historique des rapports PDF generes manuellement par l''administrateur pour une soumission.';

create index reports_submission_idx on public.reports (submission_id);

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Liste blanche des comptes Supabase Auth autorises a acceder a l''espace administrateur. '
  'Voir docs/SUPABASE_SETUP.md : le compte doit exister ici en plus de Supabase Auth.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

comment on function public.is_admin() is
  'SECURITY DEFINER : evite la recursion RLS lors de la lecture de admin_users depuis une '
  'politique. search_path fixe pour eviter tout detournement.';
