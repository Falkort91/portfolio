# Transition "ligne de balayage" entre sections — Design

**Date** : 2026-08-31 (révisé le même jour — voir "Révision" ci-dessous)
**Statut** : validé par l'utilisateur (approches + prototype live), en attente de relecture de cette spec avant passage au plan d'implémentation.

## Révision — sections toujours superposées (pas de flux normal entre les transitions)

Une première implémentation (Tâches 1-6 d'un premier plan) gardait chaque section dans le
flux normal du document, avec seulement une bande de ~140vh entre deux sections adjacentes
épinglée pour l'effet de transition. Testée en réel, cette approche ne correspond pas à ce
qui a été validé dans le prototype : l'utilisateur s'attend à ce que **les sections soient
en permanence superposées dans une seule scène épinglée**, une seule visible à la fois, et
que ce soit la ligne de balayage qui fasse apparaître/disparaître la section suivante — pas
un simple flux de page normal avec de courtes bandes de transition entre deux portions de
défilement classique.

Cette section de révision remplace donc "Structure par paire de sections" ci-dessous par
"Structure globale (scène unique)", et met à jour en conséquence "Capture du contenu" et
"Composants et fichiers concernés". Le reste de la spec (mécanique de coupure, bande
glitch, ligne "détecteur de bruit", intégration nav/useScrollReveal) est inchangé.

## Contexte et objectif

Aujourd'hui, la page d'accueil (`app/pages/index.vue`) empile 5 sections (`HeroSection`, `AboutSection`, `SkillsGrid`, `ProjectsSection`, `ContactSection`) dans le flux normal du document, chacune avec un fade-in individuel de ses éléments (`useScrollReveal`, GSAP ScrollTrigger, sélecteur `[data-reveal]`).

L'objectif : remplacer ce flux normal (desktop uniquement) par une transition scroll-scrubbée entre chaque paire de sections adjacentes, où une **ligne de balayage lumineuse** traverse l'écran de haut en bas au fil du scroll et constitue la **vraie coupure** entre la section sortante (visible en dessous de la ligne) et la section entrante (visible au-dessus). Autour de la ligne, une fine bande décorative "glitch" (fragments de pixels réels + glyphes clignotants) habille la coupure. La ligne elle-même se comporte comme un **détecteur de bruit** : plate au repos, elle se déforme en onde bruitée proportionnellement à la vitesse de scroll, et se relisse en douceur (pas de coupure nette) quand le scroll ralentit ou s'arrête.

Ce document consolide les décisions prises pendant le brainstorming, y compris via un prototype fonctionnel testé en direct (capture DOM réelle via html2canvas, mécanique de coupure, comportement de la ligne).

## Périmètre

- **Sections concernées** : les 5 sections de la page d'accueil, dans l'ordre actuel — soit 4 zones de transition (Hero→About, About→Skills, Skills→Projects, Projects→Contact).
- **Desktop uniquement** (`≥ 768px`, breakpoint `md` déjà utilisé partout ailleurs sur le site). En dessous de ce seuil, comportement actuel inchangé : flux normal, `useScrollReveal` tel quel.
- **`prefers-reduced-motion: reduce`** : comportement actuel inchangé, quel que soit la largeur d'écran.
- Les autres pages (`/projects/[slug]`) ne sont pas concernées.

## Approche retenue (validée face à l'alternative écartée)

Deux approches ont été comparées :

- **A — pluie numérique en overlay** (canvas décoratif, contenu jamais capturé) : plus simple/robuste, mais rendu jugé moins convaincant.
- **B — capture DOM réelle (html2canvas) + coupure nette** : retenue après test live sur un prototype (voir historique de conversation) — le rendu correspond exactement à ce qui était demandé, et les mesures en direct (temps de capture, ms/frame) n'ont montré aucun problème de performance sur la machine de test.

## Mécanique détaillée

### Structure globale (scène unique)

Une seule scène pour toute la page :

- Un unique conteneur de scroll ("spacer") dimensionné pour couvrir tout le parcours ; à
  l'intérieur, une scène en `position: sticky; top: 0; height: 100vh; overflow: hidden`
  reste épinglée du début à la fin de ce parcours.
- Les 5 sections sont **toutes montées en permanence** à l'intérieur de la scène, chacune en
  `position: absolute; inset: 0`. Une seule est pleinement opaque/active à la fois ; les
  autres sont masquées (`opacity: 0; pointer-events: none`) sauf les deux impliquées dans une
  transition en cours (gérées via le canvas de dissolution, pas en opacité directe).
- **Scroll interne simulé** : chaque section connaît sa propre hauteur de contenu naturelle
  `H_i` (mesurée via `scrollHeight` sur son wrapper interne). Si `H_i` dépasse la hauteur de
  la scène (`100vh`), un excédent `own_i = H_i - 100vh` existe : tant que la section *i* est
  active, une portion du scroll de la page lui est allouée pour translater verticalement son
  contenu interne (`translateY(-progress_i * own_i)`), simulant un défilement normal à
  l'intérieur de la scène. Si `H_i ≤ 100vh`, `own_i = 0`, aucune translation.
- **Temps de présence minimum** : chaque section reçoit aussi une distance de scroll "de
  lecture" même si elle tient déjà dans un écran (`own_i = 0`), pour laisser le temps de la
  parcourir avant que la transition suivante ne commence — valeur à calibrer en
  implémentation (ordre de grandeur : une fraction d'écran de scroll, ex. 50vh).
- Le parcours total du spacer est donc la somme, pour les 5 sections, de leur distance
  "active" (`max(own_i, dwell_i)`), plus 4 distances de transition (une entre chaque paire
  adjacente, ordre de grandeur validé dans le prototype : ~100-140vh chacune).
- La progression globale `p` (0→1 sur tout le spacer) est traduite en : quelle section est
  actuellement active (et sa translation interne le cas échéant), ou si on est dans une des 4
  fenêtres de transition (et alors `t`, la progression normalisée 0→1 *dans cette fenêtre*,
  pilote la coupure comme décrit ci-dessous).

### La coupure (clip-path — la vraie limite visuelle)

- `lineY = t * hauteurScène` (t = progression normalisée dans la fenêtre de transition, 0→1).
- `A.style.clipPath = inset(lineY px 0 0 0)` → *A* visible uniquement **en dessous** de la ligne.
- `B.style.clipPath = inset(0 0 (hauteur - lineY) px 0)` → *B* visible uniquement **au-dessus** de la ligne.
- **Point critique (bug identifié et corrigé pendant le prototypage)** : ce clip ne doit jamais être décalé par la largeur de la bande décorative — la coupure réelle et la ligne dessinée doivent coïncider exactement, sous peine de laisser l'ancienne section déborder visuellement au-dessus de la ligne.

### La bande décorative ("glitch band")

- Bande fixe d'environ 46px de hauteur, centrée sur `lineY`, dessinée sur un `<canvas>` superposé (purement décoratif, ne modifie jamais la coupure ci-dessus).
- Composée de fines tranches horizontales (~5px), chacune échantillonnée aléatoirement dans l'image capturée de *A* ou de *B*, avec un léger décalage horizontal (jitter) et une opacité variable.
- Des glyphes monospace isolés (vert accent) clignotent par-dessus, à une fréquence qui suit l'intensité de bruit (voir ci-dessous).

### La ligne comme "détecteur de bruit"

- Vitesse de scroll instantanée (`Δscrolltop / Δt`, lissée) → intensité de bruit cible (0-1), avec une courbe qui la rend sensible dès les vitesses moyennes (pas besoin d'un scroll extrême pour voir une différence).
- L'intensité **monte vite** (scroll qui accélère) et **redescend lentement** (scroll qui ralentit/s'arrête) — taux de montée/descente asymétriques, jamais de saut instantané à plat.
- Rendu de la ligne : une onde lente (somme de sinus à plusieurs fréquences/phases) dont l'amplitude est proportionnelle à l'intensité, plus un grain haute fréquence (bruit aléatoire par frame) qui n'apparaît qu'à intensité élevée — à faible vitesse la ligne ondule doucement, à vitesse élevée elle devient franchement perturbée.
- Le jitter et la fréquence des glyphes de la bande décorative suivent la même intensité, pour une cohérence visuelle bruit-ligne / bruit-bande.
- La ligne dessinée peut légèrement déborder de part et d'autre de la coupure réelle du fait de son ondulation — c'est voulu (elle "suit" la coupure sans jamais la déplacer, la coupure elle-même reste toujours plate/exacte).

### Réversibilité

Tout est piloté par la progression de scroll (`p`), sans état interne ni déclenchement à sens unique : remonter dans la page rejoue la transition à l'envers exactement, y compris l'intensité de bruit qui redescend en douceur.

## Capture du contenu (html2canvas)

- **Nouvelle dépendance** : `html2canvas` (utilisée et testée dans le prototype, version `1.4.1` validée).
- Chaque section possède un wrapper interne fixe (`height: 100vh; overflow: hidden`) qui
  contient son contenu (potentiellement translaté, voir scroll interne simulé ci-dessus). Ce
  wrapper est ce qui est capturé — comme il est toujours limité à `100vh` par `overflow:
  hidden`, la capture ne contient jamais que ce qui est effectivement visible au moment de la
  capture, translation interne comprise. Plus besoin d'une étape de recadrage séparée après
  capture (contrairement à la première implémentation).
- Au moment d'entrer dans une fenêtre de transition (section *A* → *B*), les wrappers de *A*
  et *B* sont capturés **une seule fois** chacun (pas à chaque frame de scroll) et le résultat
  mis en cache pour la durée de cette traversée ; le rendu par frame ne fait que dessiner des
  sous-rectangles de ces images déjà capturées (peu coûteux).
- **Pas de cache persistant entre deux traversées** : contrairement à la version précédente
  de cette spec (qui proposait un cache invalidé sur changement de thème/langue), la capture
  se fait à chaque nouvelle entrée dans une fenêtre de transition, jamais réutilisée d'une
  traversée à l'autre. Plus simple, et garantit que le thème et la langue affichés sont
  toujours à jour sans logique d'invalidation dédiée — le coût (quelques centaines de ms de
  `html2canvas`, mesuré dans le prototype) n'est payé qu'au moment où l'utilisateur
  traverse réellement une transition, pas en continu.

## Intégration avec la navigation par ancre

- Les liens actuels (`AppHeader.vue` : `#about`, `#skills`, `#projects`, `#contact` ; `HeroSection.vue` : `#projects` ; pages projet : `/#projects`) restent des `<a href="#id">` classiques dans le HTML (accessibilité, fallback no-JS, comportement mobile/reduced-motion inchangé).
- Sur desktop avec le système de transition actif, un gestionnaire de clic intercepte la navigation et calcule la position de scroll correspondant à la section **pleinement assemblée** (fin de sa zone de transition, jamais un état intermédiaire), puis y scrolle.

## Interaction avec `useScrollReveal`

- Sur desktop avec le système de dissolution actif, le fade-in interne actuel (`[data-reveal]` par section) devient redondant : la section entière est déjà "révélée" par le passage de la ligne. `useScrollReveal` est désactivé dans ce contexte pour ces sections.
- Sur mobile/tablette et en `prefers-reduced-motion: reduce`, `useScrollReveal` continue de fonctionner exactement comme aujourd'hui (aucun changement de ce composable lui-même — juste une condition d'activation supplémentaire au niveau de l'appelant).

## Composants et fichiers concernés (aperçu, détail dans le plan d'implémentation)

- `app/utils/sectionCapture.ts`, `app/utils/scrollNoise.ts`, `app/composables/useDissolveEnabled.ts` : déjà implémentés (première passe), réutilisés tels quels, aucun changement.
- Un nouveau composant orchestrateur unique (ex. `DissolveStage.vue`) remplace le composant
  `SectionTransitionZone.vue` de la première passe (qui gérait une paire à la fois) : il
  monte les 5 sections en permanence dans la scène unique décrite ci-dessus, calcule la
  progression globale, gère le scroll interne simulé par section, et pilote le canvas de
  coupure/bande glitch/ligne bruitée pendant les 4 fenêtres de transition.
- `app/pages/index.vue` : restructuré pour déléguer entièrement à ce nouveau composant sur
  desktop, avec fallback vers l'empilement actuel en flux normal (mobile/reduced-motion) —
  `SectionTransitionZone.vue` et son usage dans `index.vue` sont retirés.
- `app/components/layout/AppHeader.vue`, `app/components/home/HeroSection.vue`, pages `projects/[slug].vue` : gestion de clic sur les ancres pour cibler la section demandée dans la nouvelle scène unique.
- `app/composables/useScrollReveal.ts` : inchangé par rapport à la première passe (le paramètre `enabled` existe déjà).
- `package.json` : `html2canvas` déjà ajouté.

## Hors périmètre

- Pages autres que la page d'accueil.
- Personnalisation de l'effet par section (même mécanique pour les 4 transitions).
- Support de navigateurs sans `ResizeObserver`/Canvas 2D (déjà couverts par le reste du site, pas de contrainte supplémentaire identifiée).

## Points de vigilance pour le plan d'implémentation

- Calibrage exact des distances (`dwell_i` par section, durée des 4 fenêtres de transition), à ajuster en conditions réelles (contenu plus long que dans le prototype, notamment `ProjectsSection`).
- Mesure fiable de `H_i` (hauteur naturelle du contenu de chaque section) : doit être mesurée une fois montée normalement (avant d'appliquer `overflow: hidden`/translation), et recalculée au redimensionnement de fenêtre.
- Comportement au redimensionnement de fenêtre : recalcul de `H_i`/`own_i` pour les 5 sections, recapture à la prochaine traversée.
- Vérifier qu'aucun horizontal-scroll ne réapparaît avec ce nouveau système (leçon du bug déjà rencontré sur `AboutSection`, voir `min-w-0` / grilles `fr`).
- Tester le focus clavier (tab order) à travers les sections empilées en `position: absolute` — attention en particulier aux sections masquées (`opacity: 0`) qui ne doivent pas être atteignables au clavier tant qu'elles ne sont pas actives (`inert` ou équivalent).
- La section précédemment utilisée (`SectionTransitionZone.vue`, capture par paire depuis des sections en flux normal) doit être supprimée avec la nouvelle implémentation, pas laissée en code mort.
