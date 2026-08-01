import { ASSESSMENT_BLOCKS, ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";
import { useAssessmentDraft } from "../state/draftStore";

export function ReviewStep({
  onEditBlock,
  onSubmit,
  submitting,
  submitError
}: {
  onEditBlock: (blockIndex: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const { draft } = useAssessmentDraft();

  const blockSummaries = ASSESSMENT_BLOCKS.map((block, index) => {
    const items = ASSESSMENT_ITEMS.filter((item) => item.blockId === block.id);
    const addressed = items.filter((item) => {
      const answer = draft.answers[item.id];
      return answer && (answer.explicitNoMatch || answer.rankedOptionIds.length > 0);
    }).length;
    return { block, index, addressed, total: items.length };
  });

  const allComplete = blockSummaries.every((summary) => summary.addressed === summary.total);
  const totalAnswered = blockSummaries.reduce((sum, summary) => sum + summary.addressed, 0);

  return (
    <div className="review-step">
      <p className="eyebrow">Vérification finale</p>
      <h2>Avant d'envoyer</h2>
      <p>
        {totalAnswered}/{ASSESSMENT_ITEMS.length} situations traitées. Une fois envoyé, le
        questionnaire ne peut plus être modifié : ton rapport te sera transmis séparément par
        l'équipe, il ne s'affiche pas ici.
      </p>

      <ul className="review-step__blocks">
        {blockSummaries.map(({ block, index, addressed, total }) => (
          <li key={block.id}>
            <span>{block.label}</span>
            <span>
              {addressed}/{total}
            </span>
            <button type="button" className="ghost-button" onClick={() => onEditBlock(index)}>
              Revoir
            </button>
          </li>
        ))}
      </ul>

      {!allComplete && (
        <p className="notice notice--warning">
          Certaines situations n'ont pas encore de réponse (ni classement, ni « aucune ne me
          correspond »). Complète-les avant l'envoi.
        </p>
      )}

      {submitError && <p className="notice notice--error">{submitError}</p>}

      <div className="button-row">
        <button
          type="button"
          className="primary-button"
          disabled={!allComplete || submitting}
          onClick={onSubmit}
        >
          {submitting ? "Envoi en cours..." : "Envoyer mes réponses"}
        </button>
      </div>
    </div>
  );
}
