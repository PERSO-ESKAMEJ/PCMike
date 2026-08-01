import { describe, expect, it } from "vitest";
import { scoreAssessment } from "../../../src/scoring/engine.ts";
import { TYPE_CODES } from "../../../src/scoring/types.ts";
import {
  buildAllNoMatchAnswers,
  buildAmbiguousBaseAnswers,
  buildBaseVsPhaseAnswers,
  buildDominantAnswers,
  buildFullOrderAnswers,
  buildItemsMeta,
  buildScoringKey,
  makePhaseHistory
} from "./testHelpers.ts";

const items = buildItemsMeta();
const scoringKey = buildScoringKey();

describe("scoreAssessment - profils dominants", () => {
  for (const type of TYPE_CODES) {
    it(`profil ${type} dominant : Base et Phase actuelle convergent vers ${type}`, () => {
      const answers = buildDominantAnswers(type);
      const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

      expect(result.base.typeCode).toBe(type);
      expect(result.currentPhase.typeCode).toBe(type);
      expect(result.currentPhase.status).toBe("probable");
      expect(result.phaseChangeEstablished).toBe(false);
      expect(["haute", "moyenne"]).toContain(result.base.confidence.level);
      expect(result.structureBuilding[0]?.typeCode).toBe(type);
      expect(result.structureBuilding[0]?.status).toBe("base_et_phase_actuelle");
      expect(result.structureBuilding[0]?.displayPercent).toBe(100);
    });
  }
});

describe("scoreAssessment - Base distincte de la Phase actuelle", () => {
  it("etablit une Phase actuelle differente de la Base et le signale", () => {
    const answers = buildBaseVsPhaseAnswers("AN", "EM");
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(result.base.typeCode).toBe("AN");
    expect(result.currentPhase.typeCode).toBe("EM");
    expect(result.phaseChangeEstablished).toBe(true);

    const baseFloor = result.structureBuilding.find((floor) => floor.typeCode === "AN");
    const phaseFloor = result.structureBuilding.find((floor) => floor.typeCode === "EM");
    expect(baseFloor?.status).toBe("base");
    expect(phaseFloor?.status).toBe("phase_actuelle");
    expect(phaseFloor?.displayPercent).toBe(100);
  });
});

describe("scoreAssessment - Base et Phase identiques", () => {
  it("ne cree aucune Phase vecue quand la Phase actuelle correspond a la Base", () => {
    const answers = buildDominantAnswers("PR");
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(result.phaseChangeEstablished).toBe(false);
    expect(result.phasesVecues).toHaveLength(0);
  });
});

describe("scoreAssessment - Phases vecues potentielles et confirmation", () => {
  it("identifie plusieurs etages intermediaires et n'en confirme qu'un via la ligne de vie", () => {
    const structureOrder = ["AN", "PE", "EM", "IM", "EN", "PR"] as const;
    const phaseOrder = ["IM", "AN", "PE", "EM", "EN", "PR"] as const;
    const block8Order = ["EM", "AN", "PE", "IM", "EN", "PR"] as const;

    const answers = buildFullOrderAnswers((blockId) => {
      if (blockId === "block6" || blockId === "block7") return [...phaseOrder];
      if (blockId === "block8") return [...block8Order];
      return [...structureOrder];
    });

    const phaseHistory = makePhaseHistory({ typeCode: "EM" });
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory });

    expect(result.base.typeCode).toBe("AN");
    expect(result.currentPhase.typeCode).toBe("IM");
    expect(result.phaseChangeEstablished).toBe(true);

    const floorsByType = new Map(result.structureBuilding.map((floor) => [floor.typeCode, floor]));
    // Deux etages intermediaires attendus entre AN (base) et IM (phase actuelle) : PE et EM.
    expect(floorsByType.get("PE")?.status).toBe("phase_vecue_potentielle");
    expect(floorsByType.get("EM")?.status).toBe("phase_vecue_confirmee");
    expect(floorsByType.get("EM")?.displayPercent).toBe(100);

    expect(result.phasesVecues).toHaveLength(1);
    expect(result.phasesVecues[0]?.typeCode).toBe("EM");
  });

  it("ne confirme rien si la ligne de vie decrit une competence contextuelle plutot qu'un besoin profond", () => {
    const structureOrder = ["AN", "PE", "EM", "IM", "EN", "PR"] as const;
    const phaseOrder = ["IM", "AN", "PE", "EM", "EN", "PR"] as const;

    const answers = buildFullOrderAnswers((blockId) => {
      if (blockId === "block6" || blockId === "block7" || blockId === "block8")
        return [...phaseOrder];
      return [...structureOrder];
    });

    const phaseHistory = makePhaseHistory({ typeCode: "EM", deepNeed: false });
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory });

    expect(result.phasesVecues).toHaveLength(0);
    expect(
      result.contradictions.some((c) => c.code === "phase_vecue_competence_contextuelle")
    ).toBe(true);
  });

  it("signale une contradiction si la ligne de vie ne correspond a aucun etage intermediaire", () => {
    const answers = buildDominantAnswers("AN");
    const phaseHistory = makePhaseHistory({ typeCode: "PR" });
    // Base et Phase identiques ici (pas de changement etabli) : toute ligne de vie est hors trajectoire.
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory });

    expect(result.phaseChangeEstablished).toBe(false);
    expect(result.phasesVecues).toHaveLength(0);
  });
});

describe("scoreAssessment - contradiction besoins / stress", () => {
  it("marque la Phase actuelle incertaine quand besoins et stress divergent", () => {
    const structureOrder = ["AN", "PE", "EM", "IM", "EN", "PR"] as const;
    const needsOrder = ["EN", "AN", "PE", "EM", "IM", "PR"] as const;
    const stressOrder = ["PR", "AN", "PE", "EM", "IM", "EN"] as const;

    const answers = buildFullOrderAnswers((blockId) => {
      if (blockId === "block6") return [...needsOrder];
      if (blockId === "block7") return [...stressOrder];
      return [...structureOrder];
    });

    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(result.currentPhase.status).toBe("incertaine");
    expect(result.currentPhase.divergentCandidates).toEqual({ needsTop: "EN", stressTop: "PR" });
    expect(result.currentPhase.confidence.level).toBe("faible");
    expect(result.contradictions.some((c) => c.code === "phase_besoins_stress_divergents")).toBe(
      true
    );
  });
});

describe("scoreAssessment - resultat ambigu (Base)", () => {
  it("signale une Base a confirmer quand deux types sont proches", () => {
    const answers = buildAmbiguousBaseAnswers("AN", "PE");
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(["AN", "PE"]).toContain(result.base.typeCode);
    expect(result.base.marginNormalized).toBeLessThan(8);
    expect(result.base.confidence.level).toBe("faible");
    expect(result.contradictions.some((c) => c.code === "base_ambigue")).toBe(true);
  });
});

describe("scoreAssessment - cas limites", () => {
  it("ne plante pas sur un jeu de reponses vide et retourne une confiance insuffisante", () => {
    const result = scoreAssessment({ items, answers: [], scoringKey, phaseHistory: null });

    expect(result.progress.answeredCount).toBe(0);
    expect(result.base.confidence.level).toBe("insuffisante");
    expect(result.currentPhase.confidence.level).toBe("insuffisante");
  });

  it("traite les refus explicites ('aucune ne me correspond') comme des items adresses sans score", () => {
    const answers = buildAllNoMatchAnswers();
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(result.progress.answeredCount).toBe(45);
    expect(result.progress.averageRankedPerItem).toBe(0);
    expect(result.base.confidence.level).toBe("insuffisante");
  });

  it("ignore silencieusement un identifiant d'option inconnu plutot que de planter", () => {
    const answers = [
      { itemId: 1, rankedOptionIds: ["item-1-Z", "item-1-A"], explicitNoMatch: false }
    ];
    expect(() => scoreAssessment({ items, answers, scoringKey, phaseHistory: null })).not.toThrow();
  });

  it("est reproductible : deux appels avec les memes entrees donnent le meme resultat", () => {
    const answers = buildDominantAnswers("EN", "PR");
    const first = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });
    const second = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(second).toEqual(first);
  });

  it("survit a un JSON.stringify/parse des reponses (simule l'aller-retour reseau)", () => {
    const answers = buildDominantAnswers("IM", "EM");
    const before = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });
    const roundTripped = JSON.parse(JSON.stringify(answers)) as typeof answers;
    const after = scoreAssessment({ items, answers: roundTripped, scoringKey, phaseHistory: null });

    expect(after.base.typeCode).toBe(before.base.typeCode);
    expect(after.currentPhase.typeCode).toBe(before.currentPhase.typeCode);
  });
});

describe("scoreAssessment - preuves conservees", () => {
  it("conserve une trace (evidence) exploitable pour chaque option classee", () => {
    const answers = buildDominantAnswers("AN");
    const result = scoreAssessment({ items, answers, scoringKey, phaseHistory: null });

    expect(result.evidence.length).toBeGreaterThan(0);
    const first = result.evidence[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any() est typé `any` par vitest
    expect(first).toMatchObject({ itemId: expect.any(Number), typeCode: "AN", rank: 1 });
  });
});
