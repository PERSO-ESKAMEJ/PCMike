// Edge Function publique : point d'entree unique et autoritatif pour enregistrer une soumission
// complete du questionnaire. Voir docs/ARCHITECTURE.md §5 et docs/SUPABASE_SETUP.md.
//
// Deploiement : supabase functions deploy submit-assessment --no-verify-jwt
// (verify_jwt=false est deja declare dans supabase/config.toml).

import { createClient } from "@supabase/supabase-js";
import { SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA } from "../../../src/lib/submissionPayload.ts";
import { ASSESSMENT_ITEMS } from "../../../src/data/assessment.items.v0.2.ts";
import { scoreAssessment } from "../../../src/scoring/engine.ts";
import type {
  ItemMeta,
  PhaseHistoryAnswer,
  ScoringKey,
  TypeCode
} from "../../../src/scoring/types.ts";
import { CORS_HEADERS, errorResponse, jsonResponse } from "../_shared/http.ts";

const MAX_PAYLOAD_BYTES = 200_000; // largement suffisant pour 45 reponses + identite candidat
const MIN_FORM_DURATION_SECONDS = 45; // un humain ne remplit pas 45 items en moins de 45s

const ITEMS_BY_ID = new Map<number, ItemMeta>(
  ASSESSMENT_ITEMS.map((item) => [item.id, { id: item.id, blockId: item.blockId }])
);
const VALID_OPTION_IDS_BY_ITEM = new Map<number, Set<string>>(
  ASSESSMENT_ITEMS.map((item) => [item.id, new Set(item.options.map((option) => option.id))])
);

function supabaseAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Configuration serveur manquante (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function validateAnswersStructure(
  answers: { itemId: number; rankedOptionIds: string[]; presentedOptionOrder: string[] }[]
): string | null {
  const seenItemIds = new Set<number>();

  for (const answer of answers) {
    if (seenItemIds.has(answer.itemId)) {
      return `Item ${answer.itemId} soumis plusieurs fois.`;
    }
    seenItemIds.add(answer.itemId);

    const validOptionIds = VALID_OPTION_IDS_BY_ITEM.get(answer.itemId);
    if (!validOptionIds) {
      return `Item inconnu : ${answer.itemId}.`;
    }

    const presentedSet = new Set(answer.presentedOptionOrder);
    if (presentedSet.size !== 6 || ![...presentedSet].every((id) => validOptionIds.has(id))) {
      return `Ordre de présentation invalide pour l'item ${answer.itemId}.`;
    }

    const rankedSet = new Set(answer.rankedOptionIds);
    if (rankedSet.size !== answer.rankedOptionIds.length) {
      return `Proposition classée en double pour l'item ${answer.itemId}.`;
    }
    if (![...rankedSet].every((id) => validOptionIds.has(id))) {
      return `Identifiant de proposition invalide pour l'item ${answer.itemId}.`;
    }
  }

  for (let itemId = 1; itemId <= 45; itemId += 1) {
    if (!seenItemIds.has(itemId)) {
      return `Item manquant : ${itemId}.`;
    }
  }

  return null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return errorResponse(405, "Méthode non autorisée.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return errorResponse(413, "Requête trop volumineuse.");
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(400, "Corps de requête JSON invalide.");
  }

  const parsed = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse(400, "Payload invalide.");
  }
  const payload = parsed.data;

  // Honeypot : un bot remplit generalement tous les champs, y compris les champs caches.
  if (payload.website) {
    // Reponse de succes factice pour ne pas indiquer au bot que sa soumission a ete detectee.
    return jsonResponse({
      ok: true,
      referenceCode: "QPC-000000",
      submissionId: crypto.randomUUID()
    });
  }

  const formDurationSeconds =
    (Date.parse(payload.completedAt) - Date.parse(payload.formRenderedAt)) / 1000;
  if (!Number.isFinite(formDurationSeconds) || formDurationSeconds < MIN_FORM_DURATION_SECONDS) {
    return errorResponse(400, "Soumission rejetée (durée insuffisante).");
  }

  const structureError = validateAnswersStructure(payload.answers);
  if (structureError) {
    return errorResponse(400, structureError);
  }

  const supabase = supabaseAdminClient();

  const { data: activeVersion, error: versionError } = await supabase
    .from("assessment_versions")
    .select("id, scoring_version")
    .eq("questionnaire_version", payload.assessmentVersion)
    .eq("is_active", true)
    .maybeSingle();

  if (versionError || !activeVersion) {
    return errorResponse(409, "Version du questionnaire inactive ou inconnue.");
  }

  const { data: scoringKeyRows, error: scoringKeyError } = await supabase
    .from("scoring_key")
    .select("item_id, option_id, type_code");

  if (scoringKeyError || !scoringKeyRows || scoringKeyRows.length === 0) {
    console.error("scoring_key indisponible", scoringKeyError);
    return errorResponse(500, "Configuration de scoring indisponible.");
  }

  const scoringKey: ScoringKey = new Map(
    scoringKeyRows.map((row) => [row.option_id as string, row.type_code as TypeCode])
  );

  const items: ItemMeta[] = [...ITEMS_BY_ID.values()];

  let phaseHistory: PhaseHistoryAnswer | null = null;
  const item45Answer = payload.answers.find((answer) => answer.itemId === 45);
  const item45TopOptionId = item45Answer?.rankedOptionIds[0];
  if (payload.phaseHistory && item45TopOptionId) {
    const typeCode = scoringKey.get(item45TopOptionId);
    if (typeCode) {
      phaseHistory = { typeCode, ...payload.phaseHistory };
    }
  }

  const result = scoreAssessment({
    items,
    answers: payload.answers.map((answer) => ({
      itemId: answer.itemId,
      rankedOptionIds: answer.rankedOptionIds,
      explicitNoMatch: answer.explicitNoMatch
    })),
    scoringKey,
    phaseHistory
  });

  const rpcAnswers = payload.answers.map((answer) => ({
    item_id: answer.itemId,
    ranked_option_ids: answer.rankedOptionIds,
    unranked_option_ids: answer.presentedOptionOrder.filter(
      (id) => !answer.rankedOptionIds.includes(id)
    ),
    explicit_no_match: answer.explicitNoMatch,
    presented_option_order: answer.presentedOptionOrder
  }));

  const rpcPhaseHistory = phaseHistory
    ? {
        type_code: phaseHistory.typeCode,
        period_label: phaseHistory.periodLabel,
        duration_category: phaseHistory.durationCategory,
        still_current: phaseHistory.stillCurrent,
        deep_need: phaseHistory.deepNeed,
        contextual_skill: !phaseHistory.deepNeed,
        major_change: phaseHistory.precededByDurableStressOrChange
      }
    : null;

  const { data: rpcResult, error: rpcError } = await supabase
    .rpc("record_submission", {
      p_idempotency_key: payload.idempotencyKey,
      p_assessment_version_id: activeVersion.id,
      p_scoring_version: result.scoringVersion,
      p_started_at: payload.startedAt,
      p_completed_at: payload.completedAt,
      p_duration_seconds: payload.durationSeconds,
      p_option_order_snapshot: Object.fromEntries(
        payload.answers.map((answer) => [answer.itemId, answer.presentedOptionOrder])
      ),
      p_raw_payload_snapshot: { answers: payload.answers, phaseHistory: payload.phaseHistory },
      p_result_snapshot: result,
      p_confidence_snapshot: {
        base: result.base.confidence,
        phase: result.currentPhase.confidence
      },
      p_first_name: payload.participant.firstName,
      p_last_name: payload.participant.lastName,
      p_email: payload.participant.email,
      p_phone: payload.participant.phone ?? null,
      p_organization: payload.participant.organization ?? null,
      p_job_title: payload.participant.jobTitle ?? null,
      p_comment: payload.participant.comment ?? null,
      p_consent_at: payload.participant.consentAt,
      p_answers: rpcAnswers,
      p_phase_history: rpcPhaseHistory
    })
    .single();

  if (rpcError || !rpcResult) {
    console.error("record_submission a échoué", rpcError);
    return errorResponse(500, "Échec de l'enregistrement.");
  }

  return jsonResponse({
    ok: true,
    referenceCode: rpcResult.out_reference_code,
    submissionId: rpcResult.out_submission_id
  });
});
