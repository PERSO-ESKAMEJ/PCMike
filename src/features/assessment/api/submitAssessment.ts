import { supabase } from "@/lib/supabase";
import {
  SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA,
  type SubmitAssessmentPayload
} from "@/lib/submissionPayload";
import { ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";
import type { AssessmentDraft } from "../state/draftStore";

export interface SubmitResult {
  ok: true;
  referenceCode: string;
}

export interface SubmitFailure {
  ok: false;
  error: string;
  /** true si l'echec est probablement transitoire (reseau) et qu'un nouvel essai est raisonnable. */
  retryable: boolean;
}

function buildPayload(draft: AssessmentDraft): SubmitAssessmentPayload {
  const now = new Date().toISOString();
  const durationSeconds = Math.max(
    0,
    Math.round((Date.parse(now) - Date.parse(draft.startedAt)) / 1000)
  );

  return {
    assessmentVersion: "v0.2",
    idempotencyKey: draft.idempotencyKey,
    startedAt: draft.startedAt,
    completedAt: now,
    durationSeconds,
    participant: {
      firstName: draft.participant.firstName,
      lastName: draft.participant.lastName,
      email: draft.participant.email,
      phone: draft.participant.phone || undefined,
      organization: draft.participant.organization || undefined,
      jobTitle: draft.participant.jobTitle || undefined,
      comment: draft.participant.comment || undefined,
      consentAt: now
    },
    answers: ASSESSMENT_ITEMS.map((item) => {
      const answer = draft.answers[item.id] ?? { rankedOptionIds: [], explicitNoMatch: false };
      return {
        itemId: item.id,
        rankedOptionIds: answer.rankedOptionIds,
        explicitNoMatch: answer.explicitNoMatch,
        presentedOptionOrder: draft.presentedOptionOrder[item.id] ?? item.options.map((o) => o.id)
      };
    }),
    phaseHistory: draft.phaseHistory,
    website: "",
    formRenderedAt: draft.formRenderedAt
  };
}

export async function submitAssessment(
  draft: AssessmentDraft
): Promise<SubmitResult | SubmitFailure> {
  const payload = buildPayload(draft);
  const parsed = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      retryable: false,
      error: "Le questionnaire est incomplet ou invalide. Vérifie chaque section avant l'envoi."
    };
  }

  try {
    const response = await supabase.functions.invoke<{
      ok: boolean;
      referenceCode?: string;
      error?: string;
    }>("submit-assessment", { body: parsed.data });
    const data = response.data;
    const error: unknown = response.error;

    if (error) {
      return {
        ok: false,
        retryable: true,
        error: "Envoi impossible pour le moment. Réessaie dans un instant."
      };
    }

    if (!data?.ok || !data.referenceCode) {
      return {
        ok: false,
        retryable: false,
        error: data?.error ?? "Le serveur a refusé la soumission."
      };
    }

    return { ok: true, referenceCode: data.referenceCode };
  } catch {
    return {
      ok: false,
      retryable: true,
      error:
        "Connexion impossible. Tes réponses restent enregistrées sur cet appareil : réessaie quand la connexion revient."
    };
  }
}
