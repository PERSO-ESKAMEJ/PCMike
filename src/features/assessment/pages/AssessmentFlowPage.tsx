import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ASSESSMENT_BLOCKS, ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";
import { AssessmentDraftProvider, useAssessmentDraft } from "../state/draftStore";
import { IdentificationForm } from "../components/IdentificationForm";
import { BlockStep } from "../components/BlockStep";
import { PhaseHistoryForm } from "../components/PhaseHistoryForm";
import { ReviewStep } from "../components/ReviewStep";
import { submitAssessment } from "../api/submitAssessment";
import { isBlockComplete } from "../utils/blockCompletion";

type Step =
  | { kind: "identification" }
  | { kind: "block"; blockIndex: number }
  | { kind: "phaseHistory" }
  | { kind: "review" };

const STEPS: Step[] = [
  { kind: "identification" },
  ...ASSESSMENT_BLOCKS.map((_, blockIndex) => ({ kind: "block" as const, blockIndex })),
  { kind: "phaseHistory" },
  { kind: "review" }
];

export function AssessmentFlowPage() {
  return (
    <AssessmentDraftProvider>
      <AssessmentFlowInner />
    </AssessmentDraftProvider>
  );
}

function AssessmentFlowInner() {
  const navigate = useNavigate();
  const { draft, setStepIndex, resetDraft } = useAssessmentDraft();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepIndex = Math.min(draft.stepIndex, STEPS.length - 1);
  const step = STEPS[stepIndex];

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (stepIndex === 0) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [stepIndex]);

  const answeredItemsCount = ASSESSMENT_ITEMS.filter((item) => {
    const answer = draft.answers[item.id];
    return answer && (answer.explicitNoMatch || answer.rankedOptionIds.length > 0);
  }).length;
  const progressPercent = Math.round((answeredItemsCount / ASSESSMENT_ITEMS.length) * 100);

  function goTo(index: number) {
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitAssessment(draft);
    setSubmitting(false);

    if (result.ok) {
      const referenceCode = result.referenceCode;
      resetDraft();
      void navigate("/confirmation", { state: { referenceCode } });
      return;
    }

    setSubmitError(result.error);
  }

  return (
    <div className="app">
      <div className="progress-shell" aria-label="Progression du test">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span>{progressPercent}%</span>
      </div>

      <main className="assessment-flow">
        {step.kind === "identification" && (
          <IdentificationForm onNext={() => goTo(stepIndex + 1)} />
        )}

        {step.kind === "block" && (
          <>
            <BlockStep block={ASSESSMENT_BLOCKS[step.blockIndex]} />
            <footer className="footer-nav">
              <button type="button" className="ghost-button" onClick={() => goTo(stepIndex - 1)}>
                Précédent
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={!isBlockComplete(ASSESSMENT_BLOCKS[step.blockIndex], draft)}
                onClick={() => goTo(stepIndex + 1)}
              >
                Suivant
              </button>
            </footer>
          </>
        )}

        {step.kind === "phaseHistory" && (
          <PhaseHistoryForm onNext={() => goTo(stepIndex + 1)} onBack={() => goTo(stepIndex - 1)} />
        )}

        {step.kind === "review" && (
          <ReviewStep
            onEditBlock={(blockIndex) => goTo(1 + blockIndex)}
            onSubmit={() => void handleSubmit()}
            submitting={submitting}
            submitError={submitError}
          />
        )}
      </main>
    </div>
  );
}
