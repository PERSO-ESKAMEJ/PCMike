-- Ecriture atomique d'une soumission complete (participant + submission + reponses + ligne de
-- vie) en une seule transaction logique (mission §7.9), appelee exclusivement par l'Edge
-- Function submit-assessment via service_role. Le calcul du score reste dans le moteur
-- TypeScript partage (src/scoring/engine.ts) : cette fonction ne fait qu'ecrire un resultat deja
-- calcule et valide, elle ne recalcule rien elle-meme.

create or replace function public.record_submission(
  p_idempotency_key uuid,
  p_assessment_version_id uuid,
  p_scoring_version text,
  p_started_at timestamptz,
  p_completed_at timestamptz,
  p_duration_seconds integer,
  p_option_order_snapshot jsonb,
  p_raw_payload_snapshot jsonb,
  p_result_snapshot jsonb,
  p_confidence_snapshot jsonb,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_organization text,
  p_job_title text,
  p_comment text,
  p_consent_at timestamptz,
  p_answers jsonb,
  p_phase_history jsonb
)
returns table (out_submission_id uuid, out_reference_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_submission_id uuid;
  v_existing_reference_code text;
  v_participant_id uuid;
  v_reference_code text;
  v_submission_id uuid;
  v_answer jsonb;
begin
  -- Idempotence : une soumission deja enregistree avec cette cle est retournee telle quelle,
  -- sans creer de second candidat ni de seconde ligne (mission §3.2 et §7.10).
  select s.id, p.reference_code
    into v_existing_submission_id, v_existing_reference_code
    from public.submissions s
    join public.participants p on p.id = s.participant_id
   where s.idempotency_key = p_idempotency_key;

  if v_existing_submission_id is not null then
    return query select v_existing_submission_id, v_existing_reference_code;
    return;
  end if;

  insert into public.participants (
    first_name, last_name, email, phone, organization, job_title, comment, consent_at
  ) values (
    p_first_name, p_last_name, p_email, nullif(p_phone, ''), nullif(p_organization, ''),
    nullif(p_job_title, ''), nullif(p_comment, ''), p_consent_at
  )
  returning id, reference_code into v_participant_id, v_reference_code;

  insert into public.submissions (
    participant_id, assessment_version, scoring_version, status, started_at, completed_at,
    duration_seconds, idempotency_key, option_order_snapshot, raw_payload_snapshot,
    result_snapshot, confidence_snapshot
  ) values (
    v_participant_id, p_assessment_version_id, p_scoring_version, 'calculated', p_started_at,
    p_completed_at, p_duration_seconds, p_idempotency_key, p_option_order_snapshot,
    p_raw_payload_snapshot, p_result_snapshot, p_confidence_snapshot
  )
  returning id into v_submission_id;

  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    insert into public.submission_answers (
      submission_id, item_id, ranked_option_ids, unranked_option_ids, explicit_no_match,
      presented_option_order
    ) values (
      v_submission_id,
      (v_answer ->> 'item_id')::integer,
      coalesce(array(select jsonb_array_elements_text(v_answer -> 'ranked_option_ids')), '{}'),
      coalesce(array(select jsonb_array_elements_text(v_answer -> 'unranked_option_ids')), '{}'),
      (v_answer ->> 'explicit_no_match')::boolean,
      array(select jsonb_array_elements_text(v_answer -> 'presented_option_order'))
    );
  end loop;

  if p_phase_history is not null then
    insert into public.phase_history_answers (
      submission_id, type_code, period_label, duration_category, still_current, deep_need,
      contextual_skill, major_change
    ) values (
      v_submission_id,
      (p_phase_history ->> 'type_code')::public.type_code,
      nullif(p_phase_history ->> 'period_label', ''),
      (p_phase_history ->> 'duration_category')::public.duration_category,
      (p_phase_history ->> 'still_current')::boolean,
      (p_phase_history ->> 'deep_need')::boolean,
      (p_phase_history ->> 'contextual_skill')::boolean,
      (p_phase_history ->> 'major_change')::boolean
    );
  end if;

  return query select v_submission_id, v_reference_code;
end;
$$;

comment on function public.record_submission is
  'Ecriture transactionnelle unique d''une soumission. Reservee au service_role -- voir les '
  'GRANT/REVOKE ci-dessous. Ne calcule rien : recoit un resultat deja produit par '
  'src/scoring/engine.ts cote Edge Function.';

revoke execute on function public.record_submission from public, anon, authenticated;
grant execute on function public.record_submission to service_role;
