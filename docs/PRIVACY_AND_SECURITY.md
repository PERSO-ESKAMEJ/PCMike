# Confidentialité et sécurité

## Principes

- Le candidat ne reçoit jamais son score : `submit-assessment` renvoie uniquement un code de
  référence et une confirmation.
- Le calcul de score est **autoritatif côté serveur** : le navigateur candidat n'a jamais accès à
  la correspondance option → type (`scoring_key`), protégée par RLS, lisible uniquement par le
  rôle `service_role` utilisé exclusivement par les Edge Functions.
- Toute donnée personnelle (participants, réponses, résultats, rapports) est protégée par RLS et
  n'est lisible que par un compte authentifié présent dans `admin_users`.
- Aucun secret (`service_role`, mots de passe, jetons) n'est présent dans le bundle front-end —
  vérifié automatiquement par `npm run check:no-secrets` (voir `scripts/check-no-secrets-in-build.mjs`,
  exécuté en CI juste après le build) et par revue manuelle avant chaque déploiement.

## Authentification administrateur

- Un seul compte Supabase Auth, créé manuellement (jamais par le code — voir
  `docs/SUPABASE_SETUP.md` §5).
- La connaissance de la route `/#/admin` ne donne aucun accès : sans session Supabase Auth valide
  **et** sans ligne correspondante dans `admin_users`, toute requête vers une table sensible est
  refusée par RLS, quel que soit ce que l'interface tente d'afficher.
- `admin_users` n'a aucune politique d'écriture pour un rôle client, quel qu'il soit : l'ajout d'un
  administrateur est un acte SQL manuel et documenté, jamais une action exposée dans l'application
  (empêche toute élévation de privilège via un bug applicatif).
- La page admin porte `<meta name="robots" content="noindex">` — **à ajouter explicitement** dans
  `index.html` si l'espace admin doit être exclu de l'indexation (actuellement l'`index.html`
  racine a `content="index, follow"` pour la page publique ; comme il s'agit d'une SPA à route
  unique, un `noindex` global serait plus prudent une fois l'espace admin utilisé en production —
  voir note dans `docs/IMPLEMENTATION_PLAN.md`).

## Validation et anti-abus (`submit-assessment`)

- Schéma zod strict (`src/lib/submissionPayload.ts`), rejeté sans détail exploitable en cas
  d'échec.
- Taille de payload plafonnée (200 Ko).
- Champ honeypot (`website`) : rempli → réponse de succès factice, sans écriture en base (ne
  révèle pas au bot qu'il a été détecté).
- Durée minimale de remplissage (45 secondes entre `formRenderedAt` et `completedAt`) : filtre
  les soumissions automatisées trop rapides, sans pénaliser un usage humain réel (~20–30 minutes).
- Vérification stricte : 45 items exactement, aucun doublon d'item, aucune option dupliquée dans
  un classement, tous les identifiants d'option valides pour l'item concerné, ordre de présentation
  cohérent avec les 6 options réelles.
- Version du questionnaire vérifiée contre `assessment_versions.is_active`.
- Clé d'idempotence (`idempotency_key`, UUID généré côté client) : une nouvelle tentative après
  échec réseau ne crée jamais de doublon (`record_submission` renvoie la ligne existante).
- Cloudflare Turnstile n'est pas activé par défaut ; point d'extension documenté dans
  `docs/SUPABASE_SETUP.md` §11.
- Aucune adresse IP n'est enregistrée.

## Anonymisation et suppression

- « Anonymiser » (bouton admin) remplace les champs identifiants du candidat par des valeurs
  neutres et horodate `anonymized_at`, sans toucher aux réponses ni au résultat de scoring.
- La suppression complète (cascade sur toutes les tables liées) est possible via `on delete
cascade` sur `participant_id` — action actuellement réservée à un accès SQL direct (voir
  `docs/ADMIN_GUIDE.md`).

## RLS — résumé par table

| Table                      | `anon`                             | `authenticated` non-admin         | admin (`admin_users`)                    | `service_role` |
| -------------------------- | ---------------------------------- | --------------------------------- | ---------------------------------------- | -------------- |
| `assessment_versions`      | lecture (version active seulement) | lecture (version active)          | lecture complète                         | tout           |
| `participants`             | aucun accès                        | aucun accès                       | lecture, modification, suppression       | tout           |
| `submissions`              | aucun accès                        | aucun accès                       | lecture, modification, suppression       | tout           |
| `submission_answers`       | aucun accès                        | aucun accès                       | lecture, suppression                     | tout           |
| `phase_history_answers`    | aucun accès                        | aucun accès                       | lecture, suppression                     | tout           |
| `reports`                  | aucun accès                        | aucun accès                       | lecture, écriture                        | tout           |
| `admin_users`              | aucun accès                        | aucun accès                       | lecture de sa propre ligne uniquement    | tout           |
| `scoring_key`              | **aucun accès, aucune politique**  | **aucun accès, aucune politique** | aucun accès (pas nécessaire côté client) | tout           |
| bucket `reports` (Storage) | aucun accès                        | aucun accès                       | lecture/écriture                         | tout           |

`service_role` contourne RLS par construction Postgres/Supabase — utilisé exclusivement dans les
Edge Functions, jamais transmis au navigateur.

## Vulnérabilité npm connue et acceptée

`react-router-dom` 7.18.2 (dernière version publiée au moment de la mise en place) est couvert par
l'avis `GHSA-qwww-vcr4-c8h2` (CSRF en mode RSC sur les Actions serveur). Cette fonctionnalité
(React Server Components, Actions serveur) n'est **pas utilisée** par cette application : SPA
100% cliente avec `HashRouter` uniquement, aucun runtime serveur React Router. Risque jugé non
exploitable dans ce contexte, accepté et documenté ; à réévaluer via `npm audit` en CI dès qu'un
correctif est publié. Détail complet dans `docs/SOURCE_MAPPING.md` §4.5.

## Tests de sécurité

- `tests/unit/data/items.test.ts` : non-fuite des codes de type dans les données publiques.
- `tests/unit/lib/submissionPayload.test.ts` : rejet des payloads invalides (honeypot rempli,
  e-mail invalide, réponses incomplètes, ordre de présentation incorrect).
- `npm run check:no-secrets` : absence de secret dans le build final (voir plus haut).
- Les tests d'intégration RLS (accès anonyme refusé, accès admin autorisé, doublon d'idempotence)
  nécessitent une instance Postgres locale (`supabase start`) non disponible dans cet
  environnement de développement — protocole de test documenté dans `docs/SUPABASE_SETUP.md` §10,
  à exécuter avant toute mise en production.
