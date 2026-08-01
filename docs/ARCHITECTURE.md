# Architecture

## 1. État du dépôt avant la refonte

Le dépôt ne contenait aucun outil de build : une page HTML statique chargeant trois fichiers
`<script>` classiques (`data.js`, `scoring.js`, `app.js`), un `localStorage` pour la persistance,
et un test Node exécuté directement sur `scoring.js` via `node:assert`. Aucun `package.json` avec
dépendances, aucun bundler, aucun routeur, aucun backend, aucun workflow GitHub Actions. Le
dossier n'était même pas un dépôt Git (`git init` a été nécessaire, voir `IMPLEMENTATION_PLAN.md`
§0). Cette version est conservée telle quelle dans `legacy-static/` pour référence historique et
n'est plus servie.

Cette base ne peut pas être conservée : la mission exige une authentification Supabase, un calcul
de score **autoritatif côté serveur** (donc invisible et infalsifiable depuis le navigateur), un
espace administrateur protégé par RLS, et une génération de PDF déterministe — aucun de ces
besoins n'est satisfiable avec des scripts globaux `window.*` sans bundler ni TypeScript. La
mission autorise explicitement le choix par défaut React + TypeScript + Vite + Supabase dans ce
cas ; c'est celui retenu, sans créer d'application parallèle : l'ancienne app est archivée, la
nouvelle prend sa place à la racine.

## 2. Vue d'ensemble

```
Candidat (navigateur)                Administrateur (navigateur)
   │  HashRouter SPA                    │  HashRouter SPA (même bundle)
   │  localStorage (brouillon local)    │  Supabase Auth (email + mot de passe)
   ▼                                    ▼
┌─────────────────────────────────────────────────────────────┐
│ GitHub Pages — fichiers statiques uniquement (aucun secret)  │
└─────────────────────────────────────────────────────────────┘
   │ appel unique à la fin du test           │ lecture/écriture directe
   ▼ (clé anon, payload minimal)             ▼ (JWT utilisateur, via RLS)
┌─────────────────────────────────────────────────────────────┐
│ Supabase                                                     │
│  - Edge Function `submit-assessment` (Deno) : validation,    │
│    scoring autoritatif, écriture transactionnelle            │
│  - Edge Function `recalculate-submission` : re-scoring admin │
│  - Postgres + RLS (tables candidats/soumissions/rapports)    │
│  - Storage privé `reports` (PDF archivés)                    │
│  - Auth (1 compte admin, `admin_users`)                      │
└─────────────────────────────────────────────────────────────┘
```

Principe non négociable : **le candidat ne reçoit jamais son score**. Le navigateur candidat
n'a même pas accès à la table de correspondance option → type (elle vit uniquement côté Supabase,
protégée par RLS — voir `docs/SOURCE_MAPPING.md` §4.4 et `docs/PRIVACY_AND_SECURITY.md`).

## 3. Frontend

- **React 18 + TypeScript strict + Vite**. Un seul bundle SPA, servi statiquement par GitHub
  Pages, contenant à la fois le parcours candidat et l'espace admin (protégé par Auth + RLS, pas
  par une séparation de bundle — la route `/#/admin` ne donne accès à rien sans session valide).
- **`HashRouter`** (`react-router-dom`) : obligatoire sur GitHub Pages Project Pages, qui ne
  supporte pas le rewrite côté serveur nécessaire à un `BrowserRouter` sur un rafraîchissement
  d'URL profonde.
- **`@dnd-kit/core` + `@dnd-kit/sortable`** pour le classement des propositions : gère nativement
  souris, tactile et clavier (contrairement à l'ancienne implémentation en `dragstart`/`drop`
  natif du navigateur, inaccessible au clavier).
- **`@react-pdf/renderer`** pour la génération de PDF, exécutée **uniquement dans le navigateur de
  l'administrateur**, jamais côté candidat ni côté serveur.
- **`zod`** pour la validation runtime des payloads côté client (formulaire d'identification,
  réponses avant envoi) — en miroir du schéma validé côté Edge Function, qui reste la source
  d'autorité.

## 4. Séparation données publiques / privées

Voir `docs/SOURCE_MAPPING.md` §1.3 et §4.4 pour la justification détaillée.

| Donnée                                                                               | Emplacement                                                                                           | Exposée au bundle candidat ?                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Texte des 45 items, ids d'options opaques, blocs                                     | `src/data/assessment.items.v0.2.ts`                                                                   | Oui (nécessaire pour afficher le test)                                                                                                                                                                                                                                          |
| Correspondance option → type (AN/PE/EM/IM/EN/PR)                                     | `supabase/seed/items.v0.2.ts` → table Postgres `scoring_key`, RLS admin/service uniquement            | **Non, jamais**                                                                                                                                                                                                                                                                 |
| Configuration de scoring (poids de rang, pondérations de blocs, seuils de confiance) | `src/scoring/config.ts`, dupliquée en base via `assessment_versions.scoring_version` pour traçabilité | Oui pour la structure des poids par rang (nécessaire à l'UI de classement), non pour la formule de blocs qui n'a pas d'utilité côté client — le moteur `src/scoring/engine.ts` n'est de toute façon jamais invoqué côté candidat, seulement testé et exécuté côté Edge Function |
| Moteur de scoring (`src/scoring/engine.ts`)                                          | Package TypeScript pur, sans dépendance React ni DOM                                                  | Importé et exécuté par l'Edge Function (runtime Deno, compatible ESM), **jamais appelé depuis le bundle candidat** pour produire un résultat affiché                                                                                                                            |

Le moteur de scoring est un module pur (aucun import de `react`, `supabase-js` ou DOM) afin
d'être : (a) testable unitairement sans environnement navigateur, (b) exécutable tel quel dans
l'Edge Function Deno, (c) impossible à faire dériver silencieusement entre client et serveur
puisqu'il n'existe qu'à un seul endroit du code, importé aux deux endroits.

## 5. Backend Supabase

- **Postgres** : tables détaillées dans `docs/SUPABASE_SETUP.md` et les migrations
  `supabase/migrations/`. RLS activée sur toutes les tables ; aucune politique publique
  d'insertion directe — tout passe par les Edge Functions qui utilisent la `service_role` key
  (jamais exposée au front).
- **Edge Functions (Deno)** :
  - `submit-assessment` (publique, appelée par le candidat) : valide le schéma, vérifie
    l'idempotence, charge la clé de scoring privée, calcule le résultat autoritatif, écrit
    candidat + soumission + réponses en une transaction logique, retourne uniquement le code de
    référence.
  - `recalculate-submission` (admin uniquement, JWT vérifié + présence dans `admin_users`) :
    recharge une soumission archivée et relance le moteur avec une version de scoring choisie,
    sans jamais modifier les réponses brutes d'origine.
- **Storage** : bucket privé `reports`, jamais public, accès par URL signée courte durée ou
  téléchargement authentifié uniquement côté admin.
- **Auth** : un seul compte administrateur (créé manuellement dans le dashboard Supabase, jamais
  par le code), vérifié à la fois par Supabase Auth _et_ par une ligne dans `admin_users` — la
  simple connaissance de l'email admin (public, `VITE_ADMIN_EMAIL`) ne donne aucun accès.

## 6. Déploiement

- **Frontend** : GitHub Actions → build Vite → déploiement de l'artefact statique sur GitHub
  Pages. Aucun secret Supabase `service_role` dans ce pipeline ; uniquement les variables
  publiques `VITE_*` (URL Supabase, clé publishable, email admin) injectées comme variables de
  build. Détail dans `docs/DEPLOYMENT.md`.
- **Backend** : migrations et Edge Functions déployées manuellement par l'administrateur via la
  Supabase CLI (commandes documentées dans `docs/SUPABASE_SETUP.md`), pas automatisées dans le
  pipeline GitHub Pages — cohérent avec la consigne « aucun backend hébergé sur GitHub Pages » et
  avec le fait qu'aucun jeton Supabase `service_role` ne doit transiter par les secrets du dépôt
  GitHub sans nécessité (le déploiement Supabase peut être fait en local ou via un pipeline
  Supabase séparé si l'administrateur le souhaite plus tard).

## 7. Arborescence cible

```text
src/
  app/                       bootstrap, providers (Supabase client, routeur)
  routes/                    définition des routes HashRouter
  components/                composants UI génériques et accessibles
  features/
    assessment/              parcours candidat (étapes, drag-and-drop, résilience réseau)
    admin/                   authentification par code, liste/détail des soumissions
    reports/                 déclenchement de génération, aperçu, archivage
  data/
    assessment.items.v0.2.ts données publiques du questionnaire (texte only)
  scoring/
    types.ts                 types partagés (réponses, résultat, confiance...)
    config.ts                 configuration versionnée (poids, seuils)
    normalize.ts               normalisation par bloc
    confidence.ts              calcul de confiance et détection de contradictions
    phases.ts                  logique Base/Phase actuelle/Phases vécues + contrainte de trajectoire
    engine.ts                  point d'entrée pur, sans dépendance UI
  reports/
    ReportDocument.tsx         document @react-pdf/renderer
    sections/                  une section = un fichier
    charts/                    graphiques vectoriels (immeuble, barres, paliers de stress)
    content/                   modèles narratifs déterministes versionnés (pas d'appel IA)
  lib/
    supabase.ts                client Supabase (clé publishable uniquement)
    validation.ts              schémas zod partagés
supabase/
  migrations/                  SQL versionné et réversible
  functions/
    submit-assessment/
    recalculate-submission/
  seed/                        items.v0.2.ts (privé, correspondance option → type)
docs/
tests/
  unit/ integration/ e2e/
```

## 8. Alternatives envisagées et écartées

- **BrowserRouter** : écarté, incompatible avec GitHub Pages sans configuration serveur
  supplémentaire (404.html trick), alors que la mission demande explicitement `HashRouter`.
- **Calcul de score côté client avec la clé complète chiffrée dans le bundle** : écarté — un
  bundle JS est toujours désassemblable, une clé de déchiffrement livrée avec les données
  chiffrées n'apporte aucune protection réelle contre un candidat qui inspecterait le réseau ou
  le code.
- **Génération du PDF côté Edge Function (serveur)** : écarté au profit du navigateur admin, sur
  demande explicite de la mission (« Ne génère pas le PDF depuis le navigateur du candidat » +
  préférence pour `@react-pdf/renderer` côté client admin) ; évite aussi de gérer des polices et
  un environnement de rendu Deno plus complexe pour un usage strictement manuel et peu fréquent.
