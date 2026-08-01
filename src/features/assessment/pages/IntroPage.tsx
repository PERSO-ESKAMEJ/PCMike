import { Link } from "react-router-dom";

export function IntroPage() {
  return (
    <div className="app intro-page">
      <header className="app-header">
        <div>
          <p className="eyebrow">Auto-évaluation exploratoire</p>
          <h1>Structure de personnalité expérimentale</h1>
        </div>
      </header>

      <main className="intro-layout">
        <div className="intro-copy">
          <p className="notice">
            Cet outil expérimental propose des hypothèses de connaissance de soi inspirées d'un
            modèle de communication à six types. Il ne constitue ni le Profil PCM officiel, ni un
            diagnostic psychologique ou clinique. Les résultats doivent être considérés comme des
            pistes de réflexion à confirmer par un échange qualitatif.
          </p>

          <h2>Comment fonctionne le classement</h2>
          <p>
            Le questionnaire comporte 45 situations. Pour chacune, six réponses courtes te sont
            proposées dans un ordre aléatoire. Classe uniquement celles qui te ressemblent vraiment,
            de la plus vraie à la moins vraie — de une à six réponses. Laisse les autres non
            classées : elles ne comptent pas dans le résultat. Si aucune ne te correspond, tu peux
            l'indiquer explicitement plutôt que de forcer un choix.
          </p>

          <h2>Confidentialité</h2>
          <p>
            Tes réponses restent uniquement sur cet appareil (navigateur) jusqu'à l'envoi final. Une
            fois envoyées, elles sont enregistrées de façon sécurisée et ne te sont pas montrées
            immédiatement : un rapport complet te sera transmis séparément. Le questionnaire prend
            environ 20 à 30 minutes.
          </p>

          <div className="button-row">
            <Link to="/test" className="primary-button">
              Commencer
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
