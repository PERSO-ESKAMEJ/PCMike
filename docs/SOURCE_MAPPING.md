# Correspondance avec les documents sources

Ce document trace, pour chaque décision de conception du questionnaire, du moteur de scoring et
du rapport, quelle partie s'appuie sur quel document de référence local, ce qui a été vérifié,
et ce qui reste une hypothèse expérimentale. Il répond à l'exigence de traçabilité de la mission.

Les trois documents sources ne sont **jamais** commités, publiés dans `dist/`, envoyés à
Supabase Storage ou reproduits verbatim au-delà de courtes citations isolées indispensables à la
levée d'une ambiguïté. Ils sont exclus par `.gitignore` (`*.pdf`).

Hiérarchie des sources en cas de conflit (imposée par la mission) :

1. `Matrice_items_test_PCM.pdf` (V0.2 auditée) — texte et structure des 45 items.
2. `2026 Manuel PCM.pdf` (PCM1, V1.2.1, 99 pages) — relations conceptuelles du modèle.
3. `Pcm mike.pdf` — structure fonctionnelle et profondeur de restitution attendue (exemple
   individuel unique, jamais généralisé).

---

## 1. Matrice V0.2 — source de vérité des 45 items

**Statut : lue intégralement (19 pages), transcription exacte terminée.**

### 1.1 Ce que la matrice établit explicitement

- **45 items, 6 options par item** (une par type), répartis en **8 blocs** — confirmés item par
  item, aucun écart avec les plages annoncées dans la mission :

  | Bloc | Thème                                | Items |
  | ---- | ------------------------------------ | ----- |
  | 1    | Base naturelle                       | 1–10  |
  | 2    | Perceptions et langage               | 11–17 |
  | 3    | Points forts et styles d'interaction | 18–24 |
  | 4    | Canaux de communication              | 25–29 |
  | 5    | Environnements préférés              | 30–33 |
  | 6    | Besoins psychologiques actuels       | 34–38 |
  | 7    | Stress actuel                        | 39–42 |
  | 8    | Phasage et cohérence temporelle      | 43–45 |

- **Barème de rang provisoire** (repris tel quel dans `src/scoring/config.ts`) :
  1er = 6, 2e = 4, 3e = 3, 4e = 2, 5e = 1, 6e = 0,5, non classé = 0. Le document précise
  lui-même que ce barème est _provisoire_ et devra être calibré empiriquement — il est donc
  implémenté comme une **configuration versionnée**, jamais codé en dur ailleurs.
- **Chaque item associe ses 6 propositions à un code interne** (AN/PE/EM/IM/EN/PR) dans un ordre
  de lettres (A–F) qui **varie d'un item à l'autre** — la matrice elle-même ne fixe pas
  systématiquement le code AN sur l'option A. C'est la base de la randomisation appliquée en plus
  côté candidat (voir §1.3).
- **Principes de conception V0.2** (p. 2), repris littéralement dans le moteur :
  - La Base est estimée à partir des items 1 à 33 ; les besoins/stress actuels **ne doivent pas**
    reclasser artificiellement la Base.
  - La Phase actuelle est estimée par **convergence** entre besoins actuels (34–38) et séquence
    de stress (39–42).
  - Un changement de Phase se fait vers l'étage **immédiatement supérieur** : les Phases vécues
    forment une **trajectoire contiguë** entre la Base et la Phase actuelle, pas une collection
    libre.
  - Les items 43–45 confirment le phasage dans le temps ; toute Phase vécue doit être associée à
    une période durable, un changement de besoin et une séquence de stress cohérente.
  - Le statut 100 % (Base / Phase actuelle / Phase vécue) n'est attribué qu'après validation des
    règles de cohérence — jamais par défaut.
- **Règles de scoring et de validation V0.2** (p. 19) :
  - Score de Base : normalisation séparée des 5 blocs (1–5), pondération de départ
    **40 % / 25 % / 20 % / 10 % / 5 %** sur les blocs 1 à 5 respectivement.
  - **Seuil explicite d'ambiguïté de Base : écart < 8 points normalisés entre le 1er et le 2e type
    → signaler « Base à confirmer »**. Ce seuil vient directement du document (contrairement à
    la mission, qui ne fixe pas de valeur numérique) et est utilisé comme valeur par défaut
    configurable dans `src/scoring/config.ts`.
  - Structure de personnalité : indice relatif d'accessibilité calculé sur les items 1–33,
    contrôlé ensuite par la cohérence des perceptions/canaux/styles/environnements. **Le
    document ne donne pas de pondération par bloc distincte de celle de la Base** (voir §4.1
    plus bas pour la décision prise sur ce point).
  - Phase actuelle : score besoins (34–38) vs score stress (39–42) ; Phase forte seulement si le
    même type domine les deux sous-scores, sinon hypothèse à confirmer. Si Phase actuelle = Base,
    conclure qu'aucun changement de Phase n'est établi.
  - Phases vécues : les étages 2 à _k-1_ (si la Phase actuelle est à l'étage _k_) sont les Phases
    vécues potentielles ; confirmées seulement par convergence période/besoin/stress issue des
    items 43–45, sinon statut « potentiel ».
  - Qualité de réponse : nombre moyen d'options classées par item à surveiller (sur-classement ou
    sous-classement réduit la discrimination) ; incohérences entre blocs à détecter, jamais à
    corriger silencieusement ; indice de confiance conservé distinct du score de type.
  - Validation empirique (comparaison à des profils PCM officiels, test-retest, désirabilité
    sociale) est **recommandée par le document lui-même comme travail futur**, non réalisée ici —
    documentée comme limite du produit (voir `docs/SCORING.md`).

### 1.2 Corrections de forme documentées

La matrice contient elle-même, pour chaque item, une colonne « Commentaires / corrections »
indiquant si l'item a été _Conservé_, _Révision légère_ ou _Révision majeure_ par ses auteurs
lors de l'audit V0.1 → V0.2. Ce texte de matrice est déjà la version finale V0.2 : **aucune
correction supplémentaire de grammaire ou de typographie n'a été nécessaire lors de la
transcription** dans `supabase/seed/items.v0.2.ts`. Les 45 items ont été recopiés caractère pour
caractère (y compris la ponctuation « … », les guillemets « » et les italiques de sens).
La seule adaptation technique : les points de suspension `...` en fin de prompt (« Item 1. Quand
une situation nouvelle se présente à moi, mon premier réflexe est plutôt de... ») sont conservés
tels quels dans le champ `prompt`, et chaque proposition est stockée sans le point final déjà
présent dans la matrice.

### 1.3 Conséquences directes sur l'implémentation

- `supabase/seed/items.v0.2.ts` (privé, jamais bundlé) : les 45 items, leurs 6 options, et le
  code de type associé à chacune — transcription fidèle de la matrice.
- `src/data/assessment.items.v0.2.ts` (public) : uniquement `id`, `blockId`, `prompt`,
  `options[].id` (identifiant opaque `item-{n}-{lettre}`) et `options[].text`. **Aucun code de
  type n'y figure.**
- L'ordre de présentation des 6 options est re-randomisé **par candidat et par session** (et non
  reconstruit à chaque rendu) via un générateur pseudo-aléatoire dérivé d'une graine stockée
  localement (`localStorage`) puis envoyée au serveur dans `presented_option_order` — conforme à
  la consigne « ordre stable pendant la session, enregistré avec la soumission ».

---

## 2. Manuel PCM (2026 Manuel PCM.pdf, PCM1 V1.2.1, 99 pages) — relations conceptuelles

**Statut : lu intégralement par un agent de recherche dédié (pagination confirmée par le
sommaire du document, p. 4). Synthèse paraphrasée ci-dessous ; citations de plus de quelques mots
proscrites.**

### 2.1 Définitions vérifiées

- **Base** : Type de Personnalité acquis à la naissance ou développé très tôt, fixé à vie (p. 13).
- **Structure de Personnalité** : image de l'« immeuble à six étages » — chaque personne possède
  les six types à des degrés variables ; la Base occupe le rez-de-chaussée, les cinq autres
  types occupent les étages supérieurs dans un ordre fixé vers l'âge de sept ans et qui ne change
  plus ensuite (720 combinaisons possibles) (p. 21). Un « Ascenseur » permet un accès temporaire
  aux points forts/perceptions/comportements des étages supérieurs (p. 21, p. 28).
- **Phase** : au départ Base = Phase (p. 66). Environ deux personnes sur trois vivent au moins un
  **Changement de Phase** dans leur vie, généralement déclenché par une problématique non résolue
  et un stress intense prolongé (p. 66).
- **Trajectoire Base → Phase** : un changement de Phase déplace la Phase vers l'étage
  **supérieur** (p. 65). Le manuel ne détaille pas explicitement si des étages peuvent être
  sautés ; combiné à l'ordre fixé dès l'enfance, cela **suggère une trajectoire contiguë** sans
  l'affirmer de façon formelle et exhaustive au-delà de cette formulation. → **Traité comme
  hypothèse forte mais non absolument certaine** ; le moteur applique la contiguïté stricte et
  signale une contradiction plutôt que de la forcer silencieusement (conforme à la consigne de
  la mission).
- **Lors d'un changement de Phase**, Perception, Partie de Personnalité, Canal, Style
  d'Interaction et Points Forts **restent ceux de la Base** ; seuls le(s) Besoin(s) Psychologique(s)
  et la Séquence de Stress changent (p. 66). Conséquence directe : le rapport ne doit **jamais**
  réattribuer une perception ou un canal différent à la Phase — seuls besoins et stress sont
  « phase-dépendants ».
- **Phase Vécue** : une Phase déjà expérimentée, distincte de la Phase actuelle, dont la
  séquence de stress ne se manifeste plus que rarement (p. 67–68).

### 2.2 Table de correspondance des six types — confirmée intégralement

Toutes les correspondances de l'hypothèse de travail issue de la mission sont confirmées par le
manuel, avec un correctif important sur l'Imagineur (§2.3).

| Type        | Perception (p.)                      | Points forts (p.)                       | Besoin(s) (p.)                                                    | Canal (p.)        | Style à utiliser / à éviter (p.)  | Environnement (p.)       | Partie signature (p.)                                              |
| ----------- | ------------------------------------ | --------------------------------------- | ----------------------------------------------------------------- | ----------------- | --------------------------------- | ------------------------ | ------------------------------------------------------------------ |
| Analyseur   | Pensées factuelles (14)              | Logique, Responsable, Organisé (14)     | Reconnaissance du travail productif + Structuration du temps (57) | Interrogatif (45) | Démocratique / Autocratique (27)  | Seul ou duo (54)         | Ordinateur (36)                                                    |
| Persévérant | Opinions (15)                        | Engagé, Observateur, Consciencieux (15) | Reconnaissance du travail dévoué + Conviction (57)                | Interrogatif (45) | Démocratique / Autocratique (27)  | Seul ou duo (54)         | Ordinateur (36)                                                    |
| Empathique  | Émotions (16)                        | Compatissant, Sensible, Chaleureux (16) | Reconnaissance de la personne + Sensoriel (57)                    | Nourricier (46)   | Bienveillant / Autocratique (27)  | Groupe (54)              | Réconforteur (36)                                                  |
| Imagineur   | Inactions / réflexions (17)          | Imaginatif, Réfléchi, Calme (17)        | Solitude (57)                                                     | Directif (44)     | Autocratique / Laissez-faire (27) | Seul (54)                | Ordinateur en interne (36) ; **Directeur pour l'aborder** (38, 86) |
| Énergiseur  | Réactions (j'aime / j'aime pas) (18) | Spontané, Créatif, Ludique (18)         | Contact (57)                                                      | Émotif (47)       | Laissez-faire / Autocratique (27) | De groupe en groupe (54) | Émoteur (36)                                                       |
| Promoteur   | Actions (19)                         | Adaptable, Persuasif, Charmeur (19)     | Excitation (57)                                                   | Directif (44)     | Autocratique / Démocratique (27)  | De groupe en groupe (54) | Directeur (36)                                                     |

**Séquences de stress** (driver → 1er degré/porte d'entrée → 2e degré/masque/mécanisme →
3e degré/cave), confirmées pages 71 à 83 :

| Type        | Driver                | 1er degré                                                   | 2e degré (masque)                                             | 3e degré (cave)                         |
| ----------- | --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------- |
| Analyseur   | Sois parfait          | Sur-détaille, sur-qualifie, explications compliquées        | Attaquant — sur-contrôle, critique les autres                 | Rejette les autres, se sent incompétent |
| Persévérant | Sois parfait pour moi | Questions/mots compliqués, se focalise sur ce qui ne va pas | Attaquant — part en croisade                                  | Délaisse les autres                     |
| Empathique  | Fais plaisir          | Se sur-adapte, n'ose pas dire non                           | Geignard — fait des erreurs, manque d'assertivité, se dénigre | Se fait rejeter, se sent mal aimé       |
| Imagineur   | Sois fort             | Évite les initiatives, se disperse                          | Geignard — attend passivement, se retire, projets inachevés   | Se fait oublier                         |
| Énergiseur  | Fais des efforts      | Rame, ne répond pas directement                             | Blâmeur — blâme, râle, « oui mais »                           | Se fait censurer                        |
| Promoteur   | Sois fort pour moi    | Dit « tu » au lieu de « je »                                | Blâmeur — manipule, provoque, sème la zizanie                 | Abandonne les autres                    |

Les masques sont partagés par paires : Analyseur/Persévérant = Attaquant ; Empathique/Imagineur =
Geignard ; Énergiseur/Promoteur = Blâmeur (p. 72).

### 2.3 Écart identifié vs l'hypothèse de travail de la mission

**Partie de personnalité de l'Imagineur** : le manuel distingue la partie « signature interne »
(Ordinateur, table p. 36) de la partie **à activer pour s'adresser** à un Imagineur (Directeur,
tables p. 38 et p. 86, cohérent avec son Canal Directif). Le rapport doit donc présenter les deux
informations séparément pour ce type plutôt qu'une case unique « Partie ». Aucun autre écart n'a
été trouvé — tous les autres points de l'hypothèse de travail sont corroborés textuellement.

### 2.4 Ce que le manuel n'aborde pas (zones d'ombre déclarées)

- **Aucune méthodologie de score, de seuil de confiance ou de gestion des scores proches** :
  c'est un manuel de formation pédagogique (exercices, jeux de rôle), pas un manuel
  psychométrique. Le seul repère chiffré trouvé concerne les Environnements Préférés : un score
  de 100 signale un fonctionnement très efficace dans cet environnement, les scores inférieurs
  un pourcentage relatif de temps passé efficacement (p. 52) — **extrapolé par analogie** aux
  autres échelles dans le produit, ce n'est pas une généralisation du manuel lui-même.
- **Aucune définition formelle de « compétence contextuelle »** distincte de la Phase ou de la
  Base, au-delà du concept général d'Ascenseur (p. 21, p. 28). La distinction utilisée dans le
  questionnaire (item 43 : « nouveau besoin devenu central » vs une compétence imposée par le
  rôle professionnel) est une **construction du produit**, pas une reprise du manuel.
- La reconstitution des quatre quadrants de la « Matrice d'Identification » des Environnements
  Préférés (p. 53–54) s'appuie sur une extraction PDF partiellement désordonnée par la mise en
  page originale (tableau/graphique) ; cohérente avec le texte adjacent et l'hypothèse de travail,
  mais **non vérifiée visuellement sur le graphique source**.
- Chaque type est présenté comme intrinsèquement « OK », sans hiérarchie de valeur entre types
  (p. 13, p. 21) — principe explicitement repris dans le ton du rapport (`docs/SCORING.md`,
  §« langage neutre »).

---

## 3. Rapport PCM de Mike — référence structurelle uniquement

**Statut : lu intégralement par un agent dédié (25 pages), qui a ensuite supprimé tous les
fichiers temporaires contenant des données personnelles. Aucune donnée personnelle de Mike
(nom de famille, scores, Base, Phase, contenu narratif individuel) n'a été conservée ni utilisée
dans ce projet — conformément à la consigne de la mission de ne jamais généraliser un exemple
individuel.**

### 3.1 Ce qui a été retenu (structure fonctionnelle uniquement)

Le rapport de Mike alterne systématiquement des pages **génériques/pédagogiques** (identiques
pour tout destinataire, expliquant le modèle) et des pages **personnalisées** (graphique de
scores + narration à la deuxième personne). Cette alternance, plus que la profondeur brute, est
le principe d'organisation retenu comme source d'inspiration pour `docs/SCORING.md` §Rapport et
pour l'ordre des sections dans `src/reports/ReportDocument.tsx` :

1. Couverture (identité, date, code de référence, avertissement non-officiel).
2. Mentions légales / cadre d'usage.
3. Introduction (objectif du rapport, mode de lecture).
4. Sommaire des composantes.
5. Structure de personnalité (générique puis personnalisé, graphique en immeuble à étages).
6. Perceptions (scores puis explication des six perceptions).
7. Points forts (section la plus narrative/personnalisée du rapport de référence).
8. Styles d'interaction.
9. Parties de personnalité.
10. Canaux de communication.
11. Environnements préférés.
12. Besoins psychologiques (classement + développement des besoins prioritaires).
13. Phase et changement de Phase.
14. Comportements liés à la non-satisfaction des besoins (registre neutre, non culpabilisant).
15. Séquence de stress (représentation en paliers descendants : porte d'entrée → sous-sol → cave).
16. Signaux d'avertissement / progression du stress.
17. Plan d'action (recommandations professionnelles et personnelles).

Cette liste a servi de **base d'inspiration fonctionnelle**, adaptée et complétée dans
`docs/SCORING.md` (§12 du prompt de mission) avec nos propres sections obligatoires
(méthode et limites, Phases vécues, contradictions détectées) qui n'existent pas nécessairement
dans le rapport de Mike.

### 3.2 Ton et niveau de personnalisation retenus comme cible

- Registre **hybride** : formel/prudent sur les pages légales et théoriques, orienté
  accompagnement sur les pages personnalisées.
- Reformulation systématique des comportements de stress comme des « signaux » plutôt que des
  défauts ; rappel explicite qu'aucun type n'est supérieur à un autre.
- Peu de types de graphiques (immeuble à étages, barres de pourcentage, paliers de stress) — pas
  de sur-décoration. Repris comme cible de sobriété graphique pour `src/reports/charts/`.
- Densité variable par section (1 à 3 pages) plutôt qu'une profondeur uniforme : les sections
  Structure, Perceptions, Points forts et Plan d'action sont les plus développées.

### 3.3 Ce qui n'a explicitement PAS été repris

- Aucun texte, logo, illustration, charte graphique ou mise en page propriétaire.
- Aucun résultat, score ou conclusion individuelle concernant Mike.
- La structure de Mike n'est **pas un contrat** : elle a inspiré l'ordre et la profondeur
  relative des sections de notre propre rapport, rédigé intégralement avec un contenu narratif
  original (`src/reports/content/`), pas copié.

---

## 4. Décisions produit non directement sourcées (hypothèses explicites)

Conformément à la consigne « ne pas inventer silencieusement », voici les points où la mission ou
le produit vont au-delà de ce que les documents établissent formellement. Ils sont implémentés
comme **valeurs par défaut configurables** dans `src/scoring/config.ts`, jamais figées dans le
code.

### 4.1 Score Structure distinct du Score Base

La mission demande une pondération `structureScore` (30/25/20/15/10 sur les blocs 1–5) distincte
de celle du `baseScore` (40/25/20/10/5, elle-même issue de la matrice). **La matrice ne fournit
aucune pondération distincte pour la Structure** — elle indique seulement que l'ordre des étages
est dérivé des mêmes items 1–33, contrôlé ensuite par la cohérence qualitative. La pondération
30/25/20/15/10 est donc une **hypothèse configurable de la mission**, implémentée telle quelle
mais signalée comme non issue directement du document source.

### 4.2 Pondération de la Phase actuelle et des Phases vécues

Les formules `currentPhaseScore = 0.50·bloc6 + 0.45·bloc7 + 0.05·bloc5` et la répartition
70 % / 20 % / 10 % pour les Phases vécues (réponses bloc 8 / cohérence temporelle / cohérence
besoins-stress) proviennent du texte de la mission, **pas de la matrice ni du manuel**, qui se
contentent d'exiger une « convergence » sans formule chiffrée. Implémentées comme configuration
versionnée par défaut, à recalibrer lors d'une validation empirique future (explicitement prévue
comme travaux futurs par la matrice elle-même, §1.1 ci-dessus).

### 4.3 Système de confiance à 4 niveaux

Le principe (marge entre les deux premiers scores, cohérence entre blocs, taux de réponse,
contradictions besoins/stress, qualité des réponses temporelles) est cohérent avec les
« Règles de scoring et de validation V0.2 » de la matrice (qui demande un indice de confiance
distinct du score), mais le barème précis (élevée / moyenne / faible / insuffisante et leurs
seuils) est une **construction du produit**, réutilisant le seuil de 8 points normalisés de la
matrice comme un des signaux d'entrée, pas comme le seul critère.

### 4.4 Stockage de la clé de scoring privée

La mission propose deux options en cas de dépôt public : table Supabase protégée par RLS, ou
processus de seed local non versionné. **Décision retenue : la correspondance option → type est
versionnée dans `supabase/seed/items.v0.2.ts` et appliquée à une table Supabase dont la RLS
interdit toute lecture aux rôles `anon` et `authenticated` non-admin** (voir
`docs/PRIVACY_AND_SECURITY.md`). Justification : la valeur protectrice réelle vient de
l'autorité serveur du calcul (le candidat ne peut jamais lire ni falsifier le score), pas de
l'obscurité de la correspondance texte → code — un candidat déterminé pourrait de toute façon
déduire approximativement certaines correspondances du style d'écriture. Versionner le seed
facilite la reproductibilité et la revue de code. **Si le dépôt GitHub est rendu public et que ce
choix doit être reconsidéré, basculer vers un seed local non versionné (`supabase/seed/*.local.*`,
déjà exclu par `.gitignore`) reste possible sans changer le reste de l'architecture.**

### 4.5 Vulnérabilité npm connue et acceptée (react-router-dom)

Au moment de l'installation, toutes les versions publiées de `react-router-dom` 7.x (jusqu'à
7.18.2, la plus récente) sont couvertes par l'avis `GHSA-qwww-vcr4-c8h2` (CSRF en mode RSC sur
les Actions serveur). Cette faille concerne exclusivement le mode framework avec React Server
Components et des Actions serveur — fonctionnalités **non utilisées** par cette application, qui
n'utilise que `<HashRouter>` côté client sur un site 100 % statique sans runtime serveur
React Router. Risque jugé non exploitable dans ce contexte et accepté ; à surveiller via
`npm audit` en CI et à corriger dès qu'un correctif est publié (voir `docs/DEPLOYMENT.md`).

---

## 5. Résumé des points à valider qualitativement (non automatisables)

- Le barème de rang (6/4/3/2/1/0,5) et toutes les pondérations de blocs sont **provisoires par
  construction documentaire** — la matrice elle-même appelle à une calibration empirique future.
- La contiguïté stricte de la trajectoire de Phase est une **lecture prudente** du manuel, pas une
  règle formellement exhaustive.
- Aucune validation psychométrique (test-retest, comparaison à des profils PCM officiels,
  désirabilité sociale) n'a été réalisée — le rapport candidat le rappelle explicitement dans sa
  section « Méthode et limites ».
