/**
 * Contenu narratif ORIGINAL du rapport, pour chacun des six types. Redige a partir des
 * correspondances verifiees dans docs/SOURCE_MAPPING.md §2.2 (perception, points forts, besoins,
 * canal, style, environnement, partie, sequence de stress), jamais copie du manuel, de la
 * matrice ou du rapport de Mike -- voir la mise en garde de docs/SOURCE_MAPPING.md §3.3.
 * Langage volontairement neutre et non culpabilisant (mission §5, §12.1).
 */
import type { TypeCode } from "@/scoring/types";

export interface TypeProfile {
  name: string;
  perceptionLabel: string;
  perceptionDescription: string;
  strengths: string[];
  strengthsNarrative: string;
  overuseRisk: string;
  styleUse: string;
  styleAvoid: string;
  styleNarrative: string;
  part: string;
  partNarrative: string;
  channel: string;
  channelGoodPhrasing: string;
  channelPoorPhrasing: string;
  environment: string;
  environmentFavorable: string;
  environmentCostly: string;
  need: string;
  needPositiveSign: string;
  needLackSign: string;
  stress: {
    driver: string;
    entry: string;
    mask: string;
    cave: string;
    recoveryAdvice: string;
  };
}

export const TYPE_PROFILES: Record<TypeCode, TypeProfile> = {
  AN: {
    name: "Analyseur",
    perceptionLabel: "Pensées factuelles",
    perceptionDescription:
      "Ce type lit le monde d'abord à travers les faits, les enchaînements logiques et les informations vérifiables. Il cherche naturellement à comprendre « ce qui s'est passé » avant de se prononcer.",
    strengths: ["Logique", "Responsable", "Organisé"],
    strengthsNarrative:
      "Sa force tient à sa capacité à clarifier une situation complexe, à tenir ses engagements et à structurer un travail dans la durée.",
    overuseRisk:
      "Poussée trop loin, cette force peut virer à la sur-analyse ou à un besoin excessif de tout contrôler avant d'agir.",
    styleUse: "Démocratique",
    styleAvoid: "Autocratique",
    styleNarrative:
      "Il donne le meilleur de lui-même quand on l'associe à la réflexion plutôt qu'on ne lui impose une décision toute faite.",
    part: "Ordinateur",
    partNarrative:
      "Il traite l'information avec méthode, comme on organiserait des données avant de les exploiter.",
    channel: "Interrogatif",
    channelGoodPhrasing: "« Quelles informations te manquent pour avancer ? »",
    channelPoorPhrasing:
      "Un ordre sec sans contexte, ou un discours purement émotionnel sans faits à l'appui.",
    environment: "Seul ou en duo",
    environmentFavorable: "Un cadre calme, avec des objectifs et des données claires.",
    environmentCostly: "Un environnement flou, bruyant ou dénué de repères organisationnels.",
    need: "Reconnaissance du travail productif et structuration du temps",
    needPositiveSign:
      "Il se sent nourri quand son travail est vu, utile, et que le temps est bien cadré.",
    needLackSign:
      "En cas de manque, il peut sur-détailler ses explications ou se replier sur un contrôle minutieux de tout ce qui l'entoure.",
    stress: {
      driver: "« Sois parfait »",
      entry:
        "Il commence à sur-qualifier ses propos et à compliquer des explications qui pourraient rester simples.",
      mask: "Sous tension plus forte, il peut devenir critique envers l'ordre, la rigueur ou les responsabilités des autres.",
      cave: "Si rien ne change, il finit par se sentir incompétent et se couper des autres.",
      recoveryAdvice:
        "Reconnaître concrètement ce qui a déjà été accompli et proposer un cadre clair aide à désamorcer rapidement cette spirale."
    }
  },
  PE: {
    name: "Persévérant",
    perceptionLabel: "Opinions",
    perceptionDescription:
      "Ce type filtre les situations à travers ses convictions : il se demande spontanément ce qui est juste, cohérent ou important, plus que ce qui est simplement vrai au sens factuel.",
    strengths: ["Engagé", "Observateur", "Consciencieux"],
    strengthsNarrative:
      "Il apporte une fidélité rare à ce qui compte pour lui, une capacité d'observation fine et un sens aigu de la responsabilité.",
    overuseRisk:
      "Cette force peut se transformer en rigidité ou en jugement sévère envers ce qu'il juge incohérent.",
    styleUse: "Démocratique",
    styleAvoid: "Autocratique",
    styleNarrative:
      "Il s'investit pleinement quand on sollicite son avis plutôt qu'on ne le lui impose.",
    part: "Ordinateur",
    partNarrative:
      "Comme l'Analyseur, il traite l'information avec méthode, mais au filtre de ses valeurs.",
    channel: "Interrogatif",
    channelGoodPhrasing: "« Quel est ton avis sur ce qui compte ici ? »",
    channelPoorPhrasing:
      "Un ordre qui ignore ses convictions, ou une remise en cause de son intégrité.",
    environment: "Seul ou en duo",
    environmentFavorable:
      "Un cadre où il peut approfondir un sujet qui a du sens avec une ou deux personnes de confiance.",
    environmentCostly: "Un environnement superficiel, où rien ne peut être vraiment approfondi.",
    need: "Reconnaissance du travail dévoué et conviction",
    needPositiveSign:
      "Il se sent nourri quand son engagement est vu et que ses convictions trouvent un espace d'expression.",
    needLackSign:
      "En cas de manque, il peut se focaliser de plus en plus sur ce qui ne va pas autour de lui.",
    stress: {
      driver: "« Sois parfait pour moi »",
      entry:
        "Il pose des questions de plus en plus pointues et se focalise sur les failles qu'il perçoit.",
      mask: "Sous tension plus forte, il peut partir en croisade pour imposer ses opinions et devenir méfiant.",
      cave: "Si rien ne change, il finit par se retirer de ceux qu'il juge insuffisamment engagés.",
      recoveryAdvice:
        "Reconnaître la légitimité de son point de vue et respecter la ligne qu'il défend permet un retour au calme."
    }
  },
  EM: {
    name: "Empathique",
    perceptionLabel: "Émotions",
    perceptionDescription:
      "Ce type ressent d'abord l'ambiance et la charge affective d'une situation, souvent avant même de pouvoir la mettre en mots.",
    strengths: ["Compatissant", "Sensible", "Chaleureux"],
    strengthsNarrative:
      "Il crée naturellement un climat de confiance et sait accueillir ce que les autres traversent.",
    overuseRisk:
      "Cette force peut conduire à trop s'adapter aux besoins des autres, au détriment des siens.",
    styleUse: "Bienveillant",
    styleAvoid: "Autocratique",
    styleNarrative:
      "Il donne le meilleur de lui-même dans un climat encourageant, jamais dans la confrontation directe.",
    part: "Réconforteur",
    partNarrative:
      "Il apporte chaleur et attention, comme on prendrait soin de quelqu'un avec douceur.",
    channel: "Nourricier",
    channelGoodPhrasing: "« Tu comptes pour moi, je suis content que tu sois là. »",
    channelPoorPhrasing:
      "Un ton froid ou strictement factuel, perçu comme un désintérêt pour la personne.",
    environment: "En groupe",
    environmentFavorable: "Un cercle proche et chaleureux, où la qualité du lien est perceptible.",
    environmentCostly: "Un environnement impersonnel, sans sentiment d'appartenance.",
    need: "Reconnaissance de la personne et sensoriel",
    needPositiveSign:
      "Il se sent nourri quand on le reconnaît pour ce qu'il est, dans un cadre agréable aux sens.",
    needLackSign: "En cas de manque, il peut se suradapter et avoir du mal à affirmer un refus.",
    stress: {
      driver: "« Fais plaisir »",
      entry: "Il ose de moins en moins dire non et perd en fermeté dans ses positions.",
      mask: "Sous tension plus forte, il peut multiplier les maladresses et se dévaloriser lui-même.",
      cave: "Si rien ne change, il finit par se sentir rejeté et mal aimé.",
      recoveryAdvice:
        "Une reconnaissance sincère de sa personne, sans exigence de performance, restaure rapidement la confiance."
    }
  },
  IM: {
    name: "Imagineur",
    perceptionLabel: "Inactions et réflexions",
    perceptionDescription:
      "Ce type a besoin de retrait pour laisser une situation infuser intérieurement avant de réagir ; son monde se déploie d'abord dans la réflexion silencieuse.",
    strengths: ["Imaginatif", "Réfléchi", "Calme"],
    strengthsNarrative:
      "Il apporte une profondeur de réflexion et un calme précieux dans les moments agités.",
    overuseRisk:
      "Cette force peut se muer en isolement excessif ou en difficulté à passer à l'action.",
    styleUse: "Autocratique",
    styleAvoid: "Laissez-faire",
    styleNarrative:
      "Contrairement à une idée reçue, il a besoin d'une direction claire et concise, pas d'être livré à lui-même sans repère.",
    part: "Ordinateur en interne, mais approché via le Directeur",
    partNarrative:
      "Il traite l'information avec calme et retenue, mais reçoit le mieux une consigne brève et directe plutôt qu'un long échange.",
    channel: "Directif",
    channelGoodPhrasing: "« Prends le temps, puis reviens quand ce sera clair. »",
    channelPoorPhrasing:
      "Une sollicitation trop fréquente ou trop longue, qui ne laisse aucun espace de retrait.",
    environment: "Seul",
    environmentFavorable: "Un espace calme, peu sollicité, avec une mission claire.",
    environmentCostly: "Un environnement bruyant, intrusif ou constamment sollicitant.",
    need: "Solitude",
    needPositiveSign:
      "Il se sent nourri par de vrais moments seul, sans culpabilité à les prendre.",
    needLackSign: "En cas de manque, il peut se disperser et éviter de prendre des initiatives.",
    stress: {
      driver: "« Sois fort »",
      entry: "Il évite les initiatives et se disperse plutôt que d'avancer.",
      mask: "Sous tension plus forte, il attend passivement et se retire davantage, laissant des choses inachevées.",
      cave: "Si rien ne change, il finit par se sentir oublié et mis de côté.",
      recoveryAdvice:
        "Une direction simple et le respect de son besoin d'espace suffisent souvent à le remobiliser."
    }
  },
  EN: {
    name: "Énergiseur",
    perceptionLabel: "Réactions (j'aime / je n'aime pas)",
    perceptionDescription:
      "Ce type réagit d'abord instinctivement à ce qui l'entoure : il sait vite s'il aime ou non une situation, sans détour analytique.",
    strengths: ["Spontané", "Créatif", "Ludique"],
    strengthsNarrative:
      "Il apporte une vivacité et une créativité qui allègent les situations les plus pesantes.",
    overuseRisk:
      "Cette force peut glisser vers la dispersion ou la difficulté à s'engager dans la durée.",
    styleUse: "Laissez-faire",
    styleAvoid: "Autocratique",
    styleNarrative:
      "Il s'épanouit quand on lui laisse de la liberté pour trouver sa propre manière de faire.",
    part: "Émoteur",
    partNarrative: "Il exprime ce qu'il ressent avec spontanéité, sans filtre excessif.",
    channel: "Émotif",
    channelGoodPhrasing: "« Viens, on essaie autrement, ça peut être sympa. »",
    channelPoorPhrasing: "Un discours trop sérieux, rigide ou dénué de toute légèreté.",
    environment: "De groupe en groupe",
    environmentFavorable: "Des contacts variés, du mouvement, une part d'imprévu.",
    environmentCostly: "Un environnement monotone, fermé, sans diversité de contacts.",
    need: "Contact",
    needPositiveSign: "Il se sent nourri par des échanges vivants, spontanés et réguliers.",
    needLackSign:
      "En cas de manque, il peut répondre de travers ou peiner à s'investir dans ce qu'on lui demande.",
    stress: {
      driver: "« Fais des efforts »",
      entry: "Il rame sur les tâches, répond indirectement ou délègue trop vite.",
      mask: "Sous tension plus forte, il peut râler, dire « oui, mais » et reporter la faute sur le contexte.",
      cave: "Si rien ne change, il finit par se sentir censuré ou rejeté par le groupe.",
      recoveryAdvice:
        "Retrouver du contact léger et un peu de jeu suffit souvent à relancer sa dynamique."
    }
  },
  PR: {
    name: "Promoteur",
    perceptionLabel: "Actions",
    perceptionDescription:
      "Ce type perçoit d'abord le monde en termes d'actions possibles : il repère vite ce qui peut être fait, changé ou saisi comme opportunité.",
    strengths: ["Adaptable", "Persuasif", "Charmeur"],
    strengthsNarrative:
      "Il sait s'ajuster vite à une situation nouvelle et entraîner les autres vers l'action.",
    overuseRisk:
      "Cette force peut basculer vers la prise de risque excessive ou le contournement des règles.",
    styleUse: "Autocratique",
    styleAvoid: "Démocratique",
    styleNarrative:
      "Il avance le plus vite quand on lui fixe un cap clair et qu'on le laisse ensuite agir librement.",
    part: "Directeur",
    partNarrative: "Il donne le cap et pousse vers l'action, avec assurance.",
    channel: "Directif",
    channelGoodPhrasing: "« Voici le défi, à toi de jouer. »",
    channelPoorPhrasing:
      "De longues délibérations sans issue concrète, ou une consultation prolongée avant d'agir.",
    environment: "De groupe en groupe",
    environmentFavorable: "Un contexte qui bouge, riche en occasions à saisir.",
    environmentCostly: "Un environnement sans rythme, sans défi ni occasion à saisir.",
    need: "Excitation",
    needPositiveSign:
      "Il se sent nourri par un défi, une intensité ou une occasion concrète à saisir.",
    needLackSign:
      "En cas de manque, il peut attendre que les autres se débrouillent plutôt que de s'investir.",
    stress: {
      driver: "« Sois fort pour moi »",
      entry:
        "Il parle davantage en « tu » qu'en « je » et attend que les autres prennent les choses en main.",
      mask: "Sous tension plus forte, il peut chercher à manipuler la situation ou provoquer des tensions.",
      cave: "Si rien ne change, il finit par abandonner les autres, ou par agir de façon à être lui-même mis de côté.",
      recoveryAdvice:
        "Un objectif concret et une vraie marge d'action permettent de retrouver rapidement une dynamique positive."
    }
  }
};
