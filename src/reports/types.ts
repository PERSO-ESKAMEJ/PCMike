import type { ScoringResult } from "@/scoring/types";

export interface ReportData {
  participant: {
    firstName: string;
    lastName: string;
    referenceCode: string;
  };
  submittedAt: string;
  generatedAt: string;
  result: ScoringResult;
}
