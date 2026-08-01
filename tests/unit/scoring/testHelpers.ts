import { RAW_ITEMS } from "../../../supabase/seed/items.v0.2.ts";
import type {
  BlockId,
  ItemAnswer,
  ItemMeta,
  PhaseHistoryAnswer,
  ScoringKey,
  TypeCode
} from "../../../src/scoring/types.ts";

export function buildItemsMeta(): ItemMeta[] {
  return RAW_ITEMS.map((item) => ({ id: item.id, blockId: item.blockId }));
}

export function buildScoringKey(): ScoringKey {
  const map = new Map<string, TypeCode>();
  for (const item of RAW_ITEMS) {
    for (const option of item.options) {
      map.set(`item-${item.id}-${option.letter}`, option.typeCode);
    }
  }
  return map;
}

export function optionIdForType(itemId: number, typeCode: TypeCode): string {
  const item = RAW_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) throw new Error(`Item inconnu: ${itemId}`);
  const option = item.options.find((candidate) => candidate.typeCode === typeCode);
  if (!option) throw new Error(`Type ${typeCode} absent de l'item ${itemId}`);
  return `item-${itemId}-${option.letter}`;
}

/** Classe le type donne au rang 1, puis un second type (souvent adjacent) au rang 2, pour
 * chaque item -- moyenne de 2 options classees par item, un usage realiste et engage. */
export function buildDominantAnswers(
  primary: TypeCode,
  secondary: TypeCode = primary
): ItemAnswer[] {
  return RAW_ITEMS.map((item) => {
    const primaryId = optionIdForType(item.id, primary);
    const secondaryId = secondary === primary ? undefined : optionIdForType(item.id, secondary);
    return {
      itemId: item.id,
      rankedOptionIds: secondaryId ? [primaryId, secondaryId] : [primaryId],
      explicitNoMatch: false
    };
  });
}

/** Classe des types differents pour les blocs 1-5 (Base) vs blocs 6-7 (Phase) afin de simuler
 * une Base et une Phase actuelle distinctes, en gardant un classement realiste (2 options/item). */
export function buildBaseVsPhaseAnswers(baseType: TypeCode, phaseType: TypeCode): ItemAnswer[] {
  return RAW_ITEMS.map((item) => {
    const isPhaseBlock = item.blockId === "block6" || item.blockId === "block7";
    const primary = isPhaseBlock ? phaseType : baseType;
    const secondary = isPhaseBlock ? baseType : phaseType;
    return {
      itemId: item.id,
      rankedOptionIds: [optionIdForType(item.id, primary), optionIdForType(item.id, secondary)],
      explicitNoMatch: false
    };
  });
}

export function buildAllNoMatchAnswers(): ItemAnswer[] {
  return RAW_ITEMS.map((item) => ({ itemId: item.id, rankedOptionIds: [], explicitNoMatch: true }));
}

/** Classe integralement les 6 options de chaque item selon un ordre choisi par bloc, pour des
 * scenarios deterministes ou tous les types doivent avoir un score distinct (pas d'ex-aequo). */
export function buildFullOrderAnswers(orderFor: (blockId: BlockId) => TypeCode[]): ItemAnswer[] {
  return RAW_ITEMS.map((item) => ({
    itemId: item.id,
    rankedOptionIds: orderFor(item.blockId).map((type) => optionIdForType(item.id, type)),
    explicitNoMatch: false
  }));
}

const BASE_BLOCK_IDS: BlockId[] = ["block1", "block2", "block3", "block4", "block5"];

/** Alterne rang 1/rang 2 entre deux types sur les blocs de Base (1-5) pour produire un score de
 * Base quasi a egalite entre les deux -- utilise pour tester la detection d'ambiguite. */
export function buildAmbiguousBaseAnswers(typeA: TypeCode, typeB: TypeCode): ItemAnswer[] {
  let baseBlockIndex = 0;
  return RAW_ITEMS.map((item) => {
    if (!BASE_BLOCK_IDS.includes(item.blockId)) {
      return {
        itemId: item.id,
        rankedOptionIds: [optionIdForType(item.id, typeA)],
        explicitNoMatch: false
      };
    }
    const order = baseBlockIndex % 2 === 0 ? [typeA, typeB] : [typeB, typeA];
    baseBlockIndex += 1;
    return {
      itemId: item.id,
      rankedOptionIds: order.map((type) => optionIdForType(item.id, type)),
      explicitNoMatch: false
    };
  });
}

export function makePhaseHistory(
  overrides: Partial<PhaseHistoryAnswer> & { typeCode: TypeCode }
): PhaseHistoryAnswer {
  return {
    periodLabel: "il y a quelques années",
    durationCategory: "several_years",
    stillCurrent: false,
    deepNeed: true,
    precededByDurableStressOrChange: true,
    ...overrides
  };
}
