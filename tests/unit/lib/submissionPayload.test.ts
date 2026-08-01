import { describe, expect, it } from "vitest";
import {
  SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA,
  PARTICIPANT_SCHEMA
} from "../../../src/lib/submissionPayload.ts";
import { RAW_ITEMS } from "../../../supabase/seed/items.v0.2.ts";

function buildValidPayload() {
  const now = new Date().toISOString();
  return {
    assessmentVersion: "v0.2" as const,
    idempotencyKey: crypto.randomUUID(),
    startedAt: now,
    completedAt: now,
    durationSeconds: 900,
    participant: {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      consentAt: now
    },
    answers: RAW_ITEMS.map((item) => ({
      itemId: item.id,
      rankedOptionIds: [`item-${item.id}-${item.options[0].letter}`],
      explicitNoMatch: false,
      presentedOptionOrder: item.options.map((option) => `item-${item.id}-${option.letter}`)
    })),
    phaseHistory: null,
    website: "",
    formRenderedAt: now
  };
}

describe("SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA", () => {
  it("accepte un payload complet et valide", () => {
    const result = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(buildValidPayload());
    expect(result.success).toBe(true);
  });

  it("rejette un payload avec moins de 45 reponses", () => {
    const payload = buildValidPayload();
    payload.answers = payload.answers.slice(0, 44);
    const result = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejette un champ honeypot non vide", () => {
    const payload = { ...buildValidPayload(), website: "http://spam.example" };
    const result = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejette une adresse e-mail invalide", () => {
    const payload = buildValidPayload();
    payload.participant.email = "pas-un-email";
    const result = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejette un ordre de presentation qui n'a pas exactement 6 options", () => {
    const payload = buildValidPayload();
    payload.answers[0].presentedOptionOrder = payload.answers[0].presentedOptionOrder.slice(0, 5);
    const result = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("accepte un participant sans champs facultatifs", () => {
    const result = PARTICIPANT_SCHEMA.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      consentAt: new Date().toISOString()
    });
    expect(result.success).toBe(true);
  });

  it("n'exige pas de code de type dans phaseHistory (donnee que le candidat ne connait pas)", () => {
    const payload = {
      ...buildValidPayload(),
      phaseHistory: {
        periodLabel: "il y a deux ans",
        durationCategory: "over_a_year" as const,
        stillCurrent: false,
        deepNeed: true,
        precededByDurableStressOrChange: true
      }
    };
    const result = SUBMIT_ASSESSMENT_PAYLOAD_SCHEMA.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
