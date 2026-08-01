-- Row Level Security. Principes (docs/PRIVACY_AND_SECURITY.md) :
--   * les visiteurs anonymes ne lisent ni n'ecrivent aucune donnee personnelle ni resultat ;
--   * l'ecriture d'une soumission passe exclusivement par l'Edge Function submit-assessment,
--     qui utilise la service_role key (laquelle contourne RLS -- aucune politique n'est donc
--     necessaire pour elle) ;
--   * seul un utilisateur authentifie present dans admin_users peut lire les donnees candidates ;
--   * scoring_key et admin_users restent verrouillees a toute ecriture cote client, quel que
--     soit le role.

alter table public.assessment_versions enable row level security;
alter table public.participants enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_answers enable row level security;
alter table public.phase_history_answers enable row level security;
alter table public.reports enable row level security;
alter table public.admin_users enable row level security;
alter table public.scoring_key enable row level security;

-- ---------------------------------------------------------------------------
-- assessment_versions : lecture de la version active ouverte (metadonnee non sensible),
-- necessaire au front public pour connaitre la version courante du questionnaire.
-- ---------------------------------------------------------------------------
create policy "public_read_active_version"
  on public.assessment_versions
  for select
  to anon, authenticated
  using (is_active);

create policy "admin_read_all_versions"
  on public.assessment_versions
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- participants : admin uniquement. Aucun acces anonyme, aucun insert direct (passe par
-- l'Edge Function via service_role).
-- ---------------------------------------------------------------------------
create policy "admin_select_participants"
  on public.participants
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_update_participants"
  on public.participants
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_participants"
  on public.participants
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- submissions : admin uniquement en lecture/mise a jour de statut. Le recalcul du resultat
-- passe par l'Edge Function recalculate-submission (service_role), pas par une ecriture directe.
-- ---------------------------------------------------------------------------
create policy "admin_select_submissions"
  on public.submissions
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_update_submissions"
  on public.submissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_submissions"
  on public.submissions
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- submission_answers / phase_history_answers : lecture admin uniquement, suppression admin
-- necessaire pour que les cascades de suppression (depuis participants/submissions) fonctionnent
-- lorsqu'elles sont declenchees par un administrateur authentifie.
-- ---------------------------------------------------------------------------
create policy "admin_select_submission_answers"
  on public.submission_answers
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_delete_submission_answers"
  on public.submission_answers
  for delete
  to authenticated
  using (public.is_admin());

create policy "admin_select_phase_history_answers"
  on public.phase_history_answers
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_delete_phase_history_answers"
  on public.phase_history_answers
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reports : la generation du PDF a lieu dans le navigateur de l'administrateur (pas de
-- generation cote candidat ni cote Edge Function) -- l'admin ecrit donc directement cette table.
-- ---------------------------------------------------------------------------
create policy "admin_select_reports"
  on public.reports
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_insert_reports"
  on public.reports
  for insert
  to authenticated
  with check (public.is_admin());

create policy "admin_update_reports"
  on public.reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_reports"
  on public.reports
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- admin_users : chaque admin peut verifier sa propre appartenance (necessaire a useAdminSession).
-- Aucune politique d'ecriture pour aucun role : la gestion des administrateurs est un acte manuel
-- documente dans docs/SUPABASE_SETUP.md, jamais une action realisable depuis le bundle client.
-- ---------------------------------------------------------------------------
create policy "self_read_admin_membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- scoring_key : aucune politique pour anon/authenticated => acces totalement refuse a ces
-- roles une fois RLS active. Seul service_role (Edge Functions) peut la lire.
-- ---------------------------------------------------------------------------
