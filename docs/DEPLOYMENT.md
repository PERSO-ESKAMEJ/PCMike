# Déploiement

## Frontend (GitHub Pages)

Le workflow `.github/workflows/deploy.yml` s'exécute sur chaque push vers `main` et sur chaque
pull request (build + lint + typecheck + tests systématiquement ; déploiement uniquement sur
`main`) :

1. Installation des dépendances via `npm ci` (lockfile figé).
2. `npm run lint`, `npm run typecheck`, `npm test`.
3. `npm run build`, avec les variables publiques injectées comme variables d'environnement de
   build (voir ci-dessous).
4. Upload de `dist/` comme artefact Pages, déployé uniquement si toutes les étapes précédentes
   ont réussi et que l'événement est un push sur `main`.

### Étapes manuelles GitHub (une fois)

1. **Settings → Pages → Source** : sélectionner « GitHub Actions ».
2. **Settings → Secrets and variables → Actions → Variables** (onglet _Variables_, pas
   _Secrets_ : ces valeurs sont publiques par nature) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_ADMIN_EMAIL`
3. Ne **jamais** ajouter de `SUPABASE_SERVICE_ROLE_KEY` ici : ce dépôt ne déploie que du HTML/CSS/
   JS statique, aucun backend n'y tourne (voir `docs/ARCHITECTURE.md` §6).

### Base path (`VITE_APP_BASE_PATH`)

Le workflow calcule automatiquement `/${{ github.event.repository.name }}/` — adapté à un déploiement
GitHub Pages de type _Project Pages_ (`https://<utilisateur>.github.io/<nom-du-depot>/`).

- Si le dépôt est déployé comme _User/Organization Page_ (`https://<utilisateur>.github.io/`),
  changer la valeur dans le workflow en `/`.
- Si un **domaine personnalisé** est configuré (Settings → Pages → Custom domain), régler
  `VITE_APP_BASE_PATH` sur `/` également, et ajouter un fichier `public/CNAME` contenant le nom de
  domaine (créer `public/` s'il n'existe pas — Vite copie tout `public/*` tel quel dans `dist/`).

Le routage utilise `HashRouter` (`/#/test`, `/#/admin/...`) précisément pour rester compatible
avec GitHub Pages sans configuration serveur de réécriture d'URL.

### Budget de taille de bundle

Le bundle candidat (route `/` et `/test`) ne charge ni `@react-pdf/renderer` ni les pages admin :
ces modules sont importés dynamiquement (`import()`) et ne sont récupérés que si un
administrateur authentifié génère effectivement un rapport ou visite `/admin`. Vérifier après
toute modification substantielle que `npm run build` ne fait pas regonfler le chunk principal
(`dist/assets/index-*.js`) au-delà de ~200 Ko gzippés — sinon, envisager un découpage
supplémentaire (`build.rollupOptions.output.manualChunks`).

## Backend (Supabase)

Volontairement **non automatisé** dans ce workflow (voir `docs/ARCHITECTURE.md` §6) : les
migrations et Edge Functions se déploient manuellement (ou via un pipeline Supabase séparé, au
choix de l'administrateur), avec la Supabase CLI :

```powershell
supabase link --project-ref <ref-du-projet>
supabase db push
supabase functions deploy submit-assessment --no-verify-jwt
supabase functions deploy recalculate-submission
```

Détail complet dans `docs/SUPABASE_SETUP.md`.

## Domaine personnalisé existant

Si un domaine personnalisé était déjà configuré sur l'ancien déploiement de ce dépôt (voir
`legacy-static/`), le reconfigurer à l'identique dans Settings → Pages une fois le nouveau
workflow actif — aucune information sur un domaine existant n'a été trouvée dans ce dépôt au
moment de la refonte (voir l'échange de clarification en tête de session : le dossier n'était
même pas un dépôt Git).

## Rollback

Le déploiement GitHub Pages via `actions/deploy-pages` conserve l'historique des déploiements
(onglet _Deployments_ du dépôt) : un rollback consiste à re-déclencher le workflow depuis un
commit antérieur (`workflow_dispatch` sur ce commit, ou revert + push). Aucune migration
Supabase destructive n'est incluse dans ce dépôt (toutes les migrations sont additives) ; un
rollback frontend n'a donc pas besoin d'être coordonné avec une migration de base de données.
