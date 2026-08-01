/**
 * Donnees PUBLIQUES du questionnaire (texte des 45 items, blocs, ids d'options opaques).
 *
 * GENERE AUTOMATIQUEMENT par `npm run generate:public-items` a partir de
 * `supabase/seed/items.v0.2.ts` (source de verite privee). NE PAS EDITER A LA MAIN --
 * toute correction de texte doit se faire dans le fichier source, puis regenerer ce fichier.
 *
 * Ce fichier ne contient AUCUN code de type (AN/PE/EM/IM/EN/PR) : voir docs/SOURCE_MAPPING.md
 * §1.3 et §4.4 pour la raison de cette separation stricte.
 */

export interface PublicAssessmentOption {
  id: string;
  text: string;
}

export interface PublicAssessmentItem {
  id: number;
  blockId: "block1" | "block2" | "block3" | "block4" | "block5" | "block6" | "block7" | "block8";
  prompt: string;
  options: PublicAssessmentOption[];
}

export interface AssessmentBlockMeta {
  id: "block1" | "block2" | "block3" | "block4" | "block5" | "block6" | "block7" | "block8";
  label: string;
  itemRange: [number, number];
}

export const ASSESSMENT_BLOCKS: AssessmentBlockMeta[] = [
  {
    id: "block1",
    label: "Base naturelle",
    itemRange: [1, 10]
  },
  {
    id: "block2",
    label: "Perceptions et langage",
    itemRange: [11, 17]
  },
  {
    id: "block3",
    label: "Points forts et styles d'interaction",
    itemRange: [18, 24]
  },
  {
    id: "block4",
    label: "Canaux de communication",
    itemRange: [25, 29]
  },
  {
    id: "block5",
    label: "Environnements preferes",
    itemRange: [30, 33]
  },
  {
    id: "block6",
    label: "Besoins psychologiques actuels",
    itemRange: [34, 38]
  },
  {
    id: "block7",
    label: "Stress actuel",
    itemRange: [39, 42]
  },
  {
    id: "block8",
    label: "Phasage et coherence temporelle",
    itemRange: [43, 45]
  }
];

export const ASSESSMENT_ITEMS: PublicAssessmentItem[] = [
  {
    id: 1,
    blockId: "block1",
    prompt: "Quand une situation nouvelle se présente à moi, mon premier réflexe est plutôt de...",
    options: [
      {
        id: "item-1-A",
        text: "Chercher à comprendre les faits, les étapes et les informations utiles."
      },
      {
        id: "item-1-B",
        text: "Évaluer ce que la situation signifie au regard de mes principes."
      },
      {
        id: "item-1-C",
        text: "Ressentir l'ambiance et la manière dont les personnes vivent la situation."
      },
      {
        id: "item-1-D",
        text: "Prendre un temps intérieur pour me représenter calmement la situation."
      },
      {
        id: "item-1-E",
        text: "Réagir spontanément à ce qui me plaît, m'amuse ou m'agace."
      },
      {
        id: "item-1-F",
        text: "Repérer rapidement le levier concret qui permettrait d'avancer."
      }
    ]
  },
  {
    id: 2,
    blockId: "block1",
    prompt:
      "Quand je suis vraiment à l'aise, sans pression, les autres me voient plutôt comme quelqu'un de...",
    options: [
      {
        id: "item-2-A",
        text: "Attentif, chaleureux et soucieux du bien-être des personnes."
      },
      {
        id: "item-2-B",
        text: "Direct, adaptable et capable de saisir les occasions."
      },
      {
        id: "item-2-C",
        text: "Fiable, clair et organisé dans ce qu'il entreprend."
      },
      {
        id: "item-2-D",
        text: "Vivant, spontané et capable de mettre de l'énergie."
      },
      {
        id: "item-2-E",
        text: "Calme, discret et capable de réfléchir en profondeur."
      },
      {
        id: "item-2-F",
        text: "Engagé, observateur et attaché à ce qui a du sens."
      }
    ]
  },
  {
    id: 3,
    blockId: "block1",
    prompt: "Dans un groupe, ce que j'apporte naturellement, c'est surtout...",
    options: [
      {
        id: "item-3-A",
        text: "Une énergie légère, créative ou stimulante."
      },
      {
        id: "item-3-B",
        text: "Du recul, du calme et un espace de réflexion."
      },
      {
        id: "item-3-C",
        text: "Un cap fondé sur des principes et un engagement soutenu."
      },
      {
        id: "item-3-D",
        text: "Une attention aux personnes et à la qualité du lien."
      },
      {
        id: "item-3-E",
        text: "Une impulsion concrète pour que les choses bougent."
      },
      {
        id: "item-3-F",
        text: "Une organisation, une méthode ou une clarification."
      }
    ]
  },
  {
    id: 4,
    blockId: "block1",
    prompt: "Quand quelqu'un me parle d'un problème, je suis tenté de...",
    options: [
      {
        id: "item-4-A",
        text: "Évaluer avec lui ce qui est juste, important ou prioritaire."
      },
      {
        id: "item-4-B",
        text: "Poser des questions pour comprendre les faits et les causes."
      },
      {
        id: "item-4-C",
        text: "Lui proposer une action concrète pour débloquer la situation."
      },
      {
        id: "item-4-D",
        text: "Lui montrer que je comprends ce qu'il vit et qu'il n'est pas seul."
      },
      {
        id: "item-4-E",
        text: "Écouter en silence et prendre le temps de me représenter l'ensemble."
      },
      {
        id: "item-4-F",
        text: "Dédramatiser et remettre de la légèreté ou du mouvement dans l'échange."
      }
    ]
  },
  {
    id: 5,
    blockId: "block1",
    prompt: "Quand je dois expliquer quelque chose d'important, je privilégie...",
    options: [
      {
        id: "item-5-A",
        text: "Une image ou un scénario que chacun peut se représenter."
      },
      {
        id: "item-5-B",
        text: "Une formulation attentive à l'impact humain et relationnel."
      },
      {
        id: "item-5-C",
        text: "Des informations claires, ordonnées et vérifiables."
      },
      {
        id: "item-5-D",
        text: "Une manière ludique et expressive qui capte l'attention."
      },
      {
        id: "item-5-E",
        text: "Les raisons profondes, les convictions ou les principes en jeu."
      },
      {
        id: "item-5-F",
        text: "Un message court, orienté décision et passage à l'action."
      }
    ]
  },
  {
    id: 6,
    blockId: "block1",
    prompt: "Depuis longtemps, on m'a souvent reconnu une capacité à...",
    options: [
      {
        id: "item-6-A",
        text: "M'adapter rapidement et trouver une issue dans une situation difficile."
      },
      {
        id: "item-6-B",
        text: "Structurer, anticiper ou rendre les choses plus efficaces."
      },
      {
        id: "item-6-C",
        text: "Stimuler une ambiance plus libre, drôle ou originale."
      },
      {
        id: "item-6-D",
        text: "M'engager durablement et défendre ce qui compte pour moi."
      },
      {
        id: "item-6-E",
        text: "Rester calme, observer et réfléchir sans me précipiter."
      },
      {
        id: "item-6-F",
        text: "Être présent pour les autres avec chaleur et sensibilité."
      }
    ]
  },
  {
    id: 7,
    blockId: "block1",
    prompt: "Face à l'inconnu, je me sens plus solide quand...",
    options: [
      {
        id: "item-7-A",
        text: "Je sens une présence humaine rassurante autour de moi."
      },
      {
        id: "item-7-B",
        text: "J'ai assez d'espace pour réfléchir sans être pressé."
      },
      {
        id: "item-7-C",
        text: "Je peux m'appuyer sur des principes et des engagements clairs."
      },
      {
        id: "item-7-D",
        text: "J'ai une marge de manœuvre pour agir et ajuster."
      },
      {
        id: "item-7-E",
        text: "Les objectifs, les contraintes et les délais sont clarifiés."
      },
      {
        id: "item-7-F",
        text: "Je peux essayer, improviser et garder une part de liberté."
      }
    ]
  },
  {
    id: 8,
    blockId: "block1",
    prompt: "Ce qui m'agace le plus spontanément chez les autres, c'est quand ils...",
    options: [
      {
        id: "item-8-A",
        text: "Laissent les choses floues ou mal organisées."
      },
      {
        id: "item-8-B",
        text: "Rendent l'échange lourd, rigide ou ennuyeux."
      },
      {
        id: "item-8-C",
        text: "M'envahissent ou ne me laissent aucun espace."
      },
      {
        id: "item-8-D",
        text: "Agissent sans profondeur, engagement ou cohérence."
      },
      {
        id: "item-8-E",
        text: "Hésitent alors qu'une décision doit être prise."
      },
      {
        id: "item-8-F",
        text: "Se montrent froids ou peu attentionnés."
      }
    ]
  },
  {
    id: 9,
    blockId: "block1",
    prompt: "Quand je réussis quelque chose, je suis surtout satisfait si...",
    options: [
      {
        id: "item-9-A",
        text: "J'ai été fidèle à ce que je crois juste et important."
      },
      {
        id: "item-9-B",
        text: "J'ai su saisir une occasion et obtenir un résultat concret."
      },
      {
        id: "item-9-C",
        text: "Les personnes concernées se sentent bien et reconnues."
      },
      {
        id: "item-9-D",
        text: "Le résultat est propre, utile, structuré et maîtrisé."
      },
      {
        id: "item-9-E",
        text: "La solution a été pensée avec recul et justesse."
      },
      {
        id: "item-9-F",
        text: "Le chemin a été vivant, créatif ou stimulant."
      }
    ]
  },
  {
    id: 10,
    blockId: "block1",
    prompt: "Quand je dois décider, je commence généralement par...",
    options: [
      {
        id: "item-10-A",
        text: "Sentir instinctivement si l'option me plaît ou me déplaît."
      },
      {
        id: "item-10-B",
        text: "Comparer les informations et les conséquences pratiques."
      },
      {
        id: "item-10-C",
        text: "Vérifier si la décision est alignée avec mes convictions."
      },
      {
        id: "item-10-D",
        text: "Laisser reposer pour voir ce qui émerge."
      },
      {
        id: "item-10-E",
        text: "Choisir une voie et corriger ensuite si nécessaire."
      },
      {
        id: "item-10-F",
        text: "Tenir compte de ce que cela fera vivre aux personnes."
      }
    ]
  },
  {
    id: 11,
    blockId: "block2",
    prompt: "Quand je raconte une journée marquante, je parle surtout...",
    options: [
      {
        id: "item-11-A",
        text: "De ce qui s'est passé, dans quel ordre et avec quels faits."
      },
      {
        id: "item-11-B",
        text: "De ce que cela m'a fait ressentir ou vivre humainement."
      },
      {
        id: "item-11-C",
        text: "De ce que j'ai jugé cohérent, discutable ou important."
      },
      {
        id: "item-11-D",
        text: "De ce que j'ai fait, décidé ou provoqué."
      },
      {
        id: "item-11-E",
        text: "De ce que cela m'a fait imaginer ou visualiser."
      },
      {
        id: "item-11-F",
        text: "De ce que j'ai adoré, détesté ou trouvé drôle."
      }
    ]
  },
  {
    id: 12,
    blockId: "block2",
    prompt: "En réunion, quand je prends la parole, j'ai tendance à...",
    options: [
      {
        id: "item-12-A",
        text: "Aller directement vers ce qu'il faut tenter ou décider."
      },
      {
        id: "item-12-B",
        text: "Communiquer avec spontanéité pour remettre de l'énergie."
      },
      {
        id: "item-12-C",
        text: "Clarifier les données, les options ou les étapes."
      },
      {
        id: "item-12-D",
        text: "Ramener l'attention sur les personnes concernées."
      },
      {
        id: "item-12-E",
        text: "Rappeler ce qui est important, juste ou non négociable."
      },
      {
        id: "item-12-F",
        text: "Proposer une hypothèse ou un scénario qui aide à prendre du recul."
      }
    ]
  },
  {
    id: 13,
    blockId: "block2",
    prompt: "Quand j'écoute quelqu'un, je repère vite...",
    options: [
      {
        id: "item-13-A",
        text: "Les opinions, les convictions et les incohérences de fond."
      },
      {
        id: "item-13-B",
        text: "Les images, scénarios ou possibilités que ses propos font naître."
      },
      {
        id: "item-13-C",
        text: "L'état émotionnel de la personne."
      },
      {
        id: "item-13-D",
        text: "Les informations manquantes ou mal organisées."
      },
      {
        id: "item-13-E",
        text: "L'action possible ou le levier immédiatement disponible."
      },
      {
        id: "item-13-F",
        text: "Ce que j'aime, ce qui m'agace ou ce qui me fait réagir."
      }
    ]
  },
  {
    id: 14,
    blockId: "block2",
    prompt: "Pour comprendre un problème, je demande plutôt...",
    options: [
      {
        id: "item-14-A",
        text: "Comment les personnes vivent la situation."
      },
      {
        id: "item-14-B",
        text: "Qui fait quoi, quand, comment et avec quelles contraintes."
      },
      {
        id: "item-14-C",
        text: "Quelle action permettrait de débloquer rapidement la situation."
      },
      {
        id: "item-14-D",
        text: "Pourquoi cela compte et selon quels principes l'évaluer."
      },
      {
        id: "item-14-E",
        text: "Ce qui plaît, agace ou donne envie dans la situation."
      },
      {
        id: "item-14-F",
        text: "Quels scénarios ou possibilités imaginer avant d'agir."
      }
    ]
  },
  {
    id: 15,
    blockId: "block2",
    prompt: "La formulation qui me ressemble le plus serait...",
    options: [
      {
        id: "item-15-A",
        text: "J'ai besoin de me représenter la situation."
      },
      {
        id: "item-15-B",
        text: "À mon avis, il y a un vrai sujet de fond."
      },
      {
        id: "item-15-C",
        text: "J'adore l'idée... ou alors pas du tout !"
      },
      {
        id: "item-15-D",
        text: "Quelles sont les informations disponibles ?"
      },
      {
        id: "item-15-E",
        text: "Je ressens que cela touche les personnes."
      },
      {
        id: "item-15-F",
        text: "On y va, on teste et on ajuste."
      }
    ]
  },
  {
    id: 16,
    blockId: "block2",
    prompt: "Quand quelque chose ne va pas, je dis plutôt...",
    options: [
      {
        id: "item-16-A",
        text: "On change de stratégie et on agit."
      },
      {
        id: "item-16-B",
        text: "Je sens que quelque chose ne va pas entre nous."
      },
      {
        id: "item-16-C",
        text: "Il manque des éléments pour décider correctement."
      },
      {
        id: "item-16-D",
        text: "Franchement, cela ne me donne pas envie."
      },
      {
        id: "item-16-E",
        text: "Je vais prendre du recul avant de répondre."
      },
      {
        id: "item-16-F",
        text: "Ce n'est pas cohérent avec ce qui avait été dit."
      }
    ]
  },
  {
    id: 17,
    blockId: "block2",
    prompt: "Je me sens compris quand l'autre...",
    options: [
      {
        id: "item-17-A",
        text: "Réagit avec naturel, humour ou spontanéité."
      },
      {
        id: "item-17-B",
        text: "Me répond clairement et précisément."
      },
      {
        id: "item-17-C",
        text: "Me laisse du temps et ne m'envahit pas."
      },
      {
        id: "item-17-D",
        text: "S'intéresse réellement à mon avis et à mes critères."
      },
      {
        id: "item-17-E",
        text: "Va droit au but et me donne une marge d'action."
      },
      {
        id: "item-17-F",
        text: "Me montre une attention sincère."
      }
    ]
  },
  {
    id: 18,
    blockId: "block3",
    prompt: "Dans une équipe, ma valeur ajoutée est souvent de...",
    options: [
      {
        id: "item-18-A",
        text: "Mettre de l'ordre et rendre l'avancement plus clair."
      },
      {
        id: "item-18-B",
        text: "Débloquer une situation par une action concrète."
      },
      {
        id: "item-18-C",
        text: "Préserver le lien, l'écoute et l'attention aux personnes."
      },
      {
        id: "item-18-D",
        text: "Maintenir le cap, l'engagement et le sens."
      },
      {
        id: "item-18-E",
        text: "Apporter créativité, légèreté et mouvement."
      },
      {
        id: "item-18-F",
        text: "Garder une distance calme pour mieux penser."
      }
    ]
  },
  {
    id: 19,
    blockId: "block3",
    prompt: "Quand j'influence ou j'encadre quelqu'un, je préfère...",
    options: [
      {
        id: "item-19-A",
        text: "Encourager la personne et nourrir sa confiance."
      },
      {
        id: "item-19-B",
        text: "Donner une direction simple, puis lui laisser le temps d'agir seule."
      },
      {
        id: "item-19-C",
        text: "L'associer à l'analyse des options, des étapes et des responsabilités."
      },
      {
        id: "item-19-D",
        text: "Lui offrir des options et de la liberté pour trouver sa manière de faire."
      },
      {
        id: "item-19-E",
        text: "Fixer directement un objectif ou un défi, puis la laisser agir."
      },
      {
        id: "item-19-F",
        text: "Solliciter son avis et construire l'engagement autour de critères clairs."
      }
    ]
  },
  {
    id: 20,
    blockId: "block3",
    prompt: "Quand quelqu'un m'encadre efficacement, il...",
    options: [
      {
        id: "item-20-A",
        text: "Me donne un objectif direct ou un défi concret, puis me laisse agir."
      },
      {
        id: "item-20-B",
        text: "Clarifie les attendus et m'associe à l'analyse des options."
      },
      {
        id: "item-20-C",
        text: "Me demande mon avis et reconnaît mon engagement."
      },
      {
        id: "item-20-D",
        text: "Me laisse essayer, choisir et apporter ma touche."
      },
      {
        id: "item-20-E",
        text: "Me donne une direction simple sans multiplier les échanges."
      },
      {
        id: "item-20-F",
        text: "Me reconnaît personnellement et crée un climat bienveillant."
      }
    ]
  },
  {
    id: 21,
    blockId: "block3",
    prompt: "Dans un projet difficile, je deviens utile parce que...",
    options: [
      {
        id: "item-21-A",
        text: "Je remets de la vie quand l'ambiance devient pesante."
      },
      {
        id: "item-21-B",
        text: "Je rappelle pourquoi le projet mérite qu'on s'y tienne."
      },
      {
        id: "item-21-C",
        text: "Je prends du recul, reste calme et laisse émerger une solution."
      },
      {
        id: "item-21-D",
        text: "Je planifie, je clarifie et je fiabilise l'exécution."
      },
      {
        id: "item-21-E",
        text: "Je fais attention à ceux qui décrochent ou souffrent."
      },
      {
        id: "item-21-F",
        text: "Je tranche, j'ose et je fais bouger les lignes."
      }
    ]
  },
  {
    id: 22,
    blockId: "block3",
    prompt: "Même lorsqu'elle est peu visible, ma contribution consiste souvent à...",
    options: [
      {
        id: "item-22-A",
        text: "Prendre du recul et approfondir avant de parler."
      },
      {
        id: "item-22-B",
        text: "Repérer les besoins humains qui risquent d'être oubliés."
      },
      {
        id: "item-22-C",
        text: "Sentir rapidement une ouverture ou une occasion à saisir."
      },
      {
        id: "item-22-D",
        text: "Sécuriser les détails et la cohérence de l'ensemble."
      },
      {
        id: "item-22-E",
        text: "Faire émerger une idée originale ou une nouvelle énergie."
      },
      {
        id: "item-22-F",
        text: "Apporter un jugement fondé sur des principes et des observations."
      }
    ]
  },
  {
    id: 23,
    blockId: "block3",
    prompt: "Ce qui me donne envie de suivre quelqu'un, c'est surtout...",
    options: [
      {
        id: "item-23-A",
        text: "Son intégrité, sa loyauté et la cohérence de ses actes."
      },
      {
        id: "item-23-B",
        text: "Sa compétence, sa clarté et sa fiabilité."
      },
      {
        id: "item-23-C",
        text: "Sa capacité à rendre les choses vivantes et stimulantes."
      },
      {
        id: "item-23-D",
        text: "Sa chaleur humaine et son attention sincère."
      },
      {
        id: "item-23-E",
        text: "Son calme, ses indications simples et l'espace qu'il laisse."
      },
      {
        id: "item-23-F",
        text: "Son audace, sa force de décision et son sens de l'occasion."
      }
    ]
  },
  {
    id: 24,
    blockId: "block3",
    prompt: "Quand je fonctionne au meilleur de moi-même, j'ai tendance à...",
    options: [
      {
        id: "item-24-A",
        text: "Décider vite, saisir les occasions et obtenir des résultats."
      },
      {
        id: "item-24-B",
        text: "Créer un climat chaleureux et prendre soin des personnes."
      },
      {
        id: "item-24-C",
        text: "Organiser le travail, tenir les délais et fiabiliser les résultats."
      },
      {
        id: "item-24-D",
        text: "M'engager pleinement et défendre un cap qui a du sens."
      },
      {
        id: "item-24-E",
        text: "Travailler avec calme, concentration et recul."
      },
      {
        id: "item-24-F",
        text: "Faire circuler l'énergie, les idées et la spontanéité."
      }
    ]
  },
  {
    id: 25,
    blockId: "block4",
    prompt: "Quand on veut me transmettre une information importante, je préfère qu'on...",
    options: [
      {
        id: "item-25-A",
        text: "Me parle avec chaleur et attention."
      },
      {
        id: "item-25-B",
        text: "Me donne des éléments clairs, précis et ordonnés."
      },
      {
        id: "item-25-C",
        text: "Me dise directement ce qui est attendu ou à faire."
      },
      {
        id: "item-25-D",
        text: "M'aborde avec naturel, énergie et légèreté."
      },
      {
        id: "item-25-E",
        text: "Me permette de donner mon avis et de comprendre le sens."
      },
      {
        id: "item-25-F",
        text: "Me donne une consigne simple et du temps pour intégrer."
      }
    ]
  },
  {
    id: 26,
    blockId: "block4",
    prompt: "Quand je demande une contribution à quelqu'un, je commence plutôt par...",
    options: [
      {
        id: "item-26-A",
        text: "Formuler directement ce que j'attends."
      },
      {
        id: "item-26-B",
        text: "Créer un climat de confiance et de considération."
      },
      {
        id: "item-26-C",
        text: "Établir un contact ludique avant d'entrer dans le sujet."
      },
      {
        id: "item-26-D",
        text: "Poser des questions pour clarifier la situation."
      },
      {
        id: "item-26-E",
        text: "Donner une indication courte, puis laisser l'autre traiter."
      },
      {
        id: "item-26-F",
        text: "Demander son avis sur le sens et les critères à retenir."
      }
    ]
  },
  {
    id: 27,
    blockId: "block4",
    prompt: "Je décroche facilement quand l'autre...",
    options: [
      {
        id: "item-27-A",
        text: "Me sollicite trop vite ou trop longtemps sans pause."
      },
      {
        id: "item-27-B",
        text: "Rend l'échange trop sérieux, plat ou verrouillé."
      },
      {
        id: "item-27-C",
        text: "Parle sans structure ou mélange trop de sujets."
      },
      {
        id: "item-27-D",
        text: "Tourne autour du pot sans jamais décider."
      },
      {
        id: "item-27-E",
        text: "Oublie complètement la dimension humaine."
      },
      {
        id: "item-27-F",
        text: "Ignore mon point de vue ou le sens du sujet."
      }
    ]
  },
  {
    id: 28,
    blockId: "block4",
    prompt: "Dans un échange tendu, ce qui me remet le plus en lien, c'est...",
    options: [
      {
        id: "item-28-A",
        text: "Qu'on reconnaisse la légitimité de mon point de vue."
      },
      {
        id: "item-28-B",
        text: "Qu'on me parle avec douceur et respect personnel."
      },
      {
        id: "item-28-C",
        text: "Qu'on reprenne les faits calmement et clairement."
      },
      {
        id: "item-28-D",
        text: "Qu'on relâche la tension par une touche de spontanéité."
      },
      {
        id: "item-28-E",
        text: "Qu'on propose une action concrète pour sortir du blocage."
      },
      {
        id: "item-28-F",
        text: "Qu'on me laisse un espace pour reprendre mes esprits."
      }
    ]
  },
  {
    id: 29,
    blockId: "block4",
    prompt: "La phrase que j'entends le mieux ressemble à...",
    options: [
      {
        id: "item-29-A",
        text: "Quelles informations te manquent pour avancer ?"
      },
      {
        id: "item-29-B",
        text: "Viens, on essaie autrement, cela peut être sympa."
      },
      {
        id: "item-29-C",
        text: "Prends le temps, puis reviens quand ce sera clair."
      },
      {
        id: "item-29-D",
        text: "Quel est ton avis sur ce qui compte ici ?"
      },
      {
        id: "item-29-E",
        text: "Tu comptes pour moi, je suis content que tu sois là."
      },
      {
        id: "item-29-F",
        text: "Voici le défi, à toi de jouer."
      }
    ]
  },
  {
    id: 30,
    blockId: "block5",
    prompt: "Je travaille le mieux quand...",
    options: [
      {
        id: "item-30-A",
        text: "Je fais partie d'un groupe proche où les relations comptent."
      },
      {
        id: "item-30-B",
        text: "Je peux avancer seul, avec une mission claire et peu d'interruptions."
      },
      {
        id: "item-30-C",
        text: "Je peux passer d'un groupe ou d'une situation à l'autre pour saisir les occasions."
      },
      {
        id: "item-30-D",
        text: "Je travaille seul ou en duo sur des objectifs et des données clairs."
      },
      {
        id: "item-30-E",
        text: "Je travaille seul ou en duo sur un sujet que je juge important."
      },
      {
        id: "item-30-F",
        text: "Je peux circuler de groupe en groupe et multiplier les échanges."
      }
    ]
  },
  {
    id: 31,
    blockId: "block5",
    prompt: "Dans les relations sociales, je préfère...",
    options: [
      {
        id: "item-31-A",
        text: "Passer librement d'un groupe à l'autre et varier les contacts."
      },
      {
        id: "item-31-B",
        text: "Approfondir un sujet important avec une ou deux personnes."
      },
      {
        id: "item-31-C",
        text: "Rester seul ou garder une distance confortable et choisie."
      },
      {
        id: "item-31-D",
        text: "Faire partie d'un cercle proche et engagé dans la relation."
      },
      {
        id: "item-31-E",
        text: "Rencontrer de nouvelles personnes et repérer rapidement les occasions."
      },
      {
        id: "item-31-F",
        text: "Échanger de façon ciblée avec une ou deux personnes."
      }
    ]
  },
  {
    id: 32,
    blockId: "block5",
    prompt: "Après une période dense, je retrouve plus facilement mon efficacité en...",
    options: [
      {
        id: "item-32-A",
        text: "Retrouvant seul ou en duo un cadre clair pour organiser mes idées."
      },
      {
        id: "item-32-B",
        text: "Changeant d'environnement et recherchant une nouvelle stimulation."
      },
      {
        id: "item-32-C",
        text: "Échangeant avec une personne de confiance sur ce qui a du sens."
      },
      {
        id: "item-32-D",
        text: "Retrouvant différents contacts, du jeu et du mouvement."
      },
      {
        id: "item-32-E",
        text: "M'isolant avec une consigne ou un objectif simple."
      },
      {
        id: "item-32-F",
        text: "Retrouvant un groupe proche et une ambiance chaleureuse."
      }
    ]
  },
  {
    id: 33,
    blockId: "block5",
    prompt: "Un environnement me pèse lorsqu'il est...",
    options: [
      {
        id: "item-33-A",
        text: "Sans rythme, sans défi ni occasion à saisir."
      },
      {
        id: "item-33-B",
        text: "Impersonnel, sans sentiment d'appartenance."
      },
      {
        id: "item-33-C",
        text: "Confus et peu propice à un échange ciblé."
      },
      {
        id: "item-33-D",
        text: "Trop bruyant, intrusif ou sollicitant."
      },
      {
        id: "item-33-E",
        text: "Superficiel ou sans possibilité d'approfondir."
      },
      {
        id: "item-33-F",
        text: "Monotone, fermé et sans diversité de contacts."
      }
    ]
  },
  {
    id: 34,
    blockId: "block6",
    prompt: "Aujourd'hui, je me sens vraiment nourri quand...",
    options: [
      {
        id: "item-34-A",
        text: "Mon engagement et mes convictions sont reconnus."
      },
      {
        id: "item-34-B",
        text: "J'ai du contact, de la spontanéité et des interactions vivantes."
      },
      {
        id: "item-34-C",
        text: "Mon travail est utile, reconnu et bien organisé dans le temps."
      },
      {
        id: "item-34-D",
        text: "J'ai de vrais moments de solitude sans culpabilité."
      },
      {
        id: "item-34-E",
        text: "Je vis un défi, une intensité ou une occasion à saisir."
      },
      {
        id: "item-34-F",
        text: "Je me sens apprécié comme personne, dans un cadre agréable."
      }
    ]
  },
  {
    id: 35,
    blockId: "block6",
    prompt: "Ces derniers temps, quand je vais moins bien, ce qui me manque le plus est...",
    options: [
      {
        id: "item-35-A",
        text: "Du temps seul pour ne plus être envahi."
      },
      {
        id: "item-35-B",
        text: "Une structure claire et une reconnaissance de ce que je produis."
      },
      {
        id: "item-35-C",
        text: "De la chaleur, de l'attention et du confort autour de moi."
      },
      {
        id: "item-35-D",
        text: "Le sentiment que mes efforts engagés sont vus et respectés."
      },
      {
        id: "item-35-E",
        text: "De l'action, du risque ou une occasion excitante."
      },
      {
        id: "item-35-F",
        text: "Des échanges simples, drôles ou spontanés."
      }
    ]
  },
  {
    id: 36,
    blockId: "block6",
    prompt: "Une journée réussie aujourd'hui, c'est surtout une journée où...",
    options: [
      {
        id: "item-36-A",
        text: "J'ai osé, décidé ou provoqué quelque chose."
      },
      {
        id: "item-36-B",
        text: "Je me suis senti reconnu, entouré et bien dans mon environnement."
      },
      {
        id: "item-36-C",
        text: "J'ai agi en cohérence avec mes valeurs."
      },
      {
        id: "item-36-D",
        text: "J'ai avancé efficacement sur des choses planifiées."
      },
      {
        id: "item-36-E",
        text: "J'ai eu du contact, du plaisir et de la liberté."
      },
      {
        id: "item-36-F",
        text: "J'ai pu être tranquille et préserver mon espace."
      }
    ]
  },
  {
    id: 37,
    blockId: "block6",
    prompt: "La forme de satisfaction qui me touche le plus actuellement ressemble à...",
    options: [
      {
        id: "item-37-A",
        text: "Ton travail est sérieux, utile et bien mené."
      },
      {
        id: "item-37-B",
        text: "Ta présence compte, tu es important pour nous."
      },
      {
        id: "item-37-C",
        text: "J'aime ton énergie, tu rends les choses plus vivantes."
      },
      {
        id: "item-37-D",
        text: "On voit ton engagement et la force de tes convictions."
      },
      {
        id: "item-37-E",
        text: "Tu peux prendre le temps et l'espace dont tu as besoin."
      },
      {
        id: "item-37-F",
        text: "Tu as assuré, tu as su prendre le bon risque."
      }
    ]
  },
  {
    id: 38,
    blockId: "block6",
    prompt: "Si je pouvais modifier mon quotidien pour aller mieux, j'ajouterais surtout...",
    options: [
      {
        id: "item-38-A",
        text: "Plus de moments de contact libre et spontané."
      },
      {
        id: "item-38-B",
        text: "Plus de solitude et moins de sollicitations."
      },
      {
        id: "item-38-C",
        text: "Plus de sens, d'intégrité et d'opinions partagées."
      },
      {
        id: "item-38-D",
        text: "Plus de douceur, de chaleur et d'attention personnelle."
      },
      {
        id: "item-38-E",
        text: "Plus de nouveauté, de défi et d'intensité."
      },
      {
        id: "item-38-F",
        text: "Plus de structure, de clarté et de maîtrise du temps."
      }
    ]
  },
  {
    id: 39,
    blockId: "block7",
    prompt: "Quand je commence à être sous stress, je remarque que...",
    options: [
      {
        id: "item-39-A",
        text: "Je donne des explications trop longues et je surdétaille."
      },
      {
        id: "item-39-B",
        text: "Je me suradapte, j'ose moins dire non et je manque de fermeté."
      },
      {
        id: "item-39-C",
        text: "Je réponds indirectement, je rame ou je délègue trop vite."
      },
      {
        id: "item-39-D",
        text: "Je pose des questions compliquées et me focalise sur ce qui ne va pas."
      },
      {
        id: "item-39-E",
        text: "Je parle davantage en « tu » qu'en « je » et j'attends que les autres se débrouillent."
      },
      {
        id: "item-39-F",
        text: "Je me disperse et j'évite de prendre des initiatives."
      }
    ]
  },
  {
    id: 40,
    blockId: "block7",
    prompt: "Quand la pression augmente, il peut m'arriver de...",
    options: [
      {
        id: "item-40-A",
        text: "Manipuler la situation, provoquer des tensions ou contourner les règles."
      },
      {
        id: "item-40-B",
        text: "Partir en croisade, imposer mes opinions et devenir suspicieux."
      },
      {
        id: "item-40-C",
        text: "Attendre passivement, me retirer davantage et laisser des choses inachevées."
      },
      {
        id: "item-40-D",
        text: "Surcontrôler et critiquer les erreurs, l'ordre ou les responsabilités."
      },
      {
        id: "item-40-E",
        text: "Râler, répondre « oui, mais » et reporter la faute sur l'extérieur."
      },
      {
        id: "item-40-F",
        text: "Faire des erreurs, me dénigrer et inviter involontairement la critique."
      }
    ]
  },
  {
    id: 41,
    blockId: "block7",
    prompt: "Quand le stress se prolonge et que la relation se détériore, il peut m'arriver de...",
    options: [
      {
        id: "item-41-A",
        text: "Finir par me faire rejeter et me sentir profondément mal aimé."
      },
      {
        id: "item-41-B",
        text: "Rejeter les autres et me sentir ensuite incompétent ou abattu."
      },
      {
        id: "item-41-C",
        text: "Finir par être censuré ou rejeté et me sentir condamné."
      },
      {
        id: "item-41-D",
        text: "Me faire oublier et me sentir laissé de côté."
      },
      {
        id: "item-41-E",
        text: "Délaisser ceux que je juge non engagés et me sentir dépité."
      },
      {
        id: "item-41-F",
        text: "Abandonner les autres ou agir de manière à être abandonné."
      }
    ]
  },
  {
    id: 42,
    blockId: "block7",
    prompt: "Quand je redescends en pression, je vois que mon vrai besoin était souvent...",
    options: [
      {
        id: "item-42-A",
        text: "Qu'on me laisse de l'espace, du silence ou de la solitude."
      },
      {
        id: "item-42-B",
        text: "Qu'on respecte mon engagement, mes principes ou mes convictions."
      },
      {
        id: "item-42-C",
        text: "Qu'il y ait plus d'intensité, de défi ou d'action."
      },
      {
        id: "item-42-D",
        text: "Qu'on me reconnaisse comme personne et qu'on me traite avec douceur."
      },
      {
        id: "item-42-E",
        text: "Qu'on reconnaisse mon travail et qu'on clarifie le cadre."
      },
      {
        id: "item-42-F",
        text: "Qu'il y ait plus de contact, de jeu ou de spontanéité."
      }
    ]
  },
  {
    id: 43,
    blockId: "block8",
    prompt:
      "Après une période de stress durable ou un changement majeur, il m'est déjà arrivé qu'un nouveau besoin devienne central pendant plusieurs années...",
    options: [
      {
        id: "item-43-A",
        text: "Être reconnu pour un travail productif et mieux structurer mon temps."
      },
      {
        id: "item-43-B",
        text: "Être reconnu pour mon engagement et pouvoir exprimer mes convictions."
      },
      {
        id: "item-43-C",
        text: "Être reconnu comme personne et vivre davantage de confort sensoriel."
      },
      {
        id: "item-43-D",
        text: "Disposer de beaucoup plus de solitude et d'espace personnel."
      },
      {
        id: "item-43-E",
        text: "Retrouver davantage de contact, de jeu et de spontanéité."
      },
      {
        id: "item-43-F",
        text: "Rechercher davantage d'excitation, de défi et d'intensité."
      }
    ]
  },
  {
    id: 44,
    blockId: "block8",
    prompt:
      "Durant cette période, lorsque ce nouveau besoin n'était pas satisfait, j'avais davantage tendance à...",
    options: [
      {
        id: "item-44-A",
        text: "Surcontrôler et critiquer les erreurs ou les responsabilités."
      },
      {
        id: "item-44-B",
        text: "Partir en croisade et imposer mes convictions."
      },
      {
        id: "item-44-C",
        text: "Faire des erreurs, me dénigrer et manquer d'assertivité."
      },
      {
        id: "item-44-D",
        text: "Attendre passivement, me retirer et laisser des projets inachevés."
      },
      {
        id: "item-44-E",
        text: "Râler, répondre « oui, mais » et blâmer l'extérieur."
      },
      {
        id: "item-44-F",
        text: "Manipuler, provoquer des tensions ou enfreindre les règles."
      }
    ]
  },
  {
    id: 45,
    blockId: "block8",
    prompt:
      "En regardant mon parcours, le changement le plus durable dans mes motivations a été de passer vers davantage de...",
    options: [
      {
        id: "item-45-A",
        text: "Reconnaissance du travail productif et structuration du temps."
      },
      {
        id: "item-45-B",
        text: "Reconnaissance du travail dévoué et conviction."
      },
      {
        id: "item-45-C",
        text: "Reconnaissance de la personne et satisfaction sensorielle."
      },
      {
        id: "item-45-D",
        text: "Solitude."
      },
      {
        id: "item-45-E",
        text: "Contact."
      },
      {
        id: "item-45-F",
        text: "Excitation."
      }
    ]
  }
];

export const ASSESSMENT_VERSION = "v0.2" as const;
export const TOTAL_ITEMS = 45;
export const TOTAL_OPTIONS = 270;
