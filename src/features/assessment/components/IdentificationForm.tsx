import { PARTICIPANT_SCHEMA } from "@/lib/submissionPayload";
import { useAssessmentDraft } from "../state/draftStore";

export function IdentificationForm({ onNext }: { onNext: () => void }) {
  const { draft, setParticipant } = useAssessmentDraft();
  const { participant } = draft;

  const validation = PARTICIPANT_SCHEMA.safeParse({
    firstName: participant.firstName,
    lastName: participant.lastName,
    email: participant.email,
    phone: participant.phone || undefined,
    organization: participant.organization || undefined,
    jobTitle: participant.jobTitle || undefined,
    comment: participant.comment || undefined,
    consentAt: participant.consentGiven ? new Date().toISOString() : undefined
  });

  const canContinue = validation.success && participant.consentGiven;

  return (
    <div className="identification-form">
      <p className="eyebrow">Avant de commencer</p>
      <h2>Tes informations</h2>
      <p>
        Ces informations permettent de te transmettre ton rapport ultérieurement. Elles ne sont
        enregistrées qu'après l'envoi final du questionnaire.
      </p>

      <div className="field-grid">
        <label>
          Prénom *
          <input
            type="text"
            required
            value={participant.firstName}
            onChange={(event) => setParticipant({ firstName: event.target.value })}
            autoComplete="given-name"
          />
        </label>
        <label>
          Nom *
          <input
            type="text"
            required
            value={participant.lastName}
            onChange={(event) => setParticipant({ lastName: event.target.value })}
            autoComplete="family-name"
          />
        </label>
        <label>
          Adresse e-mail *
          <input
            type="email"
            required
            value={participant.email}
            onChange={(event) => setParticipant({ email: event.target.value })}
            autoComplete="email"
          />
        </label>
        <label>
          Téléphone (facultatif)
          <input
            type="tel"
            value={participant.phone}
            onChange={(event) => setParticipant({ phone: event.target.value })}
            autoComplete="tel"
          />
        </label>
        <label>
          Entreprise / organisation (facultatif)
          <input
            type="text"
            value={participant.organization}
            onChange={(event) => setParticipant({ organization: event.target.value })}
          />
        </label>
        <label>
          Fonction (facultatif)
          <input
            type="text"
            value={participant.jobTitle}
            onChange={(event) => setParticipant({ jobTitle: event.target.value })}
          />
        </label>
      </div>

      <label className="field-full">
        Commentaire libre (facultatif)
        <textarea
          value={participant.comment}
          onChange={(event) => setParticipant({ comment: event.target.value })}
          rows={3}
        />
      </label>

      <label className="consent-checkbox">
        <input
          type="checkbox"
          checked={participant.consentGiven}
          onChange={(event) => setParticipant({ consentGiven: event.target.checked })}
        />
        J'accepte que mes réponses soient enregistrées afin de produire mon rapport, et comprends
        qu'il s'agit d'un outil expérimental non officiel, non certifié et non clinique.
      </label>

      <div className="button-row">
        <button type="button" className="primary-button" disabled={!canContinue} onClick={onNext}>
          Continuer
        </button>
      </div>
    </div>
  );
}
