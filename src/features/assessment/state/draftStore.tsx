import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";

/**
 * Le candidat ne connait jamais le code de type interne associe a ses reponses (voir
 * docs/SOURCE_MAPPING.md §4.4) : ce brouillon local ne stocke donc que les champs de la
 * mini-ligne de vie que le candidat renseigne lui-meme, jamais un TypeCode.
 */
export interface DraftPhaseHistory {
  periodLabel: string;
  durationCategory: "weeks" | "months" | "over_a_year" | "several_years";
  stillCurrent: boolean;
  deepNeed: boolean;
  precededByDurableStressOrChange: boolean;
}

const STORAGE_KEY = "pcm-assessment-draft-v1";

export interface DraftAnswer {
  rankedOptionIds: string[];
  explicitNoMatch: boolean;
}

export interface DraftParticipant {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  jobTitle: string;
  comment: string;
  consentGiven: boolean;
}

export interface AssessmentDraft {
  version: 1;
  idempotencyKey: string;
  startedAt: string;
  formRenderedAt: string;
  participant: DraftParticipant;
  presentedOptionOrder: Record<number, string[]>;
  answers: Record<number, DraftAnswer>;
  phaseHistory: DraftPhaseHistory | null;
  stepIndex: number;
}

function shuffle<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createEmptyParticipant(): DraftParticipant {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    jobTitle: "",
    comment: "",
    consentGiven: false
  };
}

function createDraft(): AssessmentDraft {
  const presentedOptionOrder: Record<number, string[]> = {};
  for (const item of ASSESSMENT_ITEMS) {
    presentedOptionOrder[item.id] = shuffle(item.options.map((option) => option.id));
  }

  const now = new Date().toISOString();
  return {
    version: 1,
    idempotencyKey: crypto.randomUUID(),
    startedAt: now,
    formRenderedAt: now,
    participant: createEmptyParticipant(),
    presentedOptionOrder,
    answers: {},
    phaseHistory: null,
    stepIndex: 0
  };
}

function loadDraft(): AssessmentDraft {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDraft();
    const parsed = JSON.parse(raw) as Partial<AssessmentDraft>;
    if (parsed.version !== 1 || !parsed.idempotencyKey || !parsed.presentedOptionOrder) {
      return createDraft();
    }
    return {
      ...createDraft(),
      ...parsed,
      participant: { ...createEmptyParticipant(), ...parsed.participant }
    };
  } catch {
    return createDraft();
  }
}

interface DraftContextValue {
  draft: AssessmentDraft;
  setParticipant: (participant: Partial<DraftParticipant>) => void;
  setAnswer: (itemId: number, answer: DraftAnswer) => void;
  setPhaseHistory: (history: DraftPhaseHistory | null) => void;
  setStepIndex: (index: number) => void;
  resetDraft: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function AssessmentDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AssessmentDraft>(() => loadDraft());

  const persist = useCallback((next: AssessmentDraft) => {
    setDraft(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Stockage local indisponible (navigation privee stricte, quota) : le brouillon reste en
      // memoire pour la session en cours, sans resilience au rechargement -- degrade sans planter.
    }
  }, []);

  const setParticipant = useCallback(
    (participant: Partial<DraftParticipant>) => {
      persist({ ...draft, participant: { ...draft.participant, ...participant } });
    },
    [draft, persist]
  );

  const setAnswer = useCallback(
    (itemId: number, answer: DraftAnswer) => {
      persist({ ...draft, answers: { ...draft.answers, [itemId]: answer } });
    },
    [draft, persist]
  );

  const setPhaseHistory = useCallback(
    (history: DraftPhaseHistory | null) => {
      persist({ ...draft, phaseHistory: history });
    },
    [draft, persist]
  );

  const setStepIndex = useCallback(
    (index: number) => {
      persist({ ...draft, stepIndex: index });
    },
    [draft, persist]
  );

  const resetDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setDraft(createDraft());
  }, []);

  const value = useMemo(
    () => ({ draft, setParticipant, setAnswer, setPhaseHistory, setStepIndex, resetDraft }),
    [draft, setParticipant, setAnswer, setPhaseHistory, setStepIndex, resetDraft]
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useAssessmentDraft(): DraftContextValue {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useAssessmentDraft doit être utilisé sous <AssessmentDraftProvider>.");
  }
  return context;
}
