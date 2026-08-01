# Moteur de scoring

Référence pratique du fonctionnement de `src/scoring/`. Pour la provenance de chaque règle
(matrice, manuel, ou hypothèse produit), voir `docs/SOURCE_MAPPING.md`.

Le moteur (`src/scoring/engine.ts`) est un module TypeScript pur : aucune dépendance React, DOM
ou Supabase. Il est importé tel quel par l'Edge Function `submit-assessment` (calcul autoritatif
à la soumission) et par `recalculate-submission` (recalcul admin) — un seul et même code exécute
le scoring des deux côtés, jamais dupliqué.

## Entrée

```ts
scoreAssessment({
  items, // ItemMeta[] : { id, blockId } — pas de code de type
  answers, // ItemAnswer[] : { itemId, rankedOptionIds, explicitNoMatch }
  scoringKey, // Map<optionId, TypeCode> — jamais fourni par le candidat
  phaseHistory // PhaseHistoryAnswer | null — typeCode dérivé côté serveur, voir plus bas
});
```

## 1. Blocs et pondérations (`src/scoring/config.ts`)

| Bloc                                | Items | Poids Base | Poids Structure | Poids Phase actuelle |
| ----------------------------------- | ----- | ---------: | --------------: | -------------------: |
| 1 — Base naturelle                  | 1–10  |        40% |             30% |                    — |
| 2 — Perceptions et langage          | 11–17 |        25% |             25% |                    — |
| 3 — Points forts et styles          | 18–24 |        20% |             20% |                    — |
| 4 — Canaux de communication         | 25–29 |        10% |             15% |                    — |
| 5 — Environnements préférés         | 30–33 |         5% |             10% |                   5% |
| 6 — Besoins psychologiques actuels  | 34–38 |          — |               — |                  50% |
| 7 — Stress actuel                   | 39–42 |          — |               — |                  45% |
| 8 — Phasage et cohérence temporelle | 43–45 |          — |               — |            (voir §4) |

Barème de rang : 1er = 6, 2e = 4, 3e = 3, 4e = 2, 5e = 1, 6e = 0,5, non classé = 0.

Les poids « Base » et le barème de rang viennent directement de la matrice V0.2. Les poids
« Structure » et « Phase actuelle » sont une hypothèse produit configurable (matrice non
explicite sur ce point) — voir `docs/SOURCE_MAPPING.md` §4.1–4.2.

## 2. Normalisation (`src/scoring/normalize.ts`)

1. Chaque bloc est normalisé indépendamment en min-max 0–100 (le type le plus évoqué du bloc = 100,
   le moins évoqué = 0 ; à égalité parfaite, tous les types reçoivent 50).
2. Les scores Base / Structure / Phase actuelle combinent les blocs normalisés par moyenne
   pondérée (poids du tableau ci-dessus), puis sont **re-normalisés** min-max une seconde fois
   pour l'affichage (`.normalized`), tout en conservant la valeur combinée brute (`.raw`).

## 3. Base (`engine.ts`)

- Le type au score `.normalized` le plus élevé (blocs 1–5 pondérés) est la **Base probable** ;
  le second est l'**alternative**.
- **Seuil d'ambiguïté : écart < 8 points normalisés** entre le 1er et le 2e → contradiction
  `base_ambigue` ajoutée au résultat, jamais masquée (source : matrice V0.2, p.19).
- La cohérence entre blocs secondaires (2 à 5) et le type de Base est mesurée pour le niveau de
  confiance (voir §6).

## 4. Structure / immeuble (`src/scoring/phases.ts`)

La Base occupe toujours l'étage 1 (rez-de-chaussée), quel que soit son classement dans le score de
Structure. Le calcul de la trajectoire (quels étages sont candidats Phase vécue, lequel est la
Phase actuelle) utilise l'ordre **structurel** brut (score de Structure normalisé) — voir
`docs/SOURCE_MAPPING.md` §4.1 pour la réconciliation entre score de Base et score de Structure.

**Ordre d'affichage final** (`reorderFloorsByReliability`, appliqué après le calcul de
trajectoire) : décroissant par fiabilité/pourcentage affiché, Base toujours en bas. Conséquence
directe : une Phase vécue confirmée et la Phase actuelle (100% chacune) remontent immédiatement
au-dessus de la Base, avant les étages simplement accessibles. En cas d'égalité à 100% entre une
Phase vécue confirmée et la Phase actuelle, la Phase vécue passe en premier (plus proche de la
Base dans la trajectoire réelle). C'est une exigence produit explicite, distincte du calcul de
trajectoire lui-même : le `floorIndex` final reflète donc cet ordre d'affichage, pas la position
structurelle brute.

## 5. Phase actuelle

- `needsTopType` = type dominant du bloc 6 ; `stressTopType` = type dominant du bloc 7.
- Si les deux convergent : Phase actuelle = ce type, statut `probable`.
- Si les deux divergent : Phase actuelle = meilleure estimation (score combiné blocs 6/7/5),
  mais statut `incertaine`, confiance plafonnée à `faible`, et les deux candidats bruts sont
  conservés dans `divergentCandidates` — jamais tranché arbitrairement (matrice V0.2, p.19).
- Si la Phase actuelle correspond à la Base : aucun changement de Phase n'est établi
  (`phaseChangeEstablished = false`), aucune Phase vécue n'est évaluée.

## 6. Phases vécues

Si la Phase actuelle est à l'étage _k_ (k > 1), les étages 2 à _k-1_ sont des **candidats
potentiels**. Une seule « mini ligne de vie » est collectée par soumission (items 43–45 + un
court formulaire de suivi — voir `PhaseHistoryForm.tsx`), ce qui borne le nombre de Phases vécues
_confirmables_ à une seule par soumission, même si plusieurs étages intermédiaires existent
(limite assumée du questionnaire, documentée dans `docs/SOURCE_MAPPING.md` §4.2).

Pour l'étage candidat correspondant au type déclaré dans la ligne de vie :

```
score = 0.70 × (score normalisé du bloc 8 pour ce type / 100)
      + 0.20 × (durée : semaines=0.2, mois=0.5, plus d'un an=0.8, plusieurs années=1, ou 0 si le besoin est encore actuel)
      + 0.10 × (1 si précédé d'un stress durable/changement majeur déclaré, sinon 0)
```

Confirmée (`phase_vecue_confirmee`, 100%) seulement si `score ≥ 0.55` **et** le besoin est déclaré
profond (pas une simple compétence contextuelle). Sinon elle reste `phase_vecue_potentielle` (pas
de statut 100%). Si la ligne de vie déclarée ne correspond à aucun étage intermédiaire réel, une
contradiction `phase_vecue_hors_trajectoire` est ajoutée plutôt que d'ignorer ou de forcer la donnée.

## 7. Règle des 100%

Un pourcentage de 100% n'est attribué qu'aux statuts validés : `base`, `base_et_phase_actuelle`,
`phase_actuelle`, `phase_vecue_confirmee`. Tous les autres étages affichent un pourcentage relatif
dérivé du score de Structure, avec un statut explicite (`etage_accessible`,
`phase_vecue_potentielle`) — jamais laissé entendre que deux 100% signifient la même chose.

## 8. Confiance (`src/scoring/confidence.ts`)

Quatre niveaux : `insuffisante`, `faible`, `moyenne`, `haute`.

1. **Insuffisante** si la moyenne d'options classées par item (sur 45) est `< 0.6` — signale une
   part importante de réponses « aucune ne me correspond », pas un simple classement à une seule
   option par item (qui est un usage normal et valide, moyenne 1.0).
2. **Faible** si l'écart normalisé est `< 8` points (seuil de la matrice) — ou si une divergence
   besoins/stress a été détectée pour la Phase (plafond forcé).
3. **Moyenne** par défaut au-delà de ces seuils.
4. **Haute** seulement si l'écart est `≥ 15` points, la moyenne d'options classées `≥ 2`, et au
   moins 75% des blocs secondaires s'accordent avec le type n°1.

Chaque résultat de confiance conserve la liste des raisons factuelles (`reasons`) qui y ont mené,
pour affichage dans le rapport et dans le détail admin.

## 9. Traçabilité (`evidence`)

Chaque option classée génère une entrée `Evidence` (item, option, type, bloc, rang, poids,
cible). Conservée intégralement dans `result_snapshot` pour permettre à l'administrateur de
remonter jusqu'aux réponses brutes qui ont produit une hypothèse donnée.

## 10. Versionnement

`ASSESSMENT_VERSION` (`v0.2`) et `SCORING_VERSION` (`scoring-2026.08.0`) sont des constantes
versionnées dans `src/scoring/config.ts`, dupliquées en base dans `assessment_versions` pour
traçabilité. Toute recalibration du barème (explicitement anticipée par la matrice comme travail
futur) doit incrémenter `SCORING_VERSION` et passer par `recalculate-submission` pour les
soumissions archivées, sans jamais modifier les réponses brutes déjà enregistrées.

## Limites assumées

- Aucune validation psychométrique officielle (test-retest, comparaison à des profils PCM
  certifiés, étude de la désirabilité sociale) n'a été réalisée — rappelé explicitement dans le
  rapport PDF, section « Méthode et limites ».
- Les pondérations de Structure et de Phase actuelle/vécue sont des hypothèses produit
  configurables, pas des valeurs issues des documents sources.
- Une seule Phase vécue est confirmable par soumission (voir §6).
