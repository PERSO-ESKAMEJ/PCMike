# Explorateur expérimental inspiré du PCM

Application web permettant de faire passer un questionnaire expérimental de 45 items inspiré de
la logique des six types du Process Communication Model, de calculer un résultat autoritatif côté
serveur, et de générer manuellement un rapport PDF depuis un espace administrateur protégé.

> Cet outil expérimental propose des hypothèses de connaissance de soi inspirées d'un modèle de
> communication à six types. Il ne constitue ni le Profil PCM officiel, ni un diagnostic
> psychologique ou clinique. Les résultats doivent être considérés comme des pistes de réflexion
> à confirmer par un échange qualitatif.

## Documentation

- [`docs/SOURCE_MAPPING.md`](docs/SOURCE_MAPPING.md) — traçabilité entre les documents sources
  privés et les décisions de conception (à lire en premier).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — état des lieux et choix d'architecture.
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — plan et avancement par phase.
- [`docs/SCORING.md`](docs/SCORING.md) — règles du moteur de scoring.
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — mise en place du projet Supabase.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — déploiement GitHub Pages et Supabase.
- [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) — utilisation de l'espace administrateur.
- [`docs/PRIVACY_AND_SECURITY.md`](docs/PRIVACY_AND_SECURITY.md) — confidentialité et sécurité.

## Stack

React 18 · TypeScript strict · Vite · React Router (`HashRouter`) · Supabase (Postgres, Auth, Edge
Functions, Storage) · `@dnd-kit` · `@react-pdf/renderer` · `zod` · Vitest · Playwright.

L'ancien prototype statique (sans build tool) est conservé pour référence dans
[`legacy-static/`](legacy-static/) et n'est plus déployé.

## Démarrage local

```powershell
npm install
cp .env.example .env.local   # puis renseigner les valeurs (voir docs/SUPABASE_SETUP.md)
npm run dev
```

## Scripts

| Commande                        | Rôle                                                               |
| ------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                   | Serveur de développement Vite                                      |
| `npm run build`                 | Build de production (`tsc -b && vite build`)                       |
| `npm run lint`                  | ESLint                                                             |
| `npm run typecheck`             | Vérification TypeScript sans émission                              |
| `npm test`                      | Tests unitaires et d'intégration (Vitest)                          |
| `npm run test:e2e`              | Tests end-to-end (Playwright)                                      |
| `npm run generate:public-items` | Régénère `src/data/assessment.items.v0.2.ts` depuis le seed privé  |
| `npm run generate:scoring-key`  | Régénère `supabase/seed/scoring_key.seed.sql` depuis le seed privé |
| `npm run format`                | Formatage Prettier                                                 |

## Structure

Voir `docs/ARCHITECTURE.md` §7 pour l'arborescence complète commentée.

```text
src/            application React (candidat + admin), moteur de scoring, rapport PDF
supabase/       migrations SQL, Edge Functions, seed privé (jamais bundlé au front)
tests/          tests unitaires et d'intégration
docs/           documentation du projet
legacy-static/  ancien prototype, archivé
```

## Cadre méthodologique

Ce projet est indépendant, expérimental et non officiel. Il ne remplace pas un profil PCM
certifié ni l'accompagnement d'un praticien habilité. Aucun contenu, logo, illustration ou mise en
page propriétaire n'est reproduit — voir `docs/SOURCE_MAPPING.md` pour le détail des sources et de
leur usage.
