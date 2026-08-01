/**
 * Correspondance PRIVEE option -> type, transcrite fidelement depuis
 * `Matrice_items_test_PCM.pdf` (V0.2 auditee, 45 items). Voir docs/SOURCE_MAPPING.md §1.
 *
 * Ce fichier est la SEULE source de verite pour le contenu du questionnaire :
 * - `src/data/assessment.items.v0.2.ts` (public, sans code de type) en est derive par
 *   `scripts/generate-public-items.mjs` -- ne jamais editer le fichier public a la main.
 * - La table Postgres `scoring_key` (RLS admin/service uniquement) est peuplee a partir de ce
 *   fichier via `supabase/migrations/..._seed_scoring_key.sql` (genere avec le meme script).
 *
 * Ne jamais importer ce fichier depuis du code servi au navigateur candidat.
 */

// TypeCode/BlockId sont definis une seule fois dans src/scoring/types.ts (type-only : aucune
// donnee n'est donc importee dans ce fichier prive, seulement une contrainte de compilation).
import type { TypeCode, BlockId } from "../../src/scoring/types.ts";

export type { TypeCode, BlockId };

export interface RawOption {
  /** Lettre telle qu'imprimee dans la matrice (A-F), conservee pour tracabilite d'audit. */
  letter: "A" | "B" | "C" | "D" | "E" | "F";
  typeCode: TypeCode;
  text: string;
}

export interface RawItem {
  id: number;
  blockId: BlockId;
  prompt: string;
  options: RawOption[];
}

export const BLOCKS: Array<{ id: BlockId; label: string; itemRange: [number, number] }> = [
  { id: "block1", label: "Base naturelle", itemRange: [1, 10] },
  { id: "block2", label: "Perceptions et langage", itemRange: [11, 17] },
  { id: "block3", label: "Points forts et styles d'interaction", itemRange: [18, 24] },
  { id: "block4", label: "Canaux de communication", itemRange: [25, 29] },
  { id: "block5", label: "Environnements preferes", itemRange: [30, 33] },
  { id: "block6", label: "Besoins psychologiques actuels", itemRange: [34, 38] },
  { id: "block7", label: "Stress actuel", itemRange: [39, 42] },
  { id: "block8", label: "Phasage et coherence temporelle", itemRange: [43, 45] }
];

export const RAW_ITEMS: RawItem[] = [
  {
    id: 1,
    blockId: "block1",
    prompt: "Quand une situation nouvelle se présente à moi, mon premier réflexe est plutôt de...",
    options: [
      {
        letter: "A",
        typeCode: "AN",
        text: "Chercher à comprendre les faits, les étapes et les informations utiles."
      },
      {
        letter: "B",
        typeCode: "PE",
        text: "Évaluer ce que la situation signifie au regard de mes principes."
      },
      {
        letter: "C",
        typeCode: "EM",
        text: "Ressentir l'ambiance et la manière dont les personnes vivent la situation."
      },
      {
        letter: "D",
        typeCode: "IM",
        text: "Prendre un temps intérieur pour me représenter calmement la situation."
      },
      {
        letter: "E",
        typeCode: "EN",
        text: "Réagir spontanément à ce qui me plaît, m'amuse ou m'agace."
      },
      {
        letter: "F",
        typeCode: "PR",
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
        letter: "A",
        typeCode: "EM",
        text: "Attentif, chaleureux et soucieux du bien-être des personnes."
      },
      {
        letter: "B",
        typeCode: "PR",
        text: "Direct, adaptable et capable de saisir les occasions."
      },
      { letter: "C", typeCode: "AN", text: "Fiable, clair et organisé dans ce qu'il entreprend." },
      { letter: "D", typeCode: "EN", text: "Vivant, spontané et capable de mettre de l'énergie." },
      {
        letter: "E",
        typeCode: "IM",
        text: "Calme, discret et capable de réfléchir en profondeur."
      },
      { letter: "F", typeCode: "PE", text: "Engagé, observateur et attaché à ce qui a du sens." }
    ]
  },
  {
    id: 3,
    blockId: "block1",
    prompt: "Dans un groupe, ce que j'apporte naturellement, c'est surtout...",
    options: [
      { letter: "A", typeCode: "EN", text: "Une énergie légère, créative ou stimulante." },
      { letter: "B", typeCode: "IM", text: "Du recul, du calme et un espace de réflexion." },
      {
        letter: "C",
        typeCode: "PE",
        text: "Un cap fondé sur des principes et un engagement soutenu."
      },
      { letter: "D", typeCode: "EM", text: "Une attention aux personnes et à la qualité du lien." },
      { letter: "E", typeCode: "PR", text: "Une impulsion concrète pour que les choses bougent." },
      { letter: "F", typeCode: "AN", text: "Une organisation, une méthode ou une clarification." }
    ]
  },
  {
    id: 4,
    blockId: "block1",
    prompt: "Quand quelqu'un me parle d'un problème, je suis tenté de...",
    options: [
      {
        letter: "A",
        typeCode: "PE",
        text: "Évaluer avec lui ce qui est juste, important ou prioritaire."
      },
      {
        letter: "B",
        typeCode: "AN",
        text: "Poser des questions pour comprendre les faits et les causes."
      },
      {
        letter: "C",
        typeCode: "PR",
        text: "Lui proposer une action concrète pour débloquer la situation."
      },
      {
        letter: "D",
        typeCode: "EM",
        text: "Lui montrer que je comprends ce qu'il vit et qu'il n'est pas seul."
      },
      {
        letter: "E",
        typeCode: "IM",
        text: "Écouter en silence et prendre le temps de me représenter l'ensemble."
      },
      {
        letter: "F",
        typeCode: "EN",
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
        letter: "A",
        typeCode: "IM",
        text: "Une image ou un scénario que chacun peut se représenter."
      },
      {
        letter: "B",
        typeCode: "EM",
        text: "Une formulation attentive à l'impact humain et relationnel."
      },
      { letter: "C", typeCode: "AN", text: "Des informations claires, ordonnées et vérifiables." },
      {
        letter: "D",
        typeCode: "EN",
        text: "Une manière ludique et expressive qui capte l'attention."
      },
      {
        letter: "E",
        typeCode: "PE",
        text: "Les raisons profondes, les convictions ou les principes en jeu."
      },
      {
        letter: "F",
        typeCode: "PR",
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
        letter: "A",
        typeCode: "PR",
        text: "M'adapter rapidement et trouver une issue dans une situation difficile."
      },
      {
        letter: "B",
        typeCode: "AN",
        text: "Structurer, anticiper ou rendre les choses plus efficaces."
      },
      {
        letter: "C",
        typeCode: "EN",
        text: "Stimuler une ambiance plus libre, drôle ou originale."
      },
      {
        letter: "D",
        typeCode: "PE",
        text: "M'engager durablement et défendre ce qui compte pour moi."
      },
      {
        letter: "E",
        typeCode: "IM",
        text: "Rester calme, observer et réfléchir sans me précipiter."
      },
      {
        letter: "F",
        typeCode: "EM",
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
        letter: "A",
        typeCode: "EM",
        text: "Je sens une présence humaine rassurante autour de moi."
      },
      { letter: "B", typeCode: "IM", text: "J'ai assez d'espace pour réfléchir sans être pressé." },
      {
        letter: "C",
        typeCode: "PE",
        text: "Je peux m'appuyer sur des principes et des engagements clairs."
      },
      { letter: "D", typeCode: "PR", text: "J'ai une marge de manœuvre pour agir et ajuster." },
      {
        letter: "E",
        typeCode: "AN",
        text: "Les objectifs, les contraintes et les délais sont clarifiés."
      },
      {
        letter: "F",
        typeCode: "EN",
        text: "Je peux essayer, improviser et garder une part de liberté."
      }
    ]
  },
  {
    id: 8,
    blockId: "block1",
    prompt: "Ce qui m'agace le plus spontanément chez les autres, c'est quand ils...",
    options: [
      { letter: "A", typeCode: "AN", text: "Laissent les choses floues ou mal organisées." },
      { letter: "B", typeCode: "EN", text: "Rendent l'échange lourd, rigide ou ennuyeux." },
      { letter: "C", typeCode: "IM", text: "M'envahissent ou ne me laissent aucun espace." },
      { letter: "D", typeCode: "PE", text: "Agissent sans profondeur, engagement ou cohérence." },
      { letter: "E", typeCode: "PR", text: "Hésitent alors qu'une décision doit être prise." },
      { letter: "F", typeCode: "EM", text: "Se montrent froids ou peu attentionnés." }
    ]
  },
  {
    id: 9,
    blockId: "block1",
    prompt: "Quand je réussis quelque chose, je suis surtout satisfait si...",
    options: [
      {
        letter: "A",
        typeCode: "PE",
        text: "J'ai été fidèle à ce que je crois juste et important."
      },
      {
        letter: "B",
        typeCode: "PR",
        text: "J'ai su saisir une occasion et obtenir un résultat concret."
      },
      {
        letter: "C",
        typeCode: "EM",
        text: "Les personnes concernées se sentent bien et reconnues."
      },
      {
        letter: "D",
        typeCode: "AN",
        text: "Le résultat est propre, utile, structuré et maîtrisé."
      },
      { letter: "E", typeCode: "IM", text: "La solution a été pensée avec recul et justesse." },
      { letter: "F", typeCode: "EN", text: "Le chemin a été vivant, créatif ou stimulant." }
    ]
  },
  {
    id: 10,
    blockId: "block1",
    prompt: "Quand je dois décider, je commence généralement par...",
    options: [
      {
        letter: "A",
        typeCode: "EN",
        text: "Sentir instinctivement si l'option me plaît ou me déplaît."
      },
      {
        letter: "B",
        typeCode: "AN",
        text: "Comparer les informations et les conséquences pratiques."
      },
      {
        letter: "C",
        typeCode: "PE",
        text: "Vérifier si la décision est alignée avec mes convictions."
      },
      { letter: "D", typeCode: "IM", text: "Laisser reposer pour voir ce qui émerge." },
      { letter: "E", typeCode: "PR", text: "Choisir une voie et corriger ensuite si nécessaire." },
      { letter: "F", typeCode: "EM", text: "Tenir compte de ce que cela fera vivre aux personnes." }
    ]
  },
  {
    id: 11,
    blockId: "block2",
    prompt: "Quand je raconte une journée marquante, je parle surtout...",
    options: [
      {
        letter: "A",
        typeCode: "AN",
        text: "De ce qui s'est passé, dans quel ordre et avec quels faits."
      },
      {
        letter: "B",
        typeCode: "EM",
        text: "De ce que cela m'a fait ressentir ou vivre humainement."
      },
      {
        letter: "C",
        typeCode: "PE",
        text: "De ce que j'ai jugé cohérent, discutable ou important."
      },
      { letter: "D", typeCode: "PR", text: "De ce que j'ai fait, décidé ou provoqué." },
      { letter: "E", typeCode: "IM", text: "De ce que cela m'a fait imaginer ou visualiser." },
      { letter: "F", typeCode: "EN", text: "De ce que j'ai adoré, détesté ou trouvé drôle." }
    ]
  },
  {
    id: 12,
    blockId: "block2",
    prompt: "En réunion, quand je prends la parole, j'ai tendance à...",
    options: [
      {
        letter: "A",
        typeCode: "PR",
        text: "Aller directement vers ce qu'il faut tenter ou décider."
      },
      {
        letter: "B",
        typeCode: "EN",
        text: "Communiquer avec spontanéité pour remettre de l'énergie."
      },
      { letter: "C", typeCode: "AN", text: "Clarifier les données, les options ou les étapes." },
      { letter: "D", typeCode: "EM", text: "Ramener l'attention sur les personnes concernées." },
      {
        letter: "E",
        typeCode: "PE",
        text: "Rappeler ce qui est important, juste ou non négociable."
      },
      {
        letter: "F",
        typeCode: "IM",
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
        letter: "A",
        typeCode: "PE",
        text: "Les opinions, les convictions et les incohérences de fond."
      },
      {
        letter: "B",
        typeCode: "IM",
        text: "Les images, scénarios ou possibilités que ses propos font naître."
      },
      { letter: "C", typeCode: "EM", text: "L'état émotionnel de la personne." },
      { letter: "D", typeCode: "AN", text: "Les informations manquantes ou mal organisées." },
      {
        letter: "E",
        typeCode: "PR",
        text: "L'action possible ou le levier immédiatement disponible."
      },
      {
        letter: "F",
        typeCode: "EN",
        text: "Ce que j'aime, ce qui m'agace ou ce qui me fait réagir."
      }
    ]
  },
  {
    id: 14,
    blockId: "block2",
    prompt: "Pour comprendre un problème, je demande plutôt...",
    options: [
      { letter: "A", typeCode: "EM", text: "Comment les personnes vivent la situation." },
      {
        letter: "B",
        typeCode: "AN",
        text: "Qui fait quoi, quand, comment et avec quelles contraintes."
      },
      {
        letter: "C",
        typeCode: "PR",
        text: "Quelle action permettrait de débloquer rapidement la situation."
      },
      {
        letter: "D",
        typeCode: "PE",
        text: "Pourquoi cela compte et selon quels principes l'évaluer."
      },
      {
        letter: "E",
        typeCode: "EN",
        text: "Ce qui plaît, agace ou donne envie dans la situation."
      },
      {
        letter: "F",
        typeCode: "IM",
        text: "Quels scénarios ou possibilités imaginer avant d'agir."
      }
    ]
  },
  {
    id: 15,
    blockId: "block2",
    prompt: "La formulation qui me ressemble le plus serait...",
    options: [
      { letter: "A", typeCode: "IM", text: "J'ai besoin de me représenter la situation." },
      { letter: "B", typeCode: "PE", text: "À mon avis, il y a un vrai sujet de fond." },
      { letter: "C", typeCode: "EN", text: "J'adore l'idée... ou alors pas du tout !" },
      { letter: "D", typeCode: "AN", text: "Quelles sont les informations disponibles ?" },
      { letter: "E", typeCode: "EM", text: "Je ressens que cela touche les personnes." },
      { letter: "F", typeCode: "PR", text: "On y va, on teste et on ajuste." }
    ]
  },
  {
    id: 16,
    blockId: "block2",
    prompt: "Quand quelque chose ne va pas, je dis plutôt...",
    options: [
      { letter: "A", typeCode: "PR", text: "On change de stratégie et on agit." },
      { letter: "B", typeCode: "EM", text: "Je sens que quelque chose ne va pas entre nous." },
      { letter: "C", typeCode: "AN", text: "Il manque des éléments pour décider correctement." },
      { letter: "D", typeCode: "EN", text: "Franchement, cela ne me donne pas envie." },
      { letter: "E", typeCode: "IM", text: "Je vais prendre du recul avant de répondre." },
      { letter: "F", typeCode: "PE", text: "Ce n'est pas cohérent avec ce qui avait été dit." }
    ]
  },
  {
    id: 17,
    blockId: "block2",
    prompt: "Je me sens compris quand l'autre...",
    options: [
      { letter: "A", typeCode: "EN", text: "Réagit avec naturel, humour ou spontanéité." },
      { letter: "B", typeCode: "AN", text: "Me répond clairement et précisément." },
      { letter: "C", typeCode: "IM", text: "Me laisse du temps et ne m'envahit pas." },
      { letter: "D", typeCode: "PE", text: "S'intéresse réellement à mon avis et à mes critères." },
      { letter: "E", typeCode: "PR", text: "Va droit au but et me donne une marge d'action." },
      { letter: "F", typeCode: "EM", text: "Me montre une attention sincère." }
    ]
  },
  {
    id: 18,
    blockId: "block3",
    prompt: "Dans une équipe, ma valeur ajoutée est souvent de...",
    options: [
      { letter: "A", typeCode: "AN", text: "Mettre de l'ordre et rendre l'avancement plus clair." },
      { letter: "B", typeCode: "PR", text: "Débloquer une situation par une action concrète." },
      {
        letter: "C",
        typeCode: "EM",
        text: "Préserver le lien, l'écoute et l'attention aux personnes."
      },
      { letter: "D", typeCode: "PE", text: "Maintenir le cap, l'engagement et le sens." },
      { letter: "E", typeCode: "EN", text: "Apporter créativité, légèreté et mouvement." },
      { letter: "F", typeCode: "IM", text: "Garder une distance calme pour mieux penser." }
    ]
  },
  {
    id: 19,
    blockId: "block3",
    prompt: "Quand j'influence ou j'encadre quelqu'un, je préfère...",
    options: [
      { letter: "A", typeCode: "EM", text: "Encourager la personne et nourrir sa confiance." },
      {
        letter: "B",
        typeCode: "IM",
        text: "Donner une direction simple, puis lui laisser le temps d'agir seule."
      },
      {
        letter: "C",
        typeCode: "AN",
        text: "L'associer à l'analyse des options, des étapes et des responsabilités."
      },
      {
        letter: "D",
        typeCode: "EN",
        text: "Lui offrir des options et de la liberté pour trouver sa manière de faire."
      },
      {
        letter: "E",
        typeCode: "PR",
        text: "Fixer directement un objectif ou un défi, puis la laisser agir."
      },
      {
        letter: "F",
        typeCode: "PE",
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
        letter: "A",
        typeCode: "PR",
        text: "Me donne un objectif direct ou un défi concret, puis me laisse agir."
      },
      {
        letter: "B",
        typeCode: "AN",
        text: "Clarifie les attendus et m'associe à l'analyse des options."
      },
      { letter: "C", typeCode: "PE", text: "Me demande mon avis et reconnaît mon engagement." },
      { letter: "D", typeCode: "EN", text: "Me laisse essayer, choisir et apporter ma touche." },
      {
        letter: "E",
        typeCode: "IM",
        text: "Me donne une direction simple sans multiplier les échanges."
      },
      {
        letter: "F",
        typeCode: "EM",
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
        letter: "A",
        typeCode: "EN",
        text: "Je remets de la vie quand l'ambiance devient pesante."
      },
      {
        letter: "B",
        typeCode: "PE",
        text: "Je rappelle pourquoi le projet mérite qu'on s'y tienne."
      },
      {
        letter: "C",
        typeCode: "IM",
        text: "Je prends du recul, reste calme et laisse émerger une solution."
      },
      {
        letter: "D",
        typeCode: "AN",
        text: "Je planifie, je clarifie et je fiabilise l'exécution."
      },
      {
        letter: "E",
        typeCode: "EM",
        text: "Je fais attention à ceux qui décrochent ou souffrent."
      },
      { letter: "F", typeCode: "PR", text: "Je tranche, j'ose et je fais bouger les lignes." }
    ]
  },
  {
    id: 22,
    blockId: "block3",
    prompt: "Même lorsqu'elle est peu visible, ma contribution consiste souvent à...",
    options: [
      { letter: "A", typeCode: "IM", text: "Prendre du recul et approfondir avant de parler." },
      {
        letter: "B",
        typeCode: "EM",
        text: "Repérer les besoins humains qui risquent d'être oubliés."
      },
      {
        letter: "C",
        typeCode: "PR",
        text: "Sentir rapidement une ouverture ou une occasion à saisir."
      },
      { letter: "D", typeCode: "AN", text: "Sécuriser les détails et la cohérence de l'ensemble." },
      {
        letter: "E",
        typeCode: "EN",
        text: "Faire émerger une idée originale ou une nouvelle énergie."
      },
      {
        letter: "F",
        typeCode: "PE",
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
        letter: "A",
        typeCode: "PE",
        text: "Son intégrité, sa loyauté et la cohérence de ses actes."
      },
      { letter: "B", typeCode: "AN", text: "Sa compétence, sa clarté et sa fiabilité." },
      {
        letter: "C",
        typeCode: "EN",
        text: "Sa capacité à rendre les choses vivantes et stimulantes."
      },
      { letter: "D", typeCode: "EM", text: "Sa chaleur humaine et son attention sincère." },
      {
        letter: "E",
        typeCode: "IM",
        text: "Son calme, ses indications simples et l'espace qu'il laisse."
      },
      {
        letter: "F",
        typeCode: "PR",
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
        letter: "A",
        typeCode: "PR",
        text: "Décider vite, saisir les occasions et obtenir des résultats."
      },
      {
        letter: "B",
        typeCode: "EM",
        text: "Créer un climat chaleureux et prendre soin des personnes."
      },
      {
        letter: "C",
        typeCode: "AN",
        text: "Organiser le travail, tenir les délais et fiabiliser les résultats."
      },
      {
        letter: "D",
        typeCode: "PE",
        text: "M'engager pleinement et défendre un cap qui a du sens."
      },
      { letter: "E", typeCode: "IM", text: "Travailler avec calme, concentration et recul." },
      {
        letter: "F",
        typeCode: "EN",
        text: "Faire circuler l'énergie, les idées et la spontanéité."
      }
    ]
  },
  {
    id: 25,
    blockId: "block4",
    prompt: "Quand on veut me transmettre une information importante, je préfère qu'on...",
    options: [
      { letter: "A", typeCode: "EM", text: "Me parle avec chaleur et attention." },
      { letter: "B", typeCode: "AN", text: "Me donne des éléments clairs, précis et ordonnés." },
      { letter: "C", typeCode: "PR", text: "Me dise directement ce qui est attendu ou à faire." },
      { letter: "D", typeCode: "EN", text: "M'aborde avec naturel, énergie et légèreté." },
      {
        letter: "E",
        typeCode: "PE",
        text: "Me permette de donner mon avis et de comprendre le sens."
      },
      {
        letter: "F",
        typeCode: "IM",
        text: "Me donne une consigne simple et du temps pour intégrer."
      }
    ]
  },
  {
    id: 26,
    blockId: "block4",
    prompt: "Quand je demande une contribution à quelqu'un, je commence plutôt par...",
    options: [
      { letter: "A", typeCode: "PR", text: "Formuler directement ce que j'attends." },
      { letter: "B", typeCode: "EM", text: "Créer un climat de confiance et de considération." },
      {
        letter: "C",
        typeCode: "EN",
        text: "Établir un contact ludique avant d'entrer dans le sujet."
      },
      { letter: "D", typeCode: "AN", text: "Poser des questions pour clarifier la situation." },
      {
        letter: "E",
        typeCode: "IM",
        text: "Donner une indication courte, puis laisser l'autre traiter."
      },
      {
        letter: "F",
        typeCode: "PE",
        text: "Demander son avis sur le sens et les critères à retenir."
      }
    ]
  },
  {
    id: 27,
    blockId: "block4",
    prompt: "Je décroche facilement quand l'autre...",
    options: [
      { letter: "A", typeCode: "IM", text: "Me sollicite trop vite ou trop longtemps sans pause." },
      { letter: "B", typeCode: "EN", text: "Rend l'échange trop sérieux, plat ou verrouillé." },
      { letter: "C", typeCode: "AN", text: "Parle sans structure ou mélange trop de sujets." },
      { letter: "D", typeCode: "PR", text: "Tourne autour du pot sans jamais décider." },
      { letter: "E", typeCode: "EM", text: "Oublie complètement la dimension humaine." },
      { letter: "F", typeCode: "PE", text: "Ignore mon point de vue ou le sens du sujet." }
    ]
  },
  {
    id: 28,
    blockId: "block4",
    prompt: "Dans un échange tendu, ce qui me remet le plus en lien, c'est...",
    options: [
      { letter: "A", typeCode: "PE", text: "Qu'on reconnaisse la légitimité de mon point de vue." },
      { letter: "B", typeCode: "EM", text: "Qu'on me parle avec douceur et respect personnel." },
      { letter: "C", typeCode: "AN", text: "Qu'on reprenne les faits calmement et clairement." },
      {
        letter: "D",
        typeCode: "EN",
        text: "Qu'on relâche la tension par une touche de spontanéité."
      },
      {
        letter: "E",
        typeCode: "PR",
        text: "Qu'on propose une action concrète pour sortir du blocage."
      },
      { letter: "F", typeCode: "IM", text: "Qu'on me laisse un espace pour reprendre mes esprits." }
    ]
  },
  {
    id: 29,
    blockId: "block4",
    prompt: "La phrase que j'entends le mieux ressemble à...",
    options: [
      { letter: "A", typeCode: "AN", text: "Quelles informations te manquent pour avancer ?" },
      { letter: "B", typeCode: "EN", text: "Viens, on essaie autrement, cela peut être sympa." },
      { letter: "C", typeCode: "IM", text: "Prends le temps, puis reviens quand ce sera clair." },
      { letter: "D", typeCode: "PE", text: "Quel est ton avis sur ce qui compte ici ?" },
      { letter: "E", typeCode: "EM", text: "Tu comptes pour moi, je suis content que tu sois là." },
      { letter: "F", typeCode: "PR", text: "Voici le défi, à toi de jouer." }
    ]
  },
  {
    id: 30,
    blockId: "block5",
    prompt: "Je travaille le mieux quand...",
    options: [
      {
        letter: "A",
        typeCode: "EM",
        text: "Je fais partie d'un groupe proche où les relations comptent."
      },
      {
        letter: "B",
        typeCode: "IM",
        text: "Je peux avancer seul, avec une mission claire et peu d'interruptions."
      },
      {
        letter: "C",
        typeCode: "PR",
        text: "Je peux passer d'un groupe ou d'une situation à l'autre pour saisir les occasions."
      },
      {
        letter: "D",
        typeCode: "AN",
        text: "Je travaille seul ou en duo sur des objectifs et des données clairs."
      },
      {
        letter: "E",
        typeCode: "PE",
        text: "Je travaille seul ou en duo sur un sujet que je juge important."
      },
      {
        letter: "F",
        typeCode: "EN",
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
        letter: "A",
        typeCode: "EN",
        text: "Passer librement d'un groupe à l'autre et varier les contacts."
      },
      {
        letter: "B",
        typeCode: "PE",
        text: "Approfondir un sujet important avec une ou deux personnes."
      },
      {
        letter: "C",
        typeCode: "IM",
        text: "Rester seul ou garder une distance confortable et choisie."
      },
      {
        letter: "D",
        typeCode: "EM",
        text: "Faire partie d'un cercle proche et engagé dans la relation."
      },
      {
        letter: "E",
        typeCode: "PR",
        text: "Rencontrer de nouvelles personnes et repérer rapidement les occasions."
      },
      { letter: "F", typeCode: "AN", text: "Échanger de façon ciblée avec une ou deux personnes." }
    ]
  },
  {
    id: 32,
    blockId: "block5",
    prompt: "Après une période dense, je retrouve plus facilement mon efficacité en...",
    options: [
      {
        letter: "A",
        typeCode: "AN",
        text: "Retrouvant seul ou en duo un cadre clair pour organiser mes idées."
      },
      {
        letter: "B",
        typeCode: "PR",
        text: "Changeant d'environnement et recherchant une nouvelle stimulation."
      },
      {
        letter: "C",
        typeCode: "PE",
        text: "Échangeant avec une personne de confiance sur ce qui a du sens."
      },
      {
        letter: "D",
        typeCode: "EN",
        text: "Retrouvant différents contacts, du jeu et du mouvement."
      },
      { letter: "E", typeCode: "IM", text: "M'isolant avec une consigne ou un objectif simple." },
      {
        letter: "F",
        typeCode: "EM",
        text: "Retrouvant un groupe proche et une ambiance chaleureuse."
      }
    ]
  },
  {
    id: 33,
    blockId: "block5",
    prompt: "Un environnement me pèse lorsqu'il est...",
    options: [
      { letter: "A", typeCode: "PR", text: "Sans rythme, sans défi ni occasion à saisir." },
      { letter: "B", typeCode: "EM", text: "Impersonnel, sans sentiment d'appartenance." },
      { letter: "C", typeCode: "AN", text: "Confus et peu propice à un échange ciblé." },
      { letter: "D", typeCode: "IM", text: "Trop bruyant, intrusif ou sollicitant." },
      { letter: "E", typeCode: "PE", text: "Superficiel ou sans possibilité d'approfondir." },
      { letter: "F", typeCode: "EN", text: "Monotone, fermé et sans diversité de contacts." }
    ]
  },
  {
    id: 34,
    blockId: "block6",
    prompt: "Aujourd'hui, je me sens vraiment nourri quand...",
    options: [
      { letter: "A", typeCode: "PE", text: "Mon engagement et mes convictions sont reconnus." },
      {
        letter: "B",
        typeCode: "EN",
        text: "J'ai du contact, de la spontanéité et des interactions vivantes."
      },
      {
        letter: "C",
        typeCode: "AN",
        text: "Mon travail est utile, reconnu et bien organisé dans le temps."
      },
      { letter: "D", typeCode: "IM", text: "J'ai de vrais moments de solitude sans culpabilité." },
      {
        letter: "E",
        typeCode: "PR",
        text: "Je vis un défi, une intensité ou une occasion à saisir."
      },
      {
        letter: "F",
        typeCode: "EM",
        text: "Je me sens apprécié comme personne, dans un cadre agréable."
      }
    ]
  },
  {
    id: 35,
    blockId: "block6",
    prompt: "Ces derniers temps, quand je vais moins bien, ce qui me manque le plus est...",
    options: [
      { letter: "A", typeCode: "IM", text: "Du temps seul pour ne plus être envahi." },
      {
        letter: "B",
        typeCode: "AN",
        text: "Une structure claire et une reconnaissance de ce que je produis."
      },
      {
        letter: "C",
        typeCode: "EM",
        text: "De la chaleur, de l'attention et du confort autour de moi."
      },
      {
        letter: "D",
        typeCode: "PE",
        text: "Le sentiment que mes efforts engagés sont vus et respectés."
      },
      { letter: "E", typeCode: "PR", text: "De l'action, du risque ou une occasion excitante." },
      { letter: "F", typeCode: "EN", text: "Des échanges simples, drôles ou spontanés." }
    ]
  },
  {
    id: 36,
    blockId: "block6",
    prompt: "Une journée réussie aujourd'hui, c'est surtout une journée où...",
    options: [
      { letter: "A", typeCode: "PR", text: "J'ai osé, décidé ou provoqué quelque chose." },
      {
        letter: "B",
        typeCode: "EM",
        text: "Je me suis senti reconnu, entouré et bien dans mon environnement."
      },
      { letter: "C", typeCode: "PE", text: "J'ai agi en cohérence avec mes valeurs." },
      { letter: "D", typeCode: "AN", text: "J'ai avancé efficacement sur des choses planifiées." },
      { letter: "E", typeCode: "EN", text: "J'ai eu du contact, du plaisir et de la liberté." },
      { letter: "F", typeCode: "IM", text: "J'ai pu être tranquille et préserver mon espace." }
    ]
  },
  {
    id: 37,
    blockId: "block6",
    prompt: "La forme de satisfaction qui me touche le plus actuellement ressemble à...",
    options: [
      { letter: "A", typeCode: "AN", text: "Ton travail est sérieux, utile et bien mené." },
      { letter: "B", typeCode: "EM", text: "Ta présence compte, tu es important pour nous." },
      {
        letter: "C",
        typeCode: "EN",
        text: "J'aime ton énergie, tu rends les choses plus vivantes."
      },
      {
        letter: "D",
        typeCode: "PE",
        text: "On voit ton engagement et la force de tes convictions."
      },
      {
        letter: "E",
        typeCode: "IM",
        text: "Tu peux prendre le temps et l'espace dont tu as besoin."
      },
      { letter: "F", typeCode: "PR", text: "Tu as assuré, tu as su prendre le bon risque." }
    ]
  },
  {
    id: 38,
    blockId: "block6",
    prompt: "Si je pouvais modifier mon quotidien pour aller mieux, j'ajouterais surtout...",
    options: [
      { letter: "A", typeCode: "EN", text: "Plus de moments de contact libre et spontané." },
      { letter: "B", typeCode: "IM", text: "Plus de solitude et moins de sollicitations." },
      { letter: "C", typeCode: "PE", text: "Plus de sens, d'intégrité et d'opinions partagées." },
      {
        letter: "D",
        typeCode: "EM",
        text: "Plus de douceur, de chaleur et d'attention personnelle."
      },
      { letter: "E", typeCode: "PR", text: "Plus de nouveauté, de défi et d'intensité." },
      { letter: "F", typeCode: "AN", text: "Plus de structure, de clarté et de maîtrise du temps." }
    ]
  },
  {
    id: 39,
    blockId: "block7",
    prompt: "Quand je commence à être sous stress, je remarque que...",
    options: [
      {
        letter: "A",
        typeCode: "AN",
        text: "Je donne des explications trop longues et je surdétaille."
      },
      {
        letter: "B",
        typeCode: "EM",
        text: "Je me suradapte, j'ose moins dire non et je manque de fermeté."
      },
      {
        letter: "C",
        typeCode: "EN",
        text: "Je réponds indirectement, je rame ou je délègue trop vite."
      },
      {
        letter: "D",
        typeCode: "PE",
        text: "Je pose des questions compliquées et me focalise sur ce qui ne va pas."
      },
      {
        letter: "E",
        typeCode: "PR",
        text: "Je parle davantage en « tu » qu'en « je » et j'attends que les autres se débrouillent."
      },
      { letter: "F", typeCode: "IM", text: "Je me disperse et j'évite de prendre des initiatives." }
    ]
  },
  {
    id: 40,
    blockId: "block7",
    prompt: "Quand la pression augmente, il peut m'arriver de...",
    options: [
      {
        letter: "A",
        typeCode: "PR",
        text: "Manipuler la situation, provoquer des tensions ou contourner les règles."
      },
      {
        letter: "B",
        typeCode: "PE",
        text: "Partir en croisade, imposer mes opinions et devenir suspicieux."
      },
      {
        letter: "C",
        typeCode: "IM",
        text: "Attendre passivement, me retirer davantage et laisser des choses inachevées."
      },
      {
        letter: "D",
        typeCode: "AN",
        text: "Surcontrôler et critiquer les erreurs, l'ordre ou les responsabilités."
      },
      {
        letter: "E",
        typeCode: "EN",
        text: "Râler, répondre « oui, mais » et reporter la faute sur l'extérieur."
      },
      {
        letter: "F",
        typeCode: "EM",
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
        letter: "A",
        typeCode: "EM",
        text: "Finir par me faire rejeter et me sentir profondément mal aimé."
      },
      {
        letter: "B",
        typeCode: "AN",
        text: "Rejeter les autres et me sentir ensuite incompétent ou abattu."
      },
      {
        letter: "C",
        typeCode: "EN",
        text: "Finir par être censuré ou rejeté et me sentir condamné."
      },
      { letter: "D", typeCode: "IM", text: "Me faire oublier et me sentir laissé de côté." },
      {
        letter: "E",
        typeCode: "PE",
        text: "Délaisser ceux que je juge non engagés et me sentir dépité."
      },
      {
        letter: "F",
        typeCode: "PR",
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
        letter: "A",
        typeCode: "IM",
        text: "Qu'on me laisse de l'espace, du silence ou de la solitude."
      },
      {
        letter: "B",
        typeCode: "PE",
        text: "Qu'on respecte mon engagement, mes principes ou mes convictions."
      },
      { letter: "C", typeCode: "PR", text: "Qu'il y ait plus d'intensité, de défi ou d'action." },
      {
        letter: "D",
        typeCode: "EM",
        text: "Qu'on me reconnaisse comme personne et qu'on me traite avec douceur."
      },
      {
        letter: "E",
        typeCode: "AN",
        text: "Qu'on reconnaisse mon travail et qu'on clarifie le cadre."
      },
      {
        letter: "F",
        typeCode: "EN",
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
        letter: "A",
        typeCode: "AN",
        text: "Être reconnu pour un travail productif et mieux structurer mon temps."
      },
      {
        letter: "B",
        typeCode: "PE",
        text: "Être reconnu pour mon engagement et pouvoir exprimer mes convictions."
      },
      {
        letter: "C",
        typeCode: "EM",
        text: "Être reconnu comme personne et vivre davantage de confort sensoriel."
      },
      {
        letter: "D",
        typeCode: "IM",
        text: "Disposer de beaucoup plus de solitude et d'espace personnel."
      },
      {
        letter: "E",
        typeCode: "EN",
        text: "Retrouver davantage de contact, de jeu et de spontanéité."
      },
      {
        letter: "F",
        typeCode: "PR",
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
        letter: "A",
        typeCode: "AN",
        text: "Surcontrôler et critiquer les erreurs ou les responsabilités."
      },
      { letter: "B", typeCode: "PE", text: "Partir en croisade et imposer mes convictions." },
      {
        letter: "C",
        typeCode: "EM",
        text: "Faire des erreurs, me dénigrer et manquer d'assertivité."
      },
      {
        letter: "D",
        typeCode: "IM",
        text: "Attendre passivement, me retirer et laisser des projets inachevés."
      },
      { letter: "E", typeCode: "EN", text: "Râler, répondre « oui, mais » et blâmer l'extérieur." },
      {
        letter: "F",
        typeCode: "PR",
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
        letter: "A",
        typeCode: "AN",
        text: "Reconnaissance du travail productif et structuration du temps."
      },
      { letter: "B", typeCode: "PE", text: "Reconnaissance du travail dévoué et conviction." },
      {
        letter: "C",
        typeCode: "EM",
        text: "Reconnaissance de la personne et satisfaction sensorielle."
      },
      { letter: "D", typeCode: "IM", text: "Solitude." },
      { letter: "E", typeCode: "EN", text: "Contact." },
      { letter: "F", typeCode: "PR", text: "Excitation." }
    ]
  }
];
