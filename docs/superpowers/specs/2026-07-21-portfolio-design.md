# Portfolio personnel — Design

**Date** : 2026-07-21
**Statut** : Validé, en attente de revue finale avant passage au plan d'implémentation

## Objectif

Portfolio vitrine pour décrocher un premier emploi (CDI/CDD) en tant que développeur full-stack junior, à la sortie des études. Doit être rapide à consulter pour un recruteur (30s de scan) tout en donnant accès à du contenu approfondi pour qui veut creuser (page détail projet).

## Stack technique

- **Nuxt 3** (TypeScript), mode **SSR** (SEO)
- **Tailwind CSS** — classes utilitaires, classes custom ciblées quand nécessaire (ex: keyframes glitch)
- **GSAP** — animations (entrée, scroll, glitch/néon complexes)
- **@nuxtjs/i18n** — bilingue FR/EN avec toggle
- **@nuxt/image** — optimisation images
- Formulaire de contact via **Formspree** (pas de backend à maintenir)
- Déploiement **Vercel**, sous-domaine gratuit (`*.vercel.app`)

Pas de backend NestJS pour ce site — c'est un site vitrine pur frontend.

## Identité visuelle

**Thème "Glitch Terminal" cyberpunk**, choisi pour rester professionnel et lisible par défaut (recruteurs souvent non-techniques, scan rapide) tout en assumant une identité tech forte via les micro-interactions.

- **Dark mode** (thème phare) : fond noir/anthracite quasi uni, texte clair, accents vert phosphorescent/cyan/magenta réservés aux éléments interactifs (liens, boutons, bordures, titres au survol). Pas d'animation lourde en continu sur le fond.
- **Light mode** : variante sobre équivalente, garde la même identité (accents, structure) sur fond clair. Toggle sauvegardé en `localStorage` ; dark forcé par défaut tant qu'aucun choix n'est stocké (ignore `prefers-color-scheme`).
- **Effets signature** : glitch RGB-split discret au survol des titres/liens, léger scan-line en fond (dark uniquement), curseur clignotant façon terminal, glow sur les éléments interactifs.
- **Hero** : animation machine à écrire (typewriter) sur le nom/titre.
- Contraste AA respecté en permanence — les accents vifs ne sont jamais le seul support d'une information textuelle principale.

## Langue

Bilingue FR/EN via toggle dans le header. Détection de la langue navigateur par défaut, override manuel possible et persistant.

## Structure des pages

### Page d'accueil (`/`) — one-page avec ancres

1. **Hero** — nom, titre, animation typewriter, CTA "Voir mes projets", bouton téléchargement CV (PDF)
2. **À propos** — photo perso, texte de présentation, **frise chronologique du parcours** (études → stage → TFE) qui contextualise où chaque compétence a été acquise
3. **Compétences** — grille unique de badges (logo + nom), pas de duplication par catégorie études/stage
4. **Projets** — carte mise en avant pour Questy (TFE) avec lien vers page détail ; cartes compactes pour Todolist et Contactlist (description courte, stack, lien GitHub direct, pas de page dédiée)
5. **Contact** — formulaire (Formspree) + liens LinkedIn/GitHub

**Header fixe** (toutes pages) : nom/logo, nav ancres, toggle dark/light, toggle FR/EN, bouton CV.

### Page détail projet (`/projects/questy`)

Case study complet :
- Contexte : projet de fin d'études (TFE), plateforme de gamification/apprentissage — quiz, défis, tournois, classements, avatars, profils, panel admin
- Stack détaillée avec justification des choix
- Captures d'écran (à fournir)
- Défis techniques rencontrés et solutions apportées (à rédiger)
- Lien démo : affiché comme "bientôt disponible" tant que le backend n'est pas réhébergé (sous-projet séparé, hors scope de ce spec) ; liens vers les repos GitHub (`questy-api`, `questy-web`) actifs immédiatement

## Contenu — Compétences

Grille unique, badges logo + nom (pas de tooltip-only, pour rester lisible sur mobile sans interaction) :

- **Langages** : TypeScript, JavaScript, PHP, HTML, CSS
- **Backend** : NestJS, TypeORM, Laravel
- **Frontend** : Nuxt 3, Vue 3, Pinia, Tailwind CSS, Vite
- **Bases de données** : PostgreSQL, MySQL
- **Auth/Sécurité** : JWT, Passport
- **Tests** : Jest
- **IA** : API Google Gemini
- **Outils** : Git/GitHub, Docker, VS Code, Postman, Thunder Client, Figma
- **Déploiement** : Vercel

La distinction "vu en cours" vs "vu en stage/TFE" est portée par la **frise chronologique** de la section À propos, pas par la grille de compétences elle-même (évite les doublons visuels, ex: Tailwind vu aux deux endroits).

## Projets secondaires

**Todolist** (repo `TODOLIST-VUECLI-MOCKAPI`) et **Contactlist** (repo `CONTACT_LIST_VUEJS`) : cartes compactes sur la page d'accueil, sans page dédiée — titre, description courte, stack, lien GitHub.

## Formulaire de contact & robustesse

- Champs : nom, email, message. Validation côté client (requis, format email).
- Envoi via Formspree, retour visuel de succès/erreur en style terminal (ex: `> Message envoyé ✓`).
- Si le service est indisponible : message d'erreur clair + fallback `mailto:`.

## SEO & Performance

- Meta tags par page via `useSeoMeta` (title, description, OG image), sitemap généré automatiquement.
- Images optimisées via `@nuxt/image`, lazy-loading des sections hors écran.
- Animations GSAP déclenchées à l'entrée dans le viewport (`ScrollTrigger`), pas de charge inutile au premier rendu.

## Hors scope (sous-projet séparé)

Le réhébergement du backend NestJS (`questy-api`) sur une solution d'hébergement gratuite/pérenne est un chantier distinct, à traiter dans une session dédiée après la mise en ligne du portfolio. En attendant, la page projet Questy affiche le code source et une description détaillée, sans démo live.
