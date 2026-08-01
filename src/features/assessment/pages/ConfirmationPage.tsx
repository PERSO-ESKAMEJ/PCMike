import { Navigate, useLocation } from "react-router-dom";

interface ConfirmationState {
  referenceCode?: string;
}

export function ConfirmationPage() {
  const location = useLocation();
  const state = (location.state as ConfirmationState | null) ?? {};

  if (!state.referenceCode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app confirmation-page">
      <main className="intro-layout">
        <div className="intro-copy">
          <p className="eyebrow">Envoi confirmé</p>
          <h1>Merci, tes réponses ont bien été enregistrées</h1>
          <p>
            Ton code de référence : <strong>{state.referenceCode}</strong>
          </p>
          <p>
            Conserve ce code. Ton rapport te sera transmis séparément dès qu'il aura été préparé —
            il ne s'affiche pas ici.
          </p>
        </div>
      </main>
    </div>
  );
}
