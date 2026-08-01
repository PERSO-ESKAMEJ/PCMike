/**
 * Contrat du payload envoye a l'Edge Function `submit-assessment`. Module pur (zod uniquement) :
 * importe a la fois par le front-end (validation avant envoi) et par l'Edge Function Deno
 * (validation autoritative -- voir supabase/functions/submit-assessment/index.ts). En Deno, le
 * specifier "zod" est resolu vers npm:zod via supabase/functions/import_map.json.
 */
import { z } from "zod";

export const ITEM_ANSWER_SCHEMA = z.object({
  itemId: z.number().int().min(1).max(45),
  rankedOptionIds: z.array(z.string().min(1)).max(6),
  explicitNoMatch: z.boolean(),
  /** Ordre de presentation des 6 options tel que vu par ce candidat (tracabilite / anti-biais). */
  presentedOptionOrder: z.array(z.string().min(1)).length(6)
});

/**
 * Le candidat ne connait jamais le code de type associe a sa reponse prioritaire de l'item 45
 * (la cle de correspondance est privee, cote serveur uniquement -- voir docs/SOURCE_MAPPING.md
 * §4.4). Le type de cette ligne de vie est donc derive par l'Edge Function a partir du rang 1 de
 * l'item 45, jamais envoye par le client.
 */
export const PHASE_HISTORY_SCHEMA = z.object({
  periodLabel: z.string().min(1).max(200),
  durationCategory: z.enum(["weeks", "months", "over_a_year", "several_years"]),
  stillCurrent: z.boolean(),
  deepNeed: z.boolean(),
  precededByDurableStressOrChange: z.boolean()
});

export const PARTICIPANT_SCHEMA = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional(),
  organization: z.string().trim().max(200).optional(),
  jobTitle: z.string().trim().max(200).optional(),
  comment: z.string().trim().max(2000).optional(),
  consentAt: z.string().datetime()
});

export const SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA = z.object({
  assessmentVersion: z.literal("v0.2"),
  idempotencyKey: z.string().uuid(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(60 * 60 * 6),
  participant: PARTICIPANT_SCHEMA,
  answers: z.array(ITEM_ANSWER_SCHEMA).length(45),
  phaseHistory: PHASE_HISTORY_SCHEMA.nullable(),
  /** Honeypot : doit rester vide. Rempli => bot probable, rejete silencieusement en succes factice. */
  website: z.string().max(0).optional().default(""),
  /** Horodatage cote client au premier rendu du formulaire, pour la verification de duree minimale. */
  formRenderedAt: z.string().datetime()
});

export type SubmitAssessmentPayload = z.infer<typeof SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA>;
export type ParticipantInput = z.infer<typeof PARTICIPANT_SCHEMA>;
export type ItemAnswerPayload = z.infer<typeof ITEM_ANSWER_SCHEMA>;

export const SUBMIT_ASSESSMENT_RESPONSE_SCHEMA = z.object({
  ok: z.literal(true),
  referenceCode: z.string(),
  submissionId: z.string().uuid()
});

export const SUBMIT_ASSESSMENT_ERROR_SCHEMA = z.object({
  ok: z.literal(false),
  error: z.string()
});

export type SubmitAssessmentResponse =
  | z.infer<typeof SUBMIT_ASSESSMENT_RESPONSE_SCHEMA>
  | z.infer<typeof SUBMIT_ASSESSMENT_ERROR_SCHEMA>;
