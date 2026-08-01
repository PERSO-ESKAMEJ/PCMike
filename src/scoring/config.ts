/**
 * Configuration de scoring versionnee -- AUCUNE de ces valeurs ne doit etre dupliquee en dur
 * ailleurs dans le code. Toute recalibration empirique future (explicitement anticipee par la
 * matrice V0.2, voir docs/SOURCE_MAPPING.md §1.1) se fait ici, en incrementant SCORING_VERSION.
 *
 * Provenance de chaque valeur documentee dans docs/SOURCE_MAPPING.md §1 et §4.
 */

import type { BlockId } from "./types.ts";

export const ASSESSMENT_VERSION = "v0.2" as const;
export const SCORING_VERSION = "scoring-2026.08.0" as const;

/** Bareme de rang provisoire -- matrice p.2. Index 0 = rang 1 (le plus vrai). */
export const RANK_WEIGHTS: readonly number[] = [6, 4, 3, 2, 1, 0.5];

export const BLOCK_ITEM_RANGES: Record<BlockId, [number, number]> = {
  block1: [1, 10],
  block2: [11, 17],
  block3: [18, 24],
  block4: [25, 29],
  block5: [30, 33],
  block6: [34, 38],
  block7: [39, 42],
  block8: [43, 45]
};

export const BLOCK_LABELS: Record<BlockId, string> = {
  block1: "Base naturelle",
  block2: "Perceptions et langage",
  block3: "Points forts et styles d'interaction",
  block4: "Canaux de communication",
  block5: "Environnements préférés",
  block6: "Besoins psychologiques actuels",
  block7: "Stress actuel",
  block8: "Phasage et cohérence temporelle"
};

/** Score de Base -- matrice p.19 : "40% items 1-10; 25% items 11-17; 20% items 18-24; 10% items 25-29; 5% items 30-33". */
export const BASE_SCORE_BLOCK_WEIGHTS: Partial<Record<BlockId, number>> = {
  block1: 0.4,
  block2: 0.25,
  block3: 0.2,
  block4: 0.1,
  block5: 0.05
};

/**
 * Score de Structure -- pondération distincte demandée par la mission, NON issue de la matrice
 * (voir docs/SOURCE_MAPPING.md §4.1). Hypothèse configurable.
 */
export const STRUCTURE_SCORE_BLOCK_WEIGHTS: Partial<Record<BlockId, number>> = {
  block1: 0.3,
  block2: 0.25,
  block3: 0.2,
  block4: 0.15,
  block5: 0.1
};

/**
 * Score de Phase actuelle -- pondération issue de la mission (50/45/5), NON issue de la matrice
 * qui exige seulement une "convergence" sans formule chiffrée (docs/SOURCE_MAPPING.md §4.2).
 */
export const CURRENT_PHASE_BLOCK_WEIGHTS: Partial<Record<BlockId, number>> = {
  block6: 0.5,
  block7: 0.45,
  block5: 0.05
};

/** Écart (en points normalisés 0-100) sous lequel la Base est signalée "à confirmer" -- matrice p.19. */
export const BASE_AMBIGUITY_THRESHOLD_NORMALIZED = 8;

export const CONFIDENCE_CONFIG = {
  /** Marge minimale (points normalisés) pour viser une confiance "haute". */
  highMarginNormalized: 15,
  /** Nombre moyen d'options classées par item minimal pour viser "haute". */
  highMinAverageRanked: 2,
  /** Fraction minimale des blocs 2-5 devant s'accorder avec le type n°1 pour viser "haute". */
  highMinBlockCoherence: 0.75,
  /**
   * En dessous de cette moyenne d'options classées par item (sur les 45), la confiance est
   * "insuffisante". Un répondant décidé qui classe exactement 1 option par item obtient une
   * moyenne de 1.0 -- c'est un usage normal et valide de l'outil (mission §3.3), pas un signal
   * de mauvaise qualité. Ce seuil ne doit donc se déclencher que lorsqu'une part significative
   * des items a été laissée en "aucune ne me correspond" (0 classée), qui réduit reellement le
   * signal disponible pour le scoring.
   */
  insufficientAverageRankedPerItem: 0.6
} as const;

/**
 * Confirmation d'une Phase vécue -- répartition demandée par la mission (70/20/10), NON issue de
 * la matrice qui exige seulement "une période durable, un nouveau besoin, une séquence de stress
 * cohérente" sans formule chiffrée (docs/SOURCE_MAPPING.md §4.2).
 */
export const PHASE_VECUE_WEIGHTS = {
  block8Answers: 0.7,
  temporalCoherence: 0.2,
  needsStressCoherence: 0.1
} as const;

export const PHASE_VECUE_DURATION_WEIGHTS: Record<
  "weeks" | "months" | "over_a_year" | "several_years",
  number
> = {
  weeks: 0.2,
  months: 0.5,
  over_a_year: 0.8,
  several_years: 1
};

export const PHASE_VECUE_CONFIRMATION_THRESHOLD = 0.55;
