import type { BuildingFloor, Contradiction, PhaseHistoryAnswer, TypeCode } from "./types.ts";
import { TYPE_CODES } from "./types.ts";
import { sortTypesByScoreDesc } from "./normalize.ts";
import {
  PHASE_VECUE_WEIGHTS,
  PHASE_VECUE_DURATION_WEIGHTS,
  PHASE_VECUE_CONFIRMATION_THRESHOLD
} from "./config.ts";

/**
 * Construit l'immeuble a six etages : la Base occupe toujours le rez-de-chaussee (etage 1),
 * les cinq autres types sont ordonnes par leur score de Structure (voir docs/SOURCE_MAPPING.md
 * §4.1 pour la justification de cette reconciliation entre score de Base et score de Structure).
 */
export function buildStructureFloors(
  baseTypeCode: TypeCode,
  structureScoresNormalized: Record<TypeCode, number>
): BuildingFloor[] {
  const orderedOthers = sortTypesByScoreDesc(structureScoresNormalized)
    .map((entry) => entry.typeCode)
    .filter((typeCode) => typeCode !== baseTypeCode);

  const orderedTypeCodes: TypeCode[] = [baseTypeCode, ...orderedOthers];

  return orderedTypeCodes.map((typeCode, index) => ({
    typeCode,
    floorIndex: index + 1,
    status: index === 0 ? "base" : "etage_accessible",
    displayPercent: index === 0 ? 100 : Math.round(structureScoresNormalized[typeCode]),
    structureScoreNormalized: structureScoresNormalized[typeCode]
  }));
}

interface ApplyPhaseInput {
  floors: BuildingFloor[];
  baseTypeCode: TypeCode;
  phaseTypeCode: TypeCode;
  phaseChangeEstablished: boolean;
  phaseHistory: PhaseHistoryAnswer | null;
  /** Score normalise (0-100) par type pour le bloc 8 seul, deja calcule par l'engine. */
  block8NormalizedScores: Record<TypeCode, number>;
}

interface ApplyPhaseResult {
  floors: BuildingFloor[];
  phasesVecues: BuildingFloor[];
  contradictions: Contradiction[];
}

/**
 * Applique le statut de Phase actuelle et evalue les Phases vecues potentielles/confirmees sur
 * la trajectoire contigue Base -> Phase actuelle (matrice p.2 et p.19 ; manuel p.65-67 -- voir
 * docs/SOURCE_MAPPING.md §1.1 et §2.1). Ne force jamais une confirmation : a defaut de preuve
 * suffisante, un etage intermediaire reste "potentiel", jamais "confirme" par defaut.
 */
export function applyPhaseAndPhasesVecues(input: ApplyPhaseInput): ApplyPhaseResult {
  const contradictions: Contradiction[] = [];
  const floors = input.floors.map((floor) => ({ ...floor }));

  const baseFloor = floors.find((floor) => floor.typeCode === input.baseTypeCode);
  if (baseFloor && !input.phaseChangeEstablished) {
    baseFloor.status = "base_et_phase_actuelle";
    return { floors, phasesVecues: [], contradictions };
  }

  const phaseFloor = floors.find((floor) => floor.typeCode === input.phaseTypeCode);
  if (!phaseFloor || !baseFloor) {
    // Ne devrait pas arriver (les 6 types sont toujours presents dans `floors`), mais on refuse
    // de deviner silencieusement plutot que de planter.
    return { floors, phasesVecues: [], contradictions };
  }

  phaseFloor.status = "phase_actuelle";
  phaseFloor.displayPercent = 100;

  const intermediateFloors = floors.filter(
    (floor) => floor.floorIndex > baseFloor.floorIndex && floor.floorIndex < phaseFloor.floorIndex
  );

  for (const floor of intermediateFloors) {
    floor.status = "phase_vecue_potentielle";
  }

  const phasesVecues: BuildingFloor[] = [];

  if (input.phaseHistory) {
    const matchingFloor = intermediateFloors.find(
      (floor) => floor.typeCode === input.phaseHistory!.typeCode
    );

    if (!matchingFloor) {
      contradictions.push({
        code: "phase_vecue_hors_trajectoire",
        message:
          `La ligne de vie declaree pointe vers ${input.phaseHistory.typeCode}, qui n'est pas ` +
          `un etage intermediaire entre la Base (${input.baseTypeCode}) et la Phase actuelle ` +
          `(${input.phaseTypeCode}) dans la Structure calculee. Incoherence signalee plutot que forcee.`
      });
    } else {
      const block8Component = input.block8NormalizedScores[matchingFloor.typeCode] / 100;
      const temporalComponent = input.phaseHistory.stillCurrent
        ? 0
        : PHASE_VECUE_DURATION_WEIGHTS[input.phaseHistory.durationCategory];
      const stressCoherenceComponent = input.phaseHistory.precededByDurableStressOrChange ? 1 : 0;

      const score =
        PHASE_VECUE_WEIGHTS.block8Answers * block8Component +
        PHASE_VECUE_WEIGHTS.temporalCoherence * temporalComponent +
        PHASE_VECUE_WEIGHTS.needsStressCoherence * stressCoherenceComponent;

      if (!input.phaseHistory.deepNeed) {
        contradictions.push({
          code: "phase_vecue_competence_contextuelle",
          message:
            `La periode declaree pour ${matchingFloor.typeCode} est identifiee comme une ` +
            "competence imposee par le contexte plutot qu'un besoin profond : non retenue comme Phase vecue confirmee."
        });
      } else if (score >= PHASE_VECUE_CONFIRMATION_THRESHOLD) {
        matchingFloor.status = "phase_vecue_confirmee";
        matchingFloor.displayPercent = 100;
        phasesVecues.push(matchingFloor);
      }
    }
  }

  return { floors, phasesVecues, contradictions };
}

export function allTypeCodesCovered(floors: BuildingFloor[]): boolean {
  const covered = new Set(floors.map((floor) => floor.typeCode));
  return TYPE_CODES.every((type) => covered.has(type));
}
