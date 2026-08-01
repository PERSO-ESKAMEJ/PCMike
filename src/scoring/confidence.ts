import type { Confidence, ConfidenceLevel } from "./types.ts";
import { CONFIDENCE_CONFIG, BASE_AMBIGUITY_THRESHOLD_NORMALIZED } from "./config.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ConfidenceInput {
  marginNormalized: number;
  averageRankedPerItem: number;
  /** Fraction 0-1 des blocs secondaires d'accord avec le type n°1. */
  blockCoherence: number;
  /** Force un plafond "faible" quel que soit le reste (ex. divergence besoins/stress). */
  forcedLowConfidence?: boolean;
}

/**
 * Systeme de confiance a 4 niveaux (mission §6.9), ancre sur le seul repere chiffre fourni par
 * la matrice : l'ecart de 8 points normalises sous lequel la Base est "a confirmer" (p.19). Les
 * autres seuils (haute/coherence) sont une construction du produit, documentee dans
 * docs/SOURCE_MAPPING.md §4.3 et docs/SCORING.md.
 */
export function computeConfidence(input: ConfidenceInput): Confidence {
  const reasons: string[] = [];

  if (input.averageRankedPerItem < CONFIDENCE_CONFIG.insufficientAverageRankedPerItem) {
    reasons.push(
      `Moyenne de ${input.averageRankedPerItem.toFixed(2)} proposition(s) classée(s) par item, sous le seuil de ${CONFIDENCE_CONFIG.insufficientAverageRankedPerItem} : signal insuffisant pour discriminer.`
    );
    return { level: "insuffisante", value: 0.1, reasons };
  }

  if (input.marginNormalized < BASE_AMBIGUITY_THRESHOLD_NORMALIZED) {
    reasons.push(
      `Écart de ${input.marginNormalized.toFixed(1)} points normalisés entre le 1er et le 2e type, sous le seuil d'ambiguïté de ${BASE_AMBIGUITY_THRESHOLD_NORMALIZED} points (matrice V0.2, p.19).`
    );
    return { level: "faible", value: clamp(0.25 + input.marginNormalized / 100, 0, 0.49), reasons };
  }

  if (input.forcedLowConfidence) {
    reasons.push(
      "Confiance plafonnée : contradiction détectée entre deux sources de preuve indépendantes."
    );
    return { level: "faible", value: 0.45, reasons };
  }

  const isHigh =
    input.marginNormalized >= CONFIDENCE_CONFIG.highMarginNormalized &&
    input.averageRankedPerItem >= CONFIDENCE_CONFIG.highMinAverageRanked &&
    input.blockCoherence >= CONFIDENCE_CONFIG.highMinBlockCoherence;

  const level: ConfidenceLevel = isHigh ? "haute" : "moyenne";
  reasons.push(
    `Écart de ${input.marginNormalized.toFixed(1)} points normalisés (≥ ${BASE_AMBIGUITY_THRESHOLD_NORMALIZED}).`
  );
  reasons.push(`Cohérence entre blocs secondaires : ${Math.round(input.blockCoherence * 100)}%.`);
  reasons.push(
    `Moyenne de ${input.averageRankedPerItem.toFixed(2)} proposition(s) classée(s) par item.`
  );

  const value = clamp(
    0.5 +
      (input.marginNormalized / 100) * 0.3 +
      input.blockCoherence * 0.15 +
      clamp(input.averageRankedPerItem / 6, 0, 1) * 0.05,
    0.5,
    isHigh ? 1 : 0.71
  );

  return { level, value, reasons };
}
