// Edge Function admin uniquement : recalcule le resultat d'une soumission archivee avec une
// version de scoring precise, sans jamais modifier les reponses brutes d'origine.
// Deploiement : supabase functions deploy recalculate-submission
// (verify_jwt=true est deja declare dans supabase/config.toml : un JWT Supabase Auth valide est
// exige par la plateforme avant meme d'atteindre ce code).

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { scoreAssessment } from "../../../src/scoring/engine.ts";
import type {
  ItemAnswer,
  ItemMeta,
  PhaseHistoryAnswer,
  ScoringKey,
  TypeCode
} from "../../../src/scoring/types.ts";
import { ASSESSMENT_ITEMS } from "../../../src/data/assessment.items.v0.2.ts";
import { CORS_HEADERS, errorResponse, jsonResponse } from "../_shared/http.ts";

const REQUEST_SCHEMA = z.object({
  submissionId: z.string().uuid()
});

const ITEMS: ItemMeta[] = ASSESSMENT_ITEMS.map((item) => ({ id: item.id, blockId: item.blockId }));

function adminClientFromRequest(request: Request) {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Configuration serveur manquante.");
  const authorization = request.headers.get("Authorization") ?? "";
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } }
  });
}

function serviceRoleClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) throw new Error("Configuration serveur manquante.");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return errorResponse(405, "Méthode non autorisée.");
  }

  // Verifie l'appartenance a admin_users avec le JWT de l'appelant : la politique RLS
  // "self_read_admin_membership" n'autorise chacun qu'a lire sa propre ligne, ce qui suffit ici.
  const callerClient = adminClientFromRequest(request);
  const { data: authData } = await callerClient.auth.getUser();
  if (!authData?.user) {
    return errorResponse(401, "Authentification requise.");
  }
  const { data: adminRow } = await callerClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (!adminRow) {
    return errorResponse(403, "Compte non autorisé.");
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(400, "Corps de requête JSON invalide.");
  }
  const parsed = REQUEST_SCHEMA.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse(400, "Payload invalide.");
  }

  const supabase = serviceRoleClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, raw_payload_snapshot, option_order_snapshot")
    .eq("id", parsed.data.submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return errorResponse(404, "Soumission introuvable.");
  }

  const { data: scoringKeyRows, error: scoringKeyError } = await supabase
    .from("scoring_key")
    .select("item_id, option_id, type_code");
  if (scoringKeyError || !scoringKeyRows) {
    return errorResponse(500, "Configuration de scoring indisponible.");
  }
  const scoringKey: ScoringKey = new Map(
    scoringKeyRows.map((row) => [row.option_id as string, row.type_code as TypeCode])
  );

  const rawPayload = submission.raw_payload_snapshot as {
    answers: Array<{ itemId: number; rankedOptionIds: string[]; explicitNoMatch: boolean }>;
    phaseHistory: Omit<PhaseHistoryAnswer, "typeCode"> | null;
  };

  const answers: ItemAnswer[] = rawPayload.answers.map((answer) => ({
    itemId: answer.itemId,
    rankedOptionIds: answer.rankedOptionIds,
    explicitNoMatch: answer.explicitNoMatch
  }));

  let phaseHistory: PhaseHistoryAnswer | null = null;
  const item45 = rawPayload.answers.find((answer) => answer.itemId === 45);
  const item45TopOptionId = item45?.rankedOptionIds[0];
  if (rawPayload.phaseHistory && item45TopOptionId) {
    const typeCode = scoringKey.get(item45TopOptionId);
    if (typeCode) {
      phaseHistory = { typeCode, ...rawPayload.phaseHistory };
    }
  }

  const result = scoreAssessment({ items: ITEMS, answers, scoringKey, phaseHistory });

  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      result_snapshot: result,
      confidence_snapshot: { base: result.base.confidence, phase: result.currentPhase.confidence },
      scoring_version: result.scoringVersion,
      status: "calculated"
    })
    .eq("id", submission.id);

  if (updateError) {
    return errorResponse(500, "Échec de la mise à jour.");
  }

  return jsonResponse({ ok: true, result });
});
