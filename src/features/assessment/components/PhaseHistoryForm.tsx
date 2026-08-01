import { ASSESSMENT_ITEMS } from "@/data/assessment.items.v0.2";
import type { DraftPhaseHistory } from "../state/draftStore";
import { useAssessmentDraft } from "../state/draftStore";

const DURATION_OPTIONS: Array<{ value: DraftPhaseHistory["durationCategory"]; label: string }> = [
  { value: "weeks", label: "Quelques semaines" },
  { value: "months", label: "Quelques mois" },
  { value: "over_a_year", label: "Plus d'un an" },
  { value: "several_years", label: "Plusieurs années" }
];

const ITEM_45_ID = 45;

/**
 * Ligne de vie exigee par la matrice (p.18) apres l'item 45 : periode approximative, duree,
 * besoin encore actuel ou non, et presence d'un stress durable avant le changement. Fait
 * uniquement reference au TEXTE de la reponse prioritaire du candidat, jamais a un code de type
 * (le candidat n'y a de toute facon pas acces -- voir docs/SOURCE_MAPPING.md §4.4).
 */
export function PhaseHistoryForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, setPhaseHistory } = useAssessmentDraft();
  const item45 = ASSESSMENT_ITEMS.find((item) => item.id === ITEM_45_ID);
  const answer45 = draft.answers[ITEM_45_ID];
  const topOptionId = answer45?.rankedOptionIds[0];
  const topOptionText = item45?.options.find((option) => option.id === topOptionId)?.text;

  const history: DraftPhaseHistory = draft.phaseHistory ?? {
    periodLabel: "",
    durationCategory: "months",
    stillCurrent: false,
    deepNeed: true,
    precededByDurableStressOrChange: false
  };

  if (!topOptionText) {
    // L'item 45 a ete laisse en "aucune ne me correspond" : aucune ligne de vie a documenter.
    return (
      <div className="phase-history-form">
        <p className="eyebrow">Pour finir cette section</p>
        <h2>Pas de changement marquant à préciser</h2>
        <p>
          Tu n'as classé aucune réponse à la dernière situation : nous ne te demandons donc pas de
          préciser de changement de motivation durable.
        </p>
        <div className="button-row">
          <button type="button" className="ghost-button" onClick={onBack}>
            Précédent
          </button>
          <button type="button" className="primary-button" onClick={onNext}>
            Continuer
          </button>
        </div>
      </div>
    );
  }

  function update(partial: Partial<DraftPhaseHistory>) {
    setPhaseHistory({ ...history, ...partial });
  }

  return (
    <div className="phase-history-form">
      <p className="eyebrow">Pour finir cette section</p>
      <h2>Précise ce changement</h2>
      <p>
        Tu as classé en premier, pour le changement le plus durable dans tes motivations : «{" "}
        {topOptionText} »
      </p>

      <label className="field-full">
        À quelle période approximative cela correspond-il ?
        <input
          type="text"
          placeholder="ex. après un changement de poste en 2021"
          value={history.periodLabel}
          onChange={(event) => update({ periodLabel: event.target.value })}
        />
      </label>

      <fieldset>
        <legend>Combien de temps cette période a-t-elle duré ?</legend>
        {DURATION_OPTIONS.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name="durationCategory"
              checked={history.durationCategory === option.value}
              onChange={() => update({ durationCategory: option.value })}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <label className="checkbox-option">
        <input
          type="checkbox"
          checked={history.stillCurrent}
          onChange={(event) => update({ stillCurrent: event.target.checked })}
        />
        Ce besoin est encore actuel aujourd'hui.
      </label>

      <label className="checkbox-option">
        <input
          type="checkbox"
          checked={history.deepNeed}
          onChange={(event) => update({ deepNeed: event.target.checked })}
        />
        C'était un besoin profond, pas seulement une compétence imposée par mon rôle ou mon contexte
        professionnel.
      </label>

      <label className="checkbox-option">
        <input
          type="checkbox"
          checked={history.precededByDurableStressOrChange}
          onChange={(event) => update({ precededByDurableStressOrChange: event.target.checked })}
        />
        Cette évolution a suivi une période de stress durable ou un changement majeur.
      </label>

      <div className="button-row">
        <button type="button" className="ghost-button" onClick={onBack}>
          Précédent
        </button>
        <button type="button" className="primary-button" onClick={onNext}>
          Continuer
        </button>
      </div>
    </div>
  );
}
