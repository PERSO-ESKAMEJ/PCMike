import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { BuildingFloor } from "@/scoring/types";
import { TYPE_PROFILES } from "./content/typeProfiles";
import { ACTION_PLANS } from "./content/planActions";
import { reportStyles as styles, REPORT_COLORS } from "./styles";
import type { ReportData } from "./types";

const DISCLAIMER =
  "Cet outil expérimental propose des hypothèses de connaissance de soi inspirées d'un modèle de communication à six types. Il ne constitue ni le Profil PCM officiel, ni un diagnostic psychologique ou clinique. Les résultats doivent être considérés comme des pistes de réflexion à confirmer par un échange qualitatif.";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function PageFooter() {
  return (
    <Text
      style={styles.pageNumber}
      fixed
      render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} / ${totalPages} — Document expérimental, non officiel`
      }
    />
  );
}

function Bar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.barTrack}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: "100%",
          backgroundColor: color
        }}
      />
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const FLOOR_STATUS_LABELS: Record<BuildingFloor["status"], string> = {
  base: "Base",
  base_et_phase_actuelle: "Base et Phase actuelle",
  phase_actuelle: "Phase actuelle",
  phase_vecue_confirmee: "Phase vécue confirmée",
  phase_vecue_potentielle: "Phase vécue potentielle (non confirmée)",
  etage_accessible: "Étage accessible"
};

export function ReportDocument({ data }: { data: ReportData }) {
  const { result } = data;
  const base = TYPE_PROFILES[result.base.typeCode];
  const phase = TYPE_PROFILES[result.currentPhase.typeCode];
  const topThreeFloors = result.structureBuilding.slice(0, 3);
  const plan = ACTION_PLANS[result.currentPhase.typeCode];

  return (
    <Document
      title={`Rapport expérimental — ${data.participant.firstName} ${data.participant.lastName}`}
      author="Explorateur expérimental inspiré du PCM"
      subject="Rapport de structure de personnalité expérimental, non officiel"
    >
      {/* Couverture */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.eyebrow}>Rapport expérimental — non officiel</Text>
        <Text style={styles.h1}>
          {data.participant.firstName} {data.participant.lastName}
        </Text>
        <Text style={styles.paragraph}>Code de référence : {data.participant.referenceCode}</Text>
        <Text style={styles.paragraph}>Questionnaire rempli le {formatDate(data.submittedAt)}</Text>
        <Text style={styles.paragraph}>Rapport généré le {formatDate(data.generatedAt)}</Text>
        <View style={[styles.notice, { marginTop: 40 }]}>
          <Text>{DISCLAIMER}</Text>
        </View>
        <Text style={styles.small}>
          Version questionnaire {result.assessmentVersion} — version de scoring{" "}
          {result.scoringVersion}
        </Text>
      </Page>

      {/* Introduction */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Introduction</Text>
        <Text style={styles.h2}>Comment lire ce rapport</Text>
        <Text style={styles.paragraph}>
          Ce rapport propose une hypothèse de lecture de ta façon durable de fonctionner (ta{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Base</Text>), de ce qui te motive
          particulièrement en ce moment (ta{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Phase actuelle</Text>), et d'éventuelles
          périodes passées où une autre motivation a dominé durablement (tes{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Phases vécues</Text>).
        </Text>
        <Text style={styles.paragraph}>
          La Base reste stable dans le temps : c'est ta manière la plus spontanée de percevoir,
          communiquer et agir. La Phase actuelle peut évoluer au cours de la vie, en particulier
          après une période de stress durable ou un changement important : elle influence surtout
          tes besoins psychologiques et la forme que prend ton stress, pas ta perception ni ton
          style de fond, qui restent ceux de ta Base.
        </Text>
        <Text style={styles.h2}>Limites de l'outil</Text>
        <Text style={styles.paragraph}>
          Les résultats reposent sur un classement partiel de réponses courtes, sans validation
          psychométrique officielle. Ils constituent une hypothèse de travail, pas une vérité
          arrêtée : ils gagnent à être confirmés ou nuancés par un échange avec la personne
          concernée.
        </Text>
        <PageFooter />
      </Page>

      {/* Synthèse */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Synthèse</Text>
        <Text style={styles.h2}>Vue d'ensemble</Text>

        <View style={styles.row}>
          <Text>Base probable</Text>
          <Text
            style={{ fontFamily: "Helvetica-Bold", color: REPORT_COLORS[result.base.typeCode] }}
          >
            {base.name} — confiance {result.base.confidence.level}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>Phase actuelle probable</Text>
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              color: REPORT_COLORS[result.currentPhase.typeCode]
            }}
          >
            {phase.name} — {result.currentPhase.status}, confiance{" "}
            {result.currentPhase.confidence.level}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>Phases vécues probables</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {result.phasesVecues.length
              ? result.phasesVecues.map((floor) => TYPE_PROFILES[floor.typeCode].name).join(", ")
              : "Aucune identifiée avec assez de certitude"}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.h3}>Trois énergies les plus accessibles</Text>
        <Bullets
          items={topThreeFloors.map(
            (floor) =>
              `${TYPE_PROFILES[floor.typeCode].name} — ${FLOOR_STATUS_LABELS[floor.status]} (${floor.displayPercent}%)`
          )}
        />

        {result.contradictions.length > 0 && (
          <>
            <Text style={styles.h3}>Réserves et points à confirmer</Text>
            <Bullets items={result.contradictions.map((c) => c.message)} />
          </>
        )}

        <Text style={styles.h3}>En résumé</Text>
        <Text style={styles.paragraph}>
          Ton fonctionnement de fond s'apparente à celui d'un profil {base.name.toLowerCase()} :{" "}
          {base.strengthsNarrative.toLowerCase()} En ce moment, ce qui te motive particulièrement se
          rapproche du profil {phase.name.toLowerCase()} : {phase.needPositiveSign.toLowerCase()}
        </Text>
        <PageFooter />
      </Page>

      {/* Structure de personnalité */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Structure de personnalité</Text>
        <Text style={styles.h2}>L'immeuble à six étages</Text>
        <Text style={styles.paragraph}>
          Chaque personne porte en elle les six types, à des degrés différents. Ta Base occupe le
          rez-de-chaussée : c'est le fonctionnement le plus stable et le plus ancien. Les étages
          supérieurs représentent des ressources plus ou moins facilement accessibles.
        </Text>
        <Text style={styles.notice}>
          Un pourcentage de 100% ne signifie pas la même chose partout : il indique un statut validé
          (Base, Phase actuelle, ou Phase vécue confirmée), pas une intensité brute. Les autres
          pourcentages traduisent une accessibilité relative entre les six types.
        </Text>
        {result.structureBuilding.map((floor) => (
          <View key={floor.typeCode} style={styles.floorRow}>
            <Text style={styles.floorLabel}>Étage {floor.floorIndex}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", color: REPORT_COLORS[floor.typeCode] }}>
                {TYPE_PROFILES[floor.typeCode].name}
              </Text>
              <Bar percent={floor.displayPercent} color={REPORT_COLORS[floor.typeCode]} />
            </View>
            <Text style={styles.floorMeta}>
              {FLOOR_STATUS_LABELS[floor.status]} — {floor.displayPercent}%
            </Text>
          </View>
        ))}
        <PageFooter />
      </Page>

      {/* Perceptions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Perceptions</Text>
        <Text style={styles.h2}>Ta perception dominante : {base.perceptionLabel}</Text>
        <Text style={styles.paragraph}>{base.perceptionDescription}</Text>
        <Text style={styles.h3}>Perceptions secondaires accessibles</Text>
        <Bullets
          items={topThreeFloors
            .slice(1)
            .map(
              (floor) =>
                `${TYPE_PROFILES[floor.typeCode].name} : ${TYPE_PROFILES[floor.typeCode].perceptionLabel.toLowerCase()}`
            )}
        />
        <PageFooter />
      </Page>

      {/* Points forts */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Points forts</Text>
        <Text style={styles.h2}>Points forts de ta Base ({base.name})</Text>
        <Bullets items={base.strengths} />
        <Text style={styles.paragraph}>{base.strengthsNarrative}</Text>
        <Text style={styles.h3}>Risque de surutilisation</Text>
        <Text style={styles.paragraph}>{base.overuseRisk}</Text>
        <Text style={styles.h3}>Ressources des étages accessibles</Text>
        {topThreeFloors.slice(1).map((floor) => (
          <Text key={floor.typeCode} style={styles.paragraph}>
            {TYPE_PROFILES[floor.typeCode].name} :{" "}
            {TYPE_PROFILES[floor.typeCode].strengthsNarrative}
          </Text>
        ))}
        <PageFooter />
      </Page>

      {/* Styles d'interaction */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Styles d'interaction</Text>
        <Text style={styles.h2}>Style à privilégier avec toi : {base.styleUse}</Text>
        <Text style={styles.paragraph}>{base.styleNarrative}</Text>
        <Text style={styles.h3}>Style à éviter</Text>
        <Text style={styles.paragraph}>
          {base.styleAvoid} — ce style tend à réduire ton engagement plutôt qu'à le renforcer.
        </Text>
        <Text style={styles.h3}>Pour encadrer ou collaborer avec toi</Text>
        <Text style={styles.paragraph}>
          Privilégier {base.styleUse.toLowerCase()} au quotidien, et réserver{" "}
          {base.styleAvoid.toLowerCase()} aux situations qui l'exigent vraiment.
        </Text>
        <PageFooter />
      </Page>

      {/* Parties de personnalité */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Parties de personnalité</Text>
        <Text style={styles.h2}>Ta partie la plus naturelle : {base.part}</Text>
        <Text style={styles.paragraph}>{base.partNarrative}</Text>
        <Text style={styles.small}>
          Ordinateur, Directeur, Réconforteur et Émoteur désignent des façons différentes de traiter
          une situation ou de s'adresser à quelqu'un ; leur accessibilité varie selon les étages de
          ta Structure.
        </Text>
        <PageFooter />
      </Page>

      {/* Canaux de communication */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Canaux de communication</Text>
        <Text style={styles.h2}>Ton canal préféré : {base.channel}</Text>
        <Text style={styles.h3}>Formulation efficace</Text>
        <Text style={styles.paragraph}>{base.channelGoodPhrasing}</Text>
        <Text style={styles.h3}>Formulation moins adaptée</Text>
        <Text style={styles.paragraph}>{base.channelPoorPhrasing}</Text>
        <PageFooter />
      </Page>

      {/* Environnements préférés */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Environnements préférés</Text>
        <Text style={styles.h2}>Ton environnement favorable : {base.environment}</Text>
        <Text style={styles.paragraph}>{base.environmentFavorable}</Text>
        <Text style={styles.h3}>Conditions coûteuses en énergie</Text>
        <Text style={styles.paragraph}>{base.environmentCostly}</Text>
        <PageFooter />
      </Page>

      {/* Besoins psychologiques */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Besoins psychologiques</Text>
        <Text style={styles.h2}>Besoin de ta Phase actuelle : {phase.need}</Text>
        <Text style={styles.paragraph}>{phase.needPositiveSign}</Text>
        <Text style={styles.h3}>Signes de manque</Text>
        <Text style={styles.paragraph}>{phase.needLackSign}</Text>
        {result.base.typeCode !== result.currentPhase.typeCode && (
          <>
            <Text style={styles.h3}>Besoin secondaire (Base)</Text>
            <Text style={styles.paragraph}>
              {base.need} — {base.needPositiveSign}
            </Text>
          </>
        )}
        <PageFooter />
      </Page>

      {/* Phase actuelle et Phases vécues */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Phase actuelle et Phases vécues</Text>
        <Text style={styles.h2}>Chronologie hypothétique</Text>
        <Text style={styles.paragraph}>
          {result.phaseChangeEstablished
            ? `Ta motivation de fond (${base.name}) semble avoir évolué vers une Phase actuelle différente (${phase.name}), ce qui suggère un changement durable de motivation au fil du temps.`
            : `Ta Phase actuelle correspond à ta Base (${base.name}) : rien dans le questionnaire n'indique de changement de motivation durable établi.`}
        </Text>
        {result.phasesVecues.length > 0 && (
          <>
            <Text style={styles.h3}>Phases vécues confirmées</Text>
            <Bullets
              items={result.phasesVecues.map(
                (floor) =>
                  `${TYPE_PROFILES[floor.typeCode].name} : une période où ce besoin semble avoir été central de façon durable.`
              )}
            />
          </>
        )}
        <Text style={styles.h3}>Niveau de confiance</Text>
        <Text style={styles.paragraph}>
          Confiance {result.currentPhase.confidence.level} sur la Phase actuelle.{" "}
          {result.currentPhase.confidence.reasons.join(" ")}
        </Text>
        <PageFooter />
      </Page>

      {/* Satisfaction négative des besoins */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Satisfaction négative des besoins</Text>
        <Text style={styles.h2}>Signaux précoces à surveiller</Text>
        <Text style={styles.paragraph}>
          Quand le besoin de {phase.need.toLowerCase()} n'est pas satisfait, certains comportements
          peuvent apparaître progressivement. Ils ne sont pas des défauts : ce sont des signaux à
          écouter avant qu'ils ne s'intensifient.
        </Text>
        <Text style={styles.paragraph}>{phase.needLackSign}</Text>
        <PageFooter />
      </Page>

      {/* Séquence de stress */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Séquence de stress</Text>
        <Text style={styles.h2}>Ce qui déclenche la tension : {phase.stress.driver}</Text>
        <Text style={styles.h3}>Premier degré</Text>
        <Text style={styles.paragraph}>{phase.stress.entry}</Text>
        <Text style={styles.h3}>Deuxième degré</Text>
        <Text style={styles.paragraph}>{phase.stress.mask}</Text>
        <Text style={styles.h3}>Troisième degré</Text>
        <Text style={styles.paragraph}>{phase.stress.cave}</Text>
        <Text style={styles.h3}>Retour à un fonctionnement positif</Text>
        <Text style={styles.paragraph}>{phase.stress.recoveryAdvice}</Text>
        <PageFooter />
      </Page>

      {/* Plan d'action */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Plan d'action</Text>
        <Text style={styles.h2}>Pistes concrètes</Text>
        <Text style={styles.h3}>Au quotidien</Text>
        <Bullets items={plan.daily} />
        <Text style={styles.h3}>Chaque semaine</Text>
        <Bullets items={plan.weekly} />
        <Text style={styles.h3}>Côté professionnel</Text>
        <Bullets items={plan.professional} />
        <Text style={styles.h3}>Côté personnel</Text>
        <Bullets items={plan.personal} />
        <Text style={styles.h3}>Stratégie de communication</Text>
        <Text style={styles.paragraph}>{plan.communicationStrategy}</Text>
        <Text style={styles.h3}>Prévention du stress</Text>
        <Text style={styles.paragraph}>{plan.stressPrevention}</Text>
        <Text style={styles.h3}>Questions de réflexion</Text>
        <Bullets items={plan.reflectionQuestions} />
        <PageFooter />
      </Page>

      {/* Méthode et limites */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Méthode et limites</Text>
        <Text style={styles.h2}>À propos de ce rapport</Text>
        <View style={styles.row}>
          <Text>Version du questionnaire</Text>
          <Text>{result.assessmentVersion}</Text>
        </View>
        <View style={styles.row}>
          <Text>Version du scoring</Text>
          <Text>{result.scoringVersion}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date de génération</Text>
          <Text>{formatDate(data.generatedAt)}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.paragraph}>
          Cet outil est expérimental et n'a fait l'objet d'aucune validation psychométrique
          officielle (test-retest, comparaison à des profils certifiés, étude de la désirabilité
          sociale). Le barème et les pondérations utilisés sont provisoires et pourront être
          recalibrés (voir docs/SOURCE_MAPPING.md et docs/SCORING.md du projet).
        </Text>
        <Text style={styles.paragraph}>
          Les hypothèses présentées ici gagnent à être confirmées ou nuancées par un échange
          qualitatif avec la personne concernée, plutôt que prises comme un verdict définitif.
        </Text>
        <View style={styles.notice}>
          <Text>{DISCLAIMER}</Text>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
