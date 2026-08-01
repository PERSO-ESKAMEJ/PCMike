# Mise en place Supabase

Ce guide couvre les étapes manuelles nécessaires, dans l'ordre. Aucune de ces étapes n'a pu être
exécutée depuis cet environnement de développement (pas d'accès à un compte Supabase) : à
effectuer par un humain disposant des accès nécessaires.

## Prérequis

- Un compte [supabase.com](https://supabase.com).
- La [Supabase CLI](https://supabase.com/docs/guides/cli) installée localement
  (`npm install -g supabase` ou `scoop install supabase` sur Windows).
- Node.js 20+ pour exécuter les scripts de génération du dépôt.

## 1. Créer le projet

1. Sur [supabase.com/dashboard](https://supabase.com/dashboard), créer un nouveau projet.
2. Noter l'**URL du projet** et la **clé publique `anon`/`publishable`**
   (Project Settings → API). Ce sont les deux seules valeurs à mettre dans `.env.local` /
   dans les variables GitHub Actions.
3. Ne jamais copier la **`service_role` key** en dehors des secrets d'Edge Functions
   (voir §7) : elle ne doit **jamais** apparaître dans `.env.local`, dans un commit, ni dans les
   variables `VITE_*`.

## 2. Variables à récupérer

Remplir `.env.local` (copié depuis `.env.example`, jamais commité) :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... (clé anon/publishable, PAS la service_role)
VITE_ADMIN_EMAIL=admin@example.com
VITE_APP_BASE_PATH=/
```

## 3. Lier le projet et appliquer les migrations

```powershell
supabase login
supabase link --project-ref <ref-du-projet>
supabase db push
```

Cela applique dans l'ordre tous les fichiers de `supabase/migrations/` : extensions/enums,
tables principales, table privée `scoring_key`, politiques RLS, bucket de stockage, fonction
`record_submission`, et la ligne initiale de `assessment_versions`.

## 4. Charger la clé de scoring privée

La correspondance option → type (`supabase/seed/scoring_key.seed.sql`) n'est **pas** appliquée
par `supabase db push` (ce n'est pas une migration de schéma, c'est une donnée sensible tenue à
part — voir `docs/SOURCE_MAPPING.md` §4.4). Après avoir régénéré ce fichier si besoin
(`npm run generate:scoring-key`), l'appliquer manuellement :

```powershell
supabase db execute -f supabase/seed/scoring_key.seed.sql --linked
```

Ou en collant son contenu dans le SQL Editor du dashboard Supabase.

## 5. Créer le compte administrateur

1. Dashboard Supabase → Authentication → Users → **Add user** (email = celui prévu pour
   `VITE_ADMIN_EMAIL`, définir un mot de passe fort = le « code d'accès »).
2. Copier l'**UUID** de l'utilisateur créé.

## 6. Ajouter ce compte dans `admin_users`

Dans le SQL Editor du dashboard (aucune interface cliente ne permet cette écriture, par
conception — voir `docs/PRIVACY_AND_SECURITY.md`) :

```sql
insert into public.admin_users (user_id) values ('<uuid-copié-à-l-étape-5>');
```

## 7. Déployer les Edge Functions

```powershell
supabase functions deploy submit-assessment --no-verify-jwt
supabase functions deploy recalculate-submission
```

(`supabase/config.toml` déclare déjà `verify_jwt = false` pour `submit-assessment` — public par
nature — et `verify_jwt = true` pour `recalculate-submission` — admin uniquement.)

Les Edge Functions important des fichiers en dehors de `supabase/functions/` (le moteur de
scoring partagé dans `src/scoring/`, les données publiques dans `src/data/`, le contrat de
payload dans `src/lib/submissionPayload.ts`) : la Supabase CLI récente suit ces imports relatifs
sans configuration supplémentaire. En cas d'échec de déploiement lié à la résolution de modules,
vérifier la version de la CLI (`supabase --version`, recommandé ≥ 1.200).

## 8. Configurer les secrets des Edge Functions

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont **automatiquement disponibles** dans
l'environnement d'exécution des Edge Functions déployées (pas besoin de les définir à la main).
`SUPABASE_ANON_KEY` (utilisée par `recalculate-submission` pour vérifier l'appartenance à
`admin_users` avec le JWT de l'appelant) est également fournie automatiquement.

Aucun secret supplémentaire n'est requis pour la version actuelle. Si Cloudflare Turnstile est
ajouté plus tard (voir §11), sa clé secrète se définirait avec :

```powershell
supabase secrets set TURNSTILE_SECRET_KEY=xxxx
```

## 9. Créer le bucket privé (déjà fait par la migration)

La migration `20260801000005_reports_storage_bucket.sql` crée le bucket `reports` (`public =
false`) et ses politiques. Vérifier dans Storage → `reports` que le bucket existe et est bien
marqué privé après `supabase db push`.

## 10. Tester les politiques RLS

Depuis le SQL Editor, en tant que rôle `anon` (Supabase permet de simuler via
`set local role anon;` dans une transaction) :

```sql
begin;
set local role anon;
select * from public.participants; -- doit renvoyer 0 ligne, jamais une erreur de permission opaque
select * from public.scoring_key;  -- doit renvoyer 0 ligne
rollback;
```

Puis en tant qu'administrateur authentifié (via l'application, `/#/admin`), vérifier que le
tableau de bord affiche bien les soumissions. Voir aussi les tests d'intégration RLS documentés
dans `tests/integration/`.

## 11. Générer le premier rapport

1. Faire passer le questionnaire une fois (`/#/test`) en environnement de test.
2. Se connecter à `/#/admin` avec le compte créé à l'étape 5.
3. Ouvrir la soumission, cliquer sur « Générer le rapport PDF ».
4. Vérifier le PDF téléchargé (12 pages logiques, avertissement non-officiel en couverture et en
   dernière page).

## Anti-abus (optionnel, non activé par défaut)

Le formulaire inclut déjà un champ honeypot et une vérification de durée minimale côté Edge
Function (`submit-assessment`, voir `docs/PRIVACY_AND_SECURITY.md`). Pour ajouter Cloudflare
Turnstile plus tard : générer une paire de clés sur le dashboard Cloudflare, ajouter le widget
côté `IdentificationForm.tsx`, transmettre le jeton dans le payload, et le vérifier côté
`submit-assessment` via l'API `siteverify` de Turnstile avant de poursuivre le traitement.
