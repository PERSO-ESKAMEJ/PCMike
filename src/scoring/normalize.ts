import type { BlockId, TypeCode } from "./types.ts";
import { TYPE_CODES } from "./types.ts";

/**
 * Normalisation min-max 0-100 des scores bruts d'un bloc. Methode choisie faute de precision
 * dans la matrice (voir docs/SOURCE_MAPPING.md §2.4) : un score de 100 designe le type le plus
 * evoque dans ce bloc, 0 le moins evoque, par analogie avec la lecture des scores
 * d'Environnements Preferes du manuel (p.52). Si tous les types sont a egalite (aucune donnee ou
 * ex-aequo parfait), chaque type recoit 50 (neutre), evitant une fausse discrimination.
 */
export function normalizeBlockScores(raw: Record<TypeCode, number>): Record<TypeCode, number> {
  const values = TYPE_CODES.map((type) => raw[type] ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;

  const normalized = {} as Record<TypeCode, number>;
  for (const type of TYPE_CODES) {
    normalized[type] = spread === 0 ? 50 : ((raw[type] - min) / spread) * 100;
  }
  return normalized;
}

/**
 * Combine plusieurs scores de bloc deja normalises (0-100) en un score unique par type, via une
 * moyenne ponderee. Les poids sont supposes sommer a 1 (voir src/scoring/config.ts) ; la
 * fonction reste defensive si un bloc est absent (ne devrait pas arriver en usage normal).
 */
export function weightedCombine(
  normalizedByBlock: Partial<Record<BlockId, Record<TypeCode, number>>>,
  weights: Partial<Record<BlockId, number>>
): Record<TypeCode, number> {
  const combined = {} as Record<TypeCode, number>;

  for (const type of TYPE_CODES) {
    let weightedSum = 0;
    let weightTotal = 0;
    for (const [blockId, weight] of Object.entries(weights) as Array<[BlockId, number]>) {
      const blockScores = normalizedByBlock[blockId];
      if (!blockScores || weight === undefined) continue;
      weightedSum += blockScores[type] * weight;
      weightTotal += weight;
    }
    combined[type] = weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  return combined;
}

/** Re-normalise un ensemble de scores combines (deja ~0-100) en un affichage 0-100 propre. */
export function rescaleForDisplay(scores: Record<TypeCode, number>): Record<TypeCode, number> {
  return normalizeBlockScores(scores);
}

export function sortTypesByScoreDesc(
  scores: Record<TypeCode, number>
): Array<{ typeCode: TypeCode; value: number }> {
  return TYPE_CODES.map((typeCode) => ({ typeCode, value: scores[typeCode] })).sort(
    (a, b) => b.value - a.value
  );
}

export function argmax(scores: Record<TypeCode, number>): TypeCode {
  return sortTypesByScoreDesc(scores)[0].typeCode;
}
