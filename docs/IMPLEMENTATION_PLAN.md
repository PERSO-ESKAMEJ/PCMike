# Plan d'implémentation

Ce plan découpe la mission en phases livrables indépendamment vérifiables (lint/typecheck/test à
chaque étape). Chaque phase est cochée au fur et à mesure dans ce fichier pour donner une vue
d'avancement fidèle à l'état réel du dépôt — à tenir à jour, pas figé une fois pour toutes.

- [x] **Phase 0 — Prérequis et traçabilité**
  - Vérification de l'existence des 3 PDF sources, lecture intégrale des trois documents.
  - `git init` local (le dépôt n'existait pas malgré l'hypothèse initiale de la mission — voir
    échange de clarification), archivage de l'ancien prototype dans `legacy-static/`.
  - `docs/SOURCE_MAPPING.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`.
- [x] **Phase 1 — Socle du projet**
  - `package.json`, Vite + React + TypeScript strict, ESLint, Vitest, Playwright (installés).
  - Dépendances : `react-router-dom` (HashRouter), `@supabase/supabase-js`, `@dnd-kit/*`,
    `@react-pdf/renderer`, `zod`.
  - `npm audit` passé en revue ; vulnérabilité résiduelle `react-router-dom`
    (`GHSA-qwww-vcr4-c8h2`) documentée et acceptée (§4.5 de `SOURCE_MAPPING.md`) — inapplicable en
    usage SPA statique sans mode RSC/Actions serveur.
- [x] **Phase 2 — Données et moteur de scoring (bibliothèque pure, testée)**
  - `supabase/seed/items.v0.2.ts` (privé) et `src/data/assessment.items.v0.2.ts` (public, généré)
    à partir de la transcription exacte de la matrice.
  - `src/scoring/{types,config,normalize,confidence,phases,engine}.ts`.
  - 26 tests unitaires : intégrité des données (45×6, codes uniques), profils synthétiques pour
    les 6 types, Base ≠ Phase, Phases vécues multiples (confirmée + potentielle), contradiction
    besoins/stress, Base ambiguë, reproductibilité, résilience JSON round-trip.
- [x] **Phase 3 — Parcours candidat**
  - Pages : introduction (+ fonctionnement du classement + confidentialité en une page),
    identification, 45 items par bloc, ligne de vie post-item-45, vérification finale, envoi,
    confirmation.
  - Classement partiel accessible (`@dnd-kit` pour le réordonnancement, boutons pour
    ajouter/retirer/déplacer — souris, tactile et clavier), randomisation d'ordre persistée par
    session, résilience réseau et `localStorage`, aucune sauvegarde serveur avant l'envoi final.
  - `src/lib/submissionPayload.ts` (schémas zod), clé d'idempotence générée côté client
    (`crypto.randomUUID()`).
- [x] **Phase 4 — Backend Supabase**
  - 7 migrations SQL : extensions/enums, tables principales, table privée `scoring_key`,
    politiques RLS, bucket de stockage privé, fonction `record_submission` (écriture
    transactionnelle), version initiale active.
  - Edge Function `submit-assessment` (validation stricte, anti-abus, scoring autoritatif,
    écriture transactionnelle via RPC, idempotence).
  - Edge Function `recalculate-submission` (admin uniquement, JWT vérifié + appartenance
    `admin_users`).
  - Tests d'intégration RLS **non exécutés** dans cet environnement (pas d'instance Postgres
    locale disponible) — protocole documenté dans `docs/SUPABASE_SETUP.md` §10, à exécuter avant
    mise en production.
- [x] **Phase 5 — Espace administrateur**
  - Authentification par « code d'accès » (email fixe `VITE_ADMIN_EMAIL` + mot de passe via
    `signInWithPassword`), verrouillage local après 5 tentatives, `noindex` dynamique sur les
    routes admin, déconnexion.
  - Liste/recherche des soumissions, détail complet (réponses agrégées, scores, contradictions,
    immeuble), recalcul, génération/liste des rapports, marquage « envoyé », anonymisation.
  - **Non implémenté dans cette version** : filtres avancés (date/statut/Base/Phase dédiés au-delà
    de la recherche texte), tri manuel des colonnes, notes internes, export CSV/JSON, archivage
    du PDF dans le bucket Storage depuis l'interface (le bucket et ses politiques existent, seul
    le branchement de l'upload reste à faire — voir `docs/ADMIN_GUIDE.md`).
- [x] **Phase 6 — Génération du rapport PDF**
  - `src/reports/ReportDocument.tsx` : 17 pages logiques (couverture, introduction, synthèse,
    structure, perceptions, points forts, styles, parties, canaux, environnements, besoins, phase
    et phases vécues, satisfaction négative, séquence de stress, plan d'action, méthode et
    limites), contenus narratifs 100% originaux (`src/reports/content/`), chargé dynamiquement
    (code-splitting) pour ne jamais alourdir le bundle candidat.
  - Déclenchement manuel depuis le détail d'une soumission, téléchargement immédiat, entrée créée
    dans `reports`. Archivage dans le bucket privé non encore branché (voir Phase 5).
- [x] **Phase 7 — CI/CD**
  - `.github/workflows/deploy.yml` : install (lockfile) → lint → typecheck → test → build →
    contrôle anti-fuite de secrets → déploiement GitHub Pages conditionnel (push sur `main`
    uniquement, après succès de toutes les étapes précédentes).
  - `base` Vite calculé dynamiquement (`/${{ github.event.repository.name }}/`) — à ajuster si le
    dépôt distant est déployé comme *User/Organization Page* ou avec un domaine personnalisé (voir
    `docs/DEPLOYMENT.md`).
- [x] **Phase 8 — Documentation finale et QA globale**
  - `README.md`, `docs/SCORING.md`, `docs/SUPABASE_SETUP.md`, `docs/DEPLOYMENT.md`,
    `docs/ADMIN_GUIDE.md`, `docs/PRIVACY_AND_SECURITY.md`, `.env.example`.
  - `npm run lint`, `npm run typecheck`, `npm test` (33 tests) et `npm run build` exécutés avec
    succès en fin de session ; `npm run check:no-secrets` vérifie l'absence de secret dans
    `dist/`. Résumé des fichiers et étapes manuelles restantes fourni à l'utilisateur en fin de
    session.

## Décisions prises pendant l'exécution (à ne pas re-débattre sans raison nouvelle)

- Le dépôt PCM n'était pas un dépôt Git : initialisé localement sur demande explicite de
  l'utilisateur ; la création du dépôt distant sur GitHub.com et la configuration de Pages
  restent une étape manuelle (`gh` CLI indisponible dans cet environnement).
- L'ancien prototype vanilla JS est conservé dans `legacy-static/` (non déployé, non maintenu)
  plutôt que supprimé, pour ne rien perdre de l'historique de conception.
- La clé de scoring privée est versionnée dans un seed SQL/TS protégé par RLS plutôt que gardée
  hors Git (les deux options étaient autorisées par la mission) — voir justification
  `docs/SOURCE_MAPPING.md` §4.4.

## Ce qui reste hors de portée de cet environnement (bloqué sans action humaine)

- Création effective du projet Supabase, du compte administrateur, et exécution réelle des
  migrations/Edge Functions contre une instance Supabase distante : nécessite des identifiants
  que je n'ai pas et ne dois pas avoir.
- Création du dépôt GitHub distant et premier `git push` : nécessite une confirmation explicite
  et, selon la méthode d'authentification disponible sur cette machine, une action manuelle.
  Aucun push ne sera effectué sans confirmation préalable de l'utilisateur.
- Tests Playwright end-to-end réels contre un navigateur : l'outillage est installé
  (`@playwright/test`, script `npm run test:e2e`) mais aucun scénario n'a été écrit ni exécuté
  dans cette session (pas de navigateurs Playwright téléchargés dans ce bac à sable) — à
  prioriser pour la suite : parcours candidat complet (classement, résilience réseau simulée,
  clavier) et connexion admin.
- Tests d'intégration RLS contre une vraie instance Postgres (voir Phase 4).
- Vérification visuelle réelle en navigateur (drag-and-drop tactile, rendu du PDF) : non
  réalisable dans cet environnement sans navigateur pilotable ; validée uniquement par
  lint/typecheck/tests/build et par relecture attentive du code. À faire manuellement avant mise
  en production (voir `docs/SUPABASE_SETUP.md` §11 pour le premier rapport de test).
