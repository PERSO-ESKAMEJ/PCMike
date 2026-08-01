/**
 * Moteur de scoring pur -- point d'entree unique, importe tel quel par l'Edge Function
 * `submit-assessment` (Deno) et par les tests unitaires. Aucune dependance React/DOM/Supabase.
 * Voir docs/ARCHITECTURE.md §4 et docs/SCORING.md pour le detail des regles.
 */

import type {
  BlockId,
  Contradiction,
  Evidence,
  ItemAnswer,
  ItemMeta,
  PhaseHistoryAnswer,
  ScoringKey,
  ScoringResult,
  TypeCode,
  TypeScoreBoard
} from "./types.ts";
import { TYPE_CODES, TYPE_NAMES } from "./types.ts";
import {
  ASSESSMENT_VERSION,
  SCORING_VERSION,
  RANK_WEIGHTS,
  BASE_SCORE_BLOCK_WEIGHTS,
  STRUCTURE_SCORE_BLOCK_WEIGHTS,
  CURRENT_PHASE_BLOCK_WEIGHTS,
  BASE_AMBIGUITY_THRESHOLD_NORMALIZED
} from "./config.ts";
import {
  normalizeBlockScores,
  weightedCombine,
  rescaleForDisplay,
  sortTypesByScoreDesc,
  argmax
} from "./normalize.ts";
import { computeConfidence } from "./confidence.ts";
import { buildStructureFloors, applyPhaseAndPhasesVecues } from "./phases.ts";

const ALL_BLOCK_IDS: BlockId[] = [
  "block1",
  "block2",
  "block3",
  "block4",
  "block5",
  "block6",
  "block7",
  "block8"
];

function emptyTypeRecord(): Record<TypeCode, number> {
  const record = {} as Record<TypeCode, number>;
  for (const type of TYPE_CODES) record[type] = 0;
  return record;
}

function evidenceTarget(blockId: BlockId): Evidence["target"] {
  if (blockId === "block6") return "phase_besoins";
  if (blockId === "block7") return "phase_stress";
  if (blockId === "block8") return "phasage";
  return "base_structure";
}

function toTypeScoreBoard(
  raw: Record<TypeCode, number>,
  normalized: Record<TypeCode, number>
): TypeScoreBoard {
  const board = {} as TypeScoreBoard;
  for (const type of TYPE_CODES) {
    board[type] = { typeCode: type, raw: raw[type], normalized: normalized[type] };
  }
  return board;
}

export interface ScoreAssessmentInput {
  items: ItemMeta[];
  answers: ItemAnswer[];
  scoringKey: ScoringKey;
  phaseHistory: PhaseHistoryAnswer | null;
}

export function scoreAssessment(input: ScoreAssessmentInput): ScoringResult {
  const itemsById = new Map(input.items.map((item) => [item.id, item]));

  const blockRawScores: Record<BlockId, Record<TypeCode, number>> = ALL_BLOCK_IDS.reduce(
    (acc, blockId) => ({ ...acc, [blockId]: emptyTypeRecord() }),
    {} as Record<BlockId, Record<TypeCode, number>>
  );

  const evidence: Evidence[] = [];
  let totalRankedOptions = 0;
  let totalItemsAddressed = 0;

  for (const answer of input.answers) {
    const item = itemsById.get(answer.itemId);
    if (!item) continue;

    const isAddressed = answer.explicitNoMatch || answer.rankedOptionIds.length > 0;
    if (isAddressed) totalItemsAddressed += 1;

    answer.rankedOptionIds.forEach((optionId, index) => {
      const typeCode = input.scoringKey.get(optionId);
      if (!typeCode) return; // option inconnue : ignoree defensivement, jamais fatale ici

      const rankWeight = RANK_WEIGHTS[index] ?? 0;
      const evidenceValue = rankWeight * (item.weight ?? 1);

      blockRawScores[item.blockId][typeCode] += evidenceValue;
      totalRankedOptions += 1;

      evidence.push({
        itemId: item.id,
        optionId,
        typeCode,
        blockId: item.blockId,
        rank: index + 1,
        rankWeight,
        target: evidenceTarget(item.blockId)
      });
    });
  }

  const normalizedByBlock: Partial<Record<BlockId, Record<TypeCode, number>>> = {};
  for (const blockId of ALL_BLOCK_IDS) {
    normalizedByBlock[blockId] = normalizeBlockScores(blockRawScores[blockId]);
  }

  const baseRaw = weightedCombine(normalizedByBlock, BASE_SCORE_BLOCK_WEIGHTS);
  const baseDisplay = rescaleForDisplay(baseRaw);
  const baseScores = toTypeScoreBoard(baseRaw, baseDisplay);

  const structureRaw = weightedCombine(normalizedByBlock, STRUCTURE_SCORE_BLOCK_WEIGHTS);
  const structureDisplay = rescaleForDisplay(structureRaw);
  const structureScores = toTypeScoreBoard(structureRaw, structureDisplay);

  const currentPhaseRaw = weightedCombine(normalizedByBlock, CURRENT_PHASE_BLOCK_WEIGHTS);
  const currentPhaseDisplay = rescaleForDisplay(currentPhaseRaw);
  const currentPhaseScores = toTypeScoreBoard(currentPhaseRaw, currentPhaseDisplay);

  const averageRankedPerItem =
    totalItemsAddressed > 0 ? totalRankedOptions / totalItemsAddressed : 0;

  // --- Base ---
  const sortedBase = sortTypesByScoreDesc(baseDisplay);
  const baseTypeCode = sortedBase[0].typeCode;
  const baseAlternative = sortedBase[1]?.typeCode ?? null;
  const baseMargin = sortedBase[0].value - (sortedBase[1]?.value ?? sortedBase[0].value);

  const secondaryBaseBlocks: BlockId[] = ["block2", "block3", "block4", "block5"];
  const agreeingSecondaryBlocks = secondaryBaseBlocks.filter(
    (blockId) => argmax(normalizedByBlock[blockId]!) === baseTypeCode
  ).length;
  const baseBlockCoherence = agreeingSecondaryBlocks / secondaryBaseBlocks.length;

  const baseConfidence = computeConfidence({
    marginNormalized: baseMargin,
    averageRankedPerItem,
    blockCoherence: baseBlockCoherence
  });

  const contradictions: Contradiction[] = [];
  if (baseMargin < BASE_AMBIGUITY_THRESHOLD_NORMALIZED) {
    contradictions.push({
      code: "base_ambigue",
      message: `Base à confirmer : écart de ${baseMargin.toFixed(1)} points normalisés entre ${TYPE_NAMES[baseTypeCode]} et ${baseAlternative ? TYPE_NAMES[baseAlternative] : "le second candidat"} (< ${BASE_AMBIGUITY_THRESHOLD_NORMALIZED}).`
    });
  }

  // --- Phase actuelle ---
  const needsTopType = argmax(normalizedByBlock.block6!);
  const stressTopType = argmax(normalizedByBlock.block7!);
  const sortedPhase = sortTypesByScoreDesc(currentPhaseDisplay);
  const phaseMargin = sortedPhase[0].value - (sortedPhase[1]?.value ?? sortedPhase[0].value);

  const phaseAgrees = needsTopType === stressTopType;
  const phaseTypeCode = phaseAgrees ? needsTopType : sortedPhase[0].typeCode;

  const phaseConfidence = computeConfidence({
    marginNormalized: phaseMargin,
    averageRankedPerItem,
    blockCoherence: phaseAgrees ? 1 : 0,
    forcedLowConfidence: !phaseAgrees
  });

  if (!phaseAgrees) {
    contradictions.push({
      code: "phase_besoins_stress_divergents",
      message: `Les besoins actuels (bloc 6) désignent ${TYPE_NAMES[needsTopType]} tandis que le stress actuel (bloc 7) désigne ${TYPE_NAMES[stressTopType]} : Phase actuelle incertaine, non tranchée arbitrairement.`
    });
  }

  const currentPhase = {
    typeCode: phaseTypeCode,
    status: phaseAgrees ? ("probable" as const) : ("incertaine" as const),
    confidence: phaseConfidence,
    ...(phaseAgrees
      ? {}
      : { divergentCandidates: { needsTop: needsTopType, stressTop: stressTopType } })
  };

  const phaseChangeEstablished = phaseTypeCode !== baseTypeCode;

  // --- Structure (immeuble) + Phases vécues ---
  const floorsBase = buildStructureFloors(baseTypeCode, structureDisplay);
  const {
    floors,
    phasesVecues,
    contradictions: phaseContradictions
  } = applyPhaseAndPhasesVecues({
    floors: floorsBase,
    baseTypeCode,
    phaseTypeCode,
    phaseChangeEstablished,
    phaseHistory: input.phaseHistory,
    block8NormalizedScores: normalizedByBlock.block8!
  });
  contradictions.push(...phaseContradictions);

  const result: ScoringResult = {
    assessmentVersion: ASSESSMENT_VERSION,
    scoringVersion: SCORING_VERSION,
    progress: {
      answeredCount: totalItemsAddressed,
      totalItems: input.items.length,
      averageRankedPerItem
    },
    baseScores,
    structureScores,
    currentPhaseScores,
    base: {
      typeCode: baseTypeCode,
      alternative: baseAlternative,
      marginNormalized: baseMargin,
      confidence: baseConfidence
    },
    structureBuilding: floors,
    currentPhase,
    phaseChangeEstablished,
    phasesVecues,
    contradictions,
    evidence
  };

  return result;
}
