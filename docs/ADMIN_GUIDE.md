# Guide administrateur

## Connexion

1. Aller sur `/#/admin` (l'URL n'accorde par elle-même aucun accès — voir
   `docs/PRIVACY_AND_SECURITY.md`).
2. Saisir le code d'accès (le mot de passe défini lors de la création du compte, voir
   `docs/SUPABASE_SETUP.md` §5). L'adresse e-mail associée n'est pas demandée : elle est fixée
   par `VITE_ADMIN_EMAIL` et n'est pas un secret.
3. Après 5 tentatives échouées, le formulaire se verrouille localement (recharger la page pour
   réessayer) — une protection d'appoint côté client, la vraie limite de sécurité étant côté
   Supabase Auth.
4. « Se déconnecter » ferme la session Supabase Auth immédiatement.

## Tableau de bord (`/#/admin/dashboard`)

- Liste toutes les soumissions, triées par date décroissante.
- Champ de recherche : filtre par nom, prénom, e-mail, code de référence ou organisation
  (recherche côté client sur les données déjà chargées — convient à un volume modéré de
  candidats ; à faire évoluer côté serveur si le volume grandit significativement).
- Chaque ligne affiche : code de référence, candidat, date, Base probable, Phase actuelle,
  niveau de confiance, statut. Cliquer sur le code de référence ouvre le détail.

## Détail d'une soumission (`/#/admin/submissions/:id`)

### Section Candidat

Coordonnées complètes, sauf si le candidat a été anonymisé (auquel cas seule la date
d'anonymisation est affichée).

### Section Résultat

- Base probable, alternative, marge, confiance.
- Phase actuelle (statut `probable`/`incertaine`), établissement d'un changement de Phase.
- Phases vécues confirmées.
- Contradictions détectées (jamais masquées — texte explicite pour chaque cas : Base ambiguë,
  divergence besoins/stress, ligne de vie hors trajectoire, compétence contextuelle non retenue).
- L'immeuble complet (6 étages, statut et pourcentage de chacun).
- **Recalculer** : relance le moteur de scoring (`recalculate-submission`) sur les réponses
  brutes d'origine, avec la version de scoring active. Les réponses brutes ne sont jamais
  modifiées, seul le résultat calculé est mis à jour.

### Section Rapports

- **Générer le rapport PDF** : construit le PDF entièrement dans le navigateur (aucun aller-retour
  serveur pour la génération elle-même), le télécharge, puis enregistre une ligne dans `reports`.
- Chaque génération précédente est listée avec sa date et son statut.
- **Marquer comme envoyé** : à utiliser après avoir transmis le PDF au candidat par un canal
  externe (e-mail, etc. — non automatisé par l'application, volontairement : voir mission).
- L'archivage dans le bucket privé `reports` est _facultatif_ et n'est pas encore câblé dans
  l'interface de cette version (le bucket et ses politiques existent — voir
  `docs/SUPABASE_SETUP.md` §9 — mais l'upload depuis `AdminSubmissionDetailPage` reste à
  brancher : `supabase.storage.from('reports').upload(...)` après génération, si souhaité).

### Zone sensible

- **Anonymiser ce candidat** : remplace nom/e-mail/téléphone/organisation/fonction/commentaire par
  des valeurs neutres et horodate `anonymized_at`. Action confirmée par une boîte de dialogue,
  irréversible. Les réponses brutes et le résultat de scoring restent inchangés (seule l'identité
  est effacée).
- La suppression complète d'un candidat (ligne `participants` + cascade sur `submissions` et
  tables liées) n'a pas d'action dédiée dans l'interface de cette version ; elle peut être
  réalisée depuis le SQL Editor Supabase (`delete from public.participants where id = '...'`) en
  toute sécurité grâce aux contraintes `on delete cascade` définies dans les migrations.

## Export CSV/JSON

Non encore implémenté dans cette version de l'interface (prévu par la mission comme fonctionnalité
du tableau de bord). Les données restent accessibles pour un export ponctuel via le SQL Editor
Supabase (`copy (select ...) to stdout with csv header`) en attendant son ajout.

## Statuts affichés

| Statut (`submissions.status`) | Signification                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submitted`                   | Réservé — dans cette version, une soumission passe directement à `calculated` (le scoring est synchrone à l'envoi), ce statut intermédiaire n'apparaît donc pas en pratique. |
| `calculated`                  | Résultat calculé et disponible.                                                                                                                                              |
| `error`                       | Réservé pour un futur pipeline asynchrone.                                                                                                                                   |
| `anonymized`                  | Réservé — l'anonymisation actuelle porte sur `participants`, pas encore sur `submissions.status`.                                                                            |

Ces statuts réservés sont documentés pour cohérence avec le schéma de la mission ; leur usage
complet (transitions asynchrones) est un développement futur, pas une fonctionnalité manquante de
la version actuelle qui fonctionne entièrement de façon synchrone.
