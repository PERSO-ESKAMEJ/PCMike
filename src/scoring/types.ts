/**
 * Types partages du moteur de scoring. Module pur : aucune dependance React, DOM ou Supabase,
 * afin de pouvoir etre importe tel quel depuis l'Edge Function Deno `submit-assessment`
 * (voir docs/ARCHITECTURE.md §4).
 */

export type TypeCode = "AN" | "PE" | "EM" | "IM" | "EN" | "PR";

export const TYPE_CODES: readonly TypeCode[] = ["AN", "PE", "EM", "IM", "EN", "PR"];

export type BlockId =
  "block1" | "block2" | "block3" | "block4" | "block5" | "block6" | "block7" | "block8";

/** Une reponse brute pour un item : classement partiel ou refus explicite. */
export interface ItemAnswer {
  itemId: number;
  /** Ids d'options opaques (ex. "item-3-A"), du plus vrai (index 0) au moins vrai. */
  rankedOptionIds: string[];
  /** "Aucune ne me correspond suffisamment" -- reponse vide volontaire, distincte d'un item omis. */
  explicitNoMatch: boolean;
}

/** La seule information temporelle collectee (une mini-ligne de vie, cf. matrice p.18). */
export interface PhaseHistoryAnswer {
  /** Type indique par le rang 1 de l'item 45 -- determine cote appelant, pas par le moteur. */
  typeCode: TypeCode;
  periodLabel: string;
  durationCategory: "weeks" | "months" | "over_a_year" | "several_years";
  stillCurrent: boolean;
  /** Besoin profond ressenti, par opposition a une simple competence imposee par le contexte. */
  deepNeed: boolean;
  /** Precedee d'un stress durable ou d'un changement majeur (exige par la matrice, p.18). */
  precededByDurableStressOrChange: boolean;
}

/** Correspondance option -> type, fournie uniquement par l'appelant serveur (jamais le client). */
export type ScoringKey = ReadonlyMap<string, TypeCode>;

export interface ItemMeta {
  id: number;
  blockId: BlockId;
  /** Poids specifique de l'item si different du poids par defaut du bloc (rarement utilise). */
  weight?: number;
}

export interface TypeScoreEntry {
  typeCode: TypeCode;
  /** Score pondere brut, non normalise. */
  raw: number;
  /** Score normalise 0-100 relatif aux 6 types pour ce meme score. */
  normalized: number;
}

export type TypeScoreBoard = Record<TypeCode, TypeScoreEntry>;

export interface BlockScore {
  blockId: BlockId;
  /** Score brut par type pour ce bloc uniquement. */
  scores: Record<TypeCode, number>;
  /** Nombre moyen d'options classees par item de ce bloc (indicateur de qualite de reponse). */
  averageRankedPerItem: number;
}

export type ConfidenceLevel = "haute" | "moyenne" | "faible" | "insuffisante";

export interface Confidence {
  level: ConfidenceLevel;
  /** Valeur continue 0-1, fournie pour tri/affichage graphique, jamais comme seule justification. */
  value: number;
  /** Explications factuelles ayant mene a ce niveau (marge, coherence, qualite de reponse...). */
  reasons: string[];
}

export type FloorStatus =
  | "base"
  | "base_et_phase_actuelle"
  | "phase_actuelle"
  | "phase_vecue_confirmee"
  | "phase_vecue_potentielle"
  | "etage_accessible";

export interface BuildingFloor {
  typeCode: TypeCode;
  floorIndex: number; // 1 = rez-de-chaussee (Base)
  status: FloorStatus;
  /** Pourcentage affiche -- 100 uniquement pour un statut valide (voir §6.8 de la mission). */
  displayPercent: number;
  structureScoreNormalized: number;
}

export type ContradictionCode =
  | "base_ambigue"
  | "phase_besoins_stress_divergents"
  | "phase_vecue_hors_trajectoire"
  | "phase_vecue_competence_contextuelle";

export interface Contradiction {
  code: ContradictionCode;
  message: string;
}

export interface Evidence {
  itemId: number;
  optionId: string;
  typeCode: TypeCode;
  blockId: BlockId;
  rank: number; // 1-based
  rankWeight: number;
  target: "base_structure" | "phase_besoins" | "phase_stress" | "phasage";
}

export interface PhaseResult {
  typeCode: TypeCode;
  status: "probable" | "incertaine";
  confidence: Confidence;
  /** Renseigne uniquement si status === "incertaine" : les deux candidats en desaccord. */
  divergentCandidates?: { needsTop: TypeCode; stressTop: TypeCode };
}

export interface BaseResult {
  typeCode: TypeCode;
  alternative: TypeCode | null;
  marginNormalized: number;
  confidence: Confidence;
}

export interface ScoringResult {
  assessmentVersion: string;
  scoringVersion: string;
  progress: {
    answeredCount: number;
    totalItems: number;
    averageRankedPerItem: number;
  };
  baseScores: TypeScoreBoard;
  structureScores: TypeScoreBoard;
  currentPhaseScores: TypeScoreBoard;
  base: BaseResult;
  structureBuilding: BuildingFloor[];
  currentPhase: PhaseResult;
  phaseChangeEstablished: boolean;
  phasesVecues: BuildingFloor[];
  contradictions: Contradiction[];
  evidence: Evidence[];
}
