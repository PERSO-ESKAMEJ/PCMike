import { ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";
import type { AssessmentBlockMeta } from "@/data/assessment.items.v0.2";

export function isBlockComplete(
  block: AssessmentBlockMeta,
  draft: { answers: Record<number, { rankedOptionIds: string[]; explicitNoMatch: boolean }> }
): boolean {
  const items = ASSESSMENT_ITEMS.filter((item) => item.blockId === block.id);
  return items.every((item) => {
    const answer = draft.answers[item.id];
    return !!answer && (answer.explicitNoMatch || answer.rankedOptionIds.length > 0);
  });
}
