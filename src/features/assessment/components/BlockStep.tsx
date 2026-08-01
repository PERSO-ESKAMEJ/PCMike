import { ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";
import type { AssessmentBlockMeta } from "@/data/assessment.items.v0.2";
import { RankingItem } from "./RankingItem";
import { useAssessmentDraft } from "../state/draftStore";

export function BlockStep({ block }: { block: AssessmentBlockMeta }) {
  const { draft, setAnswer } = useAssessmentDraft();
  const items = ASSESSMENT_ITEMS.filter((item) => item.blockId === block.id);

  return (
    <div className="block-step">
      <p className="eyebrow">{block.label}</p>
      <p className="block-step__hint">
        Classe uniquement les réponses qui te ressemblent vraiment, de la plus vraie à la moins
        vraie. Laisse les autres non classées, ou indique qu'aucune ne te correspond.
      </p>
      {items.map((item) => {
        const presentedOrder = draft.presentedOptionOrder[item.id] ?? item.options.map((o) => o.id);
        const answer = draft.answers[item.id] ?? { rankedOptionIds: [], explicitNoMatch: false };
        return (
          <RankingItem
            key={item.id}
            item={item}
            presentedOrder={presentedOrder}
            rankedOptionIds={answer.rankedOptionIds}
            explicitNoMatch={answer.explicitNoMatch}
            onChange={(next) => setAnswer(item.id, next)}
          />
        );
      })}
    </div>
  );
}
