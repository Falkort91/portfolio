# Contenu à personnaliser avant mise en ligne

Ce fichier liste tout ce que le plan d'implémentation a volontairement laissé en placeholder — le code est fonctionnel, mais ce contenu est personnel et ne pouvait pas être inventé.

## Textes (i18n)

- `i18n/locales/fr.json` et `i18n/locales/en.json` :
  - `projects.questy.challenges` → ajuster les défis techniques si tu veux en mettre d'autres en avant.

## Données (`app/data/`)

- `app/data/projects.ts` : `featuredProjects[].images` est vide pour Toryu — une fois des captures d'écran déposées dans `public/images/projects/toryu/`, ajouter leurs chemins ici. Questy a désormais son set complet (hero, dashboard, profil, activités, classement).
- `app/data/projects.ts` : nouveau champ optionnel `videos` (tableau `{ webm, mp4 }`, boucles silencieuses courtes) pour illustrer des interactions. La première vidéo remplace le hero statique sur la carte ; toutes s'ajoutent en tête de galerie sur la page détail. Questy a `fight` (combat tour par tour) et `quizz` (défi IA). Toryu n'en a pas encore.
- `app/data/projects.ts` : `demoUrl` reste `null` pour Toryu (projet en développement, pas encore de démo). Questy est réhébergé et a désormais son `demoUrl` renseigné.
- `app/data/projects.ts` : `featuredProjects[0]` (Toryu) a `repoUrls: []` — repos privés tant que le projet est en développement. À remplir si les repos passent publics.

## Déploiement

Ce projet n'a pas (et n'aura pas) de dépôt git — le déploiement se fait via la **CLI Vercel** en local, pas via un import GitHub.

**Fait :** site en ligne sur **https://portfolio-loic-leclercq.vercel.app** (projet `falkort91s-projects/portfolio-loic-leclercq`). `NUXT_PUBLIC_FORMSPREE_ENDPOINT` configurée en production sur Vercel. `site.url`, `i18n.baseUrl` et `robots.txt` pointent vers la vraie URL.

Pour redéployer après modification : `vercel --prod` depuis la racine du projet (preview simple : `vercel` sans `--prod`).
