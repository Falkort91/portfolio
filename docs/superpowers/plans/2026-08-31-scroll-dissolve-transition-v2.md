# Transition "ligne de balayage" — scène unique (révision) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le système de transition par paire de sections (première passe, `SectionTransitionZone.vue`, jugé insuffisant en test réel — les sections restaient en flux normal entre deux courtes bandes de transition) par une **scène unique** où les 5 sections sont en permanence superposées et épinglées, une seule visible à la fois, avec scroll interne simulé pour les sections plus hautes qu'un écran.

**Architecture:** Un unique composant `DissolveStage.vue` monte les 5 sections en permanence dans une scène `position: sticky; height: 100vh; overflow: hidden`. La progression de scroll globale détermine soit "section X pleinement active" (avec translation interne simulant le scroll si son contenu dépasse un écran), soit "transition entre section X et X+1 en cours" (coupure nette via `clip-path` sur les éléments réels — jamais capturés à l'aveugle, donc pas de souci de timing de capture — plus une bande décorative dessinée sur canvas à partir d'images `html2canvas`, utilisées uniquement pour l'habillage visuel, jamais pour la coupure elle-même). La navigation par ancre est interceptée globalement par ce composant.

**Tech Stack:** Nuxt 4 / Vue 3 / TypeScript, `html2canvas` (déjà installé), Canvas 2D natif, vanilla `requestAnimationFrame`.

**Spec:** `docs/superpowers/specs/2026-08-31-scroll-dissolve-transition-design.md` (voir section "Révision" en tête de document)

## Global Constraints

- Actif uniquement `>= 768px` (breakpoint `md`) ET `prefers-reduced-motion` non activé — géré par le parent (`app/pages/index.vue`) via `useDissolveEnabled` (déjà implémenté, inchangé).
- Couleur de la ligne/des glyphes : `#00ff8c`.
- La coupure visuelle (quelle section est montrée où) se fait via `clip-path` sur les éléments réels, **jamais** via les images capturées — les captures ne servent qu'à la bande décorative.
- Chaque paire de sections n'est capturée qu'une fois par entrée dans sa fenêtre de transition (jamais par frame de scroll), et le cache de capture est propre à la paire courante (pas de persistance entre deux traversées différentes).
- Les sections non actives doivent être `inert` (non focusables au clavier).
- Chaque étape de code TypeScript/Vue se termine par `npx eslint .` et `npx vitest run` (et `npx vue-tsc --noEmit -p tsconfig.json` quand des fichiers `.vue`/`.ts` sont touchés) propres.
- Ce projet n'a pas de dépôt git — aucune commande git, aucun commit, à aucune étape.

---

## Task R1 : Utilitaire pur de calcul de mise en page de la scène

**Files:**
- Create: `app/utils/scrollStageLayout.ts`
- Test: `tests/utils/scrollStageLayout.spec.ts`

**Interfaces:**
- Produces : `ownScrollFor(contentHeight: number, stageHeight: number): number`, `computeStageLayout(contentHeights: number[], stageHeight: number, dwellRatio: number, transitionRatio: number): StageLayout`, `findStageSegment(layout: StageLayout, scrolled: number): { segment: StageSegment, t: number }`, types `StageSegment` (`{ kind: 'active' | 'transition', index: number, start: number, length: number }`) et `StageLayout` (`{ segments: StageSegment[], totalLength: number }`) — seront utilisées par `DissolveStage.vue` (Task R2, pas à créer maintenant).

- [ ] **Step 1: Write the failing tests**

```ts
// tests/utils/scrollStageLayout.spec.ts
import { describe, expect, it } from 'vitest'
import { computeStageLayout, findStageSegment, ownScrollFor } from '../../app/utils/scrollStageLayout'

describe('ownScrollFor', () => {
  it('returns 0 when content fits within the stage', () => {
    expect(ownScrollFor(800, 900)).toBe(0)
  })

  it('returns the excess height when content is taller than the stage', () => {
    expect(ownScrollFor(1500, 900)).toBe(600)
  })
})

describe('computeStageLayout', () => {
  it('builds alternating active/transition segments for N sections', () => {
    const layout = computeStageLayout([900, 900, 900], 900, 0.5, 1.2)

    expect(layout.segments.map((s) => s.kind)).toEqual([
      'active', 'transition', 'active', 'transition', 'active',
    ])
  })

  it('active segment length is at least the dwell distance even when content fits', () => {
    const layout = computeStageLayout([900], 900, 0.5, 1.2)

    expect(layout.segments[0].length).toBe(450)
  })

  it('active segment length grows to match own-scroll for tall content', () => {
    const layout = computeStageLayout([1800], 900, 0.5, 1.2)

    expect(layout.segments[0].length).toBe(900)
  })

  it('transition segments use the transition ratio', () => {
    const layout = computeStageLayout([900, 900], 900, 0.5, 1.2)
    const transition = layout.segments.find((s) => s.kind === 'transition')

    expect(transition?.length).toBe(1080)
  })

  it('totalLength equals the sum of all segment lengths', () => {
    const layout = computeStageLayout([900, 1800, 900], 900, 0.5, 1.2)
    const sum = layout.segments.reduce((acc, s) => acc + s.length, 0)

    expect(layout.totalLength).toBe(sum)
  })
})

describe('findStageSegment', () => {
  const layout = computeStageLayout([900, 900], 900, 0.5, 1.2)
  // segments: active(0) 0-450, transition(0) 450-1530, active(1) 1530-1980

  it('finds the first active segment at the very start', () => {
    const { segment, t } = findStageSegment(layout, 0)

    expect(segment.kind).toBe('active')
    expect(segment.index).toBe(0)
    expect(t).toBe(0)
  })

  it('finds the transition segment mid-way through it, with correct local progress', () => {
    const { segment, t } = findStageSegment(layout, 450 + 540)

    expect(segment.kind).toBe('transition')
    expect(segment.index).toBe(0)
    expect(t).toBeCloseTo(0.5)
  })

  it('finds the last active segment at the very end, clamped to t=1', () => {
    const { segment, t } = findStageSegment(layout, 999999)

    expect(segment.kind).toBe('active')
    expect(segment.index).toBe(1)
    expect(t).toBe(1)
  })

  it('clamps negative scroll positions to the start', () => {
    const { segment, t } = findStageSegment(layout, -500)

    expect(segment.kind).toBe('active')
    expect(segment.index).toBe(0)
    expect(t).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd C:\Labo\Perso\Portfolio && npx vitest run tests/utils/scrollStageLayout.spec.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/utils/scrollStageLayout.ts
export interface StageSegment {
  kind: 'active' | 'transition'
  index: number
  start: number
  length: number
}

export interface StageLayout {
  segments: StageSegment[]
  totalLength: number
}

export function ownScrollFor(contentHeight: number, stageHeight: number): number {
  return Math.max(0, contentHeight - stageHeight)
}

export function computeStageLayout(
  contentHeights: number[],
  stageHeight: number,
  dwellRatio: number,
  transitionRatio: number,
): StageLayout {
  const segments: StageSegment[] = []
  let cursor = 0
  const dwellPx = stageHeight * dwellRatio
  const transitionPx = stageHeight * transitionRatio

  for (let i = 0; i < contentHeights.length; i++) {
    const own = ownScrollFor(contentHeights[i], stageHeight)
    const length = Math.max(own, dwellPx)
    segments.push({ kind: 'active', index: i, start: cursor, length })
    cursor += length

    if (i < contentHeights.length - 1) {
      segments.push({ kind: 'transition', index: i, start: cursor, length: transitionPx })
      cursor += transitionPx
    }
  }

  return { segments, totalLength: cursor }
}

export function findStageSegment(layout: StageLayout, scrolled: number): { segment: StageSegment, t: number } {
  const clamped = Math.max(0, Math.min(scrolled, layout.totalLength))

  for (const segment of layout.segments) {
    if (clamped < segment.start + segment.length) {
      const t = segment.length > 0 ? (clamped - segment.start) / segment.length : 1
      return { segment, t: Math.max(0, Math.min(1, t)) }
    }
  }

  const last = layout.segments[layout.segments.length - 1]
  return { segment: last, t: 1 }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd C:\Labo\Perso\Portfolio && npx vitest run tests/utils/scrollStageLayout.spec.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Lint**

Run: `cd C:\Labo\Perso\Portfolio && npx eslint app/utils/scrollStageLayout.ts tests/utils/scrollStageLayout.spec.ts`
Expected: pas d'erreur.

---

## Task R2 : Composant `DissolveStage.vue`

**Files:**
- Create: `app/components/home/DissolveStage.vue`

**Interfaces:**
- Consumes : `captureElement` (`app/utils/sectionCapture.ts`, existant), `createScrollNoiseTracker` (`app/utils/scrollNoise.ts`, existant), `computeStageLayout`/`findStageSegment`/`ownScrollFor`/`StageLayout` (`app/utils/scrollStageLayout.ts`, Task R1).
- Consomme les 5 composants de section existants (`HeroSection`, `AboutSection`, `SkillsGrid`, `ProjectsSection`, `ContactSection`) — auto-importés par Nuxt depuis `app/components/home/`, référencés directement par leur nom de balise, sans import explicite (comme partout ailleurs dans ce projet).
- Produces : aucune prop, aucun événement. Rendu uniquement quand monté (le parent `app/pages/index.vue`, Task R3, contrôle le montage via `v-if="dissolveEnabled"`).

Pas de test unitaire dédié (même situation que l'ancien `SectionTransitionZone.vue` : pilote `requestAnimationFrame`, un contexte Canvas 2D réel, et le DOM des 5 sections — la logique pure testable a été extraite dans `scrollStageLayout.ts`, Task R1). Vérification manuelle au navigateur en Task R4.

- [ ] **Step 1: Créer le composant**

Transcris ce code exactement tel quel dans `app/components/home/DissolveStage.vue` :

```vue
<!-- app/components/home/DissolveStage.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { captureElement } from '~/utils/sectionCapture'
import { createScrollNoiseTracker } from '~/utils/scrollNoise'
import { computeStageLayout, findStageSegment, ownScrollFor } from '~/utils/scrollStageLayout'
import type { StageLayout } from '~/utils/scrollStageLayout'

const SECTION_COUNT = 5
// Fraction de la hauteur de scène allouée "de lecture" minimum par section, même si son
// contenu tient déjà dans un écran.
const DWELL_RATIO = 0.5
// Fraction de la hauteur de scène allouée à chaque fenêtre de transition entre deux sections.
const TRANSITION_RATIO = 1.2
const BAND = 46 // hauteur (px CSS) de la bande "glitch" autour de la ligne
const SLIVER_H = 5 // hauteur d'une tranche glitch individuelle
const GLYPHS = '01ｱｲｳｴｵｶｷｸｹｺAZERTYQSDF#$%&'
const LINE_COLOR = '#00ff8c'
const ANCHOR_TO_INDEX: Record<string, number> = {
  top: 0,
  about: 1,
  skills: 2,
  projects: 3,
  contact: 4,
}

const root = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const spacerHeight = ref(0)

const windowEls: (HTMLElement | null)[] = Array(SECTION_COUNT).fill(null)
const contentEls: (HTMLElement | null)[] = Array(SECTION_COUNT).fill(null)

function setWindowRef(i: number, el: Element | null) {
  windowEls[i] = el as HTMLElement | null
}
function setContentRef(i: number, el: Element | null) {
  contentEls[i] = el as HTMLElement | null
}

let ctx: CanvasRenderingContext2D | null = null
let dpr = 1
let stageW = 0
let stageH = 0
let layout: StageLayout = { segments: [], totalLength: 0 }
const ownScrollArr: number[] = Array(SECTION_COUNT).fill(0)

let capturedFrom: HTMLCanvasElement | null = null
let capturedTo: HTMLCanvasElement | null = null
let capturedPairKey: string | null = null
let isCapturing = false

const noiseTracker = createScrollNoiseTracker()
let noiseIntensity = 0
let noiseTime = 0
let rafId = 0
let lastFrame = 0

function computeLayout() {
  stageW = window.innerWidth
  stageH = window.innerHeight
  const heights = contentEls.map((el) => (el ? el.scrollHeight : stageH))
  for (let i = 0; i < SECTION_COUNT; i++) {
    ownScrollArr[i] = ownScrollFor(heights[i], stageH)
  }
  layout = computeStageLayout(heights, stageH, DWELL_RATIO, TRANSITION_RATIO)
  spacerHeight.value = layout.totalLength + stageH

  if (canvasEl.value) {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvasEl.value.width = stageW * dpr
    canvasEl.value.height = stageH * dpr
    canvasEl.value.style.width = `${stageW}px`
    canvasEl.value.style.height = `${stageH}px`
  }

  // La mise en page a pu changer : on invalide le cache de capture en cours.
  capturedPairKey = null
  capturedFrom = null
  capturedTo = null
}

function setInert(i: number, isInert: boolean) {
  const el = windowEls[i]
  if (!el) return
  if (isInert) el.setAttribute('inert', '')
  else el.removeAttribute('inert')
}

function applyActive(index: number, t: number) {
  for (let i = 0; i < SECTION_COUNT; i++) {
    const el = windowEls[i]
    if (!el) continue
    el.style.zIndex = i === index ? '2' : '1'
    el.style.clipPath = 'none'
    setInert(i, i !== index)
  }
  const content = contentEls[index]
  if (content) {
    content.style.transform = `translateY(${-t * ownScrollArr[index]}px)`
  }
  if (ctx && canvasEl.value) ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
}

async function ensureCaptured(fromIndex: number, toIndex: number) {
  const key = `${fromIndex}-${toIndex}`
  if (capturedPairKey === key || isCapturing) return
  isCapturing = true
  capturedPairKey = key
  const fromEl = windowEls[fromIndex]
  const toEl = windowEls[toIndex]
  if (!fromEl || !toEl) {
    isCapturing = false
    return
  }
  const [fromImg, toImg] = await Promise.all([captureElement(fromEl), captureElement(toEl)])
  // Vérifie qu'on est toujours sur la même paire (l'utilisateur n'a pas déjà changé de zone
  // pendant l'attente asynchrone de la capture).
  if (capturedPairKey === key) {
    capturedFrom = fromImg
    capturedTo = toImg
  }
  isCapturing = false
}

function waveOffset(x: number): number {
  const wave =
    Math.sin(x * 0.045 + noiseTime * 0.006) * 0.5 +
    Math.sin(x * 0.11 - noiseTime * 0.011) * 0.3 +
    Math.sin(x * 0.23 + noiseTime * 0.021) * 0.2
  const grain = (Math.random() - 0.5) * noiseIntensity * 0.9
  return wave + grain
}

// Purement décoratif : ne dessine que la bande autour de la ligne et la ligne elle-même.
// La vraie coupure (quelle section est visible où) est gérée par clip-path dans
// applyTransition, jamais ici.
function drawGlitchBand(lineY: number) {
  if (!ctx || !canvasEl.value) return
  ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
  if (!capturedFrom || !capturedTo) return

  const top = Math.max(0, lineY - BAND / 2)
  const bottom = Math.min(stageH, lineY + BAND / 2)
  const jitterAmp = 4 + noiseIntensity * 18
  const glyphChance = 0.08 + noiseIntensity * 0.55

  for (let y = top; y < bottom; y += SLIVER_H) {
    const jitter = (Math.random() - 0.5) * jitterAmp
    const srcImg = Math.random() < 0.5 ? capturedFrom : capturedTo
    ctx.save()
    ctx.globalAlpha = 0.55 + Math.random() * 0.35
    ctx.drawImage(
      srcImg,
      0, y * dpr, srcImg.width, SLIVER_H * dpr,
      jitter * dpr, y * dpr, stageW * dpr, SLIVER_H * dpr,
    )
    ctx.restore()

    if (Math.random() < glyphChance) {
      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.fillStyle = LINE_COLOR
      ctx.font = `${12 * dpr}px monospace`
      ctx.fillText(
        GLYPHS[(Math.random() * GLYPHS.length) | 0]!,
        Math.random() * stageW * dpr,
        y * dpr + SLIVER_H * dpr,
      )
      ctx.restore()
    }
  }

  const amp = noiseIntensity * 26
  ctx.save()
  ctx.shadowColor = LINE_COLOR
  ctx.shadowBlur = 18 * dpr
  ctx.strokeStyle = LINE_COLOR
  ctx.lineWidth = 2 * dpr
  ctx.beginPath()
  const segments = 64
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * stageW
    const y2 = lineY + waveOffset(x) * amp
    if (i === 0) ctx.moveTo(x * dpr, y2 * dpr)
    else ctx.lineTo(x * dpr, y2 * dpr)
  }
  ctx.stroke()
  ctx.restore()
}

function applyTransition(fromIndex: number, toIndex: number, t: number) {
  const lineY = t * stageH
  for (let i = 0; i < SECTION_COUNT; i++) {
    const el = windowEls[i]
    if (!el) continue
    if (i === fromIndex) {
      el.style.zIndex = '2'
      el.style.clipPath = `inset(${lineY}px 0 0 0)`
      setInert(i, false)
    } else if (i === toIndex) {
      el.style.zIndex = '2'
      el.style.clipPath = `inset(0 0 ${Math.max(0, stageH - lineY)}px 0)`
      setInert(i, false)
    } else {
      el.style.zIndex = '1'
      el.style.clipPath = 'none'
      setInert(i, true)
    }
  }
  void ensureCaptured(fromIndex, toIndex)
  drawGlitchBand(lineY)
}

function progressScrolled(): number {
  if (!root.value) return 0
  const rect = root.value.getBoundingClientRect()
  return Math.max(0, -rect.top)
}

function loop(now: number) {
  const frameMs = now - lastFrame
  lastFrame = now
  noiseIntensity = noiseTracker.update(window.scrollY, frameMs)
  noiseTime += frameMs

  const scrolled = progressScrolled()
  const { segment, t } = findStageSegment(layout, scrolled)

  if (segment.kind === 'active') {
    applyActive(segment.index, t)
  } else {
    applyTransition(segment.index, segment.index + 1, t)
  }

  rafId = requestAnimationFrame(loop)
}

function scrollToSection(index: number, smooth = true) {
  if (!root.value) return
  const segment = layout.segments.find((s) => s.kind === 'active' && s.index === index)
  if (!segment) return
  const targetY = root.value.offsetTop + segment.start
  window.scrollTo({ top: targetY, behavior: smooth ? 'smooth' : 'auto' })
}

function handleDocumentClick(e: MouseEvent) {
  const target = (e.target as HTMLElement | null)?.closest('a[href^="#"]')
  if (!target) return
  const hash = target.getAttribute('href')?.slice(1)
  if (!hash || !(hash in ANCHOR_TO_INDEX)) return
  e.preventDefault()
  scrollToSection(ANCHOR_TO_INDEX[hash])
}

function handleResize() {
  computeLayout()
}

onMounted(() => {
  if (canvasEl.value) ctx = canvasEl.value.getContext('2d')
  computeLayout()
  lastFrame = performance.now()
  rafId = requestAnimationFrame(loop)
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleDocumentClick)

  const initialHash = window.location.hash.slice(1)
  if (initialHash in ANCHOR_TO_INDEX) {
    scrollToSection(ANCHOR_TO_INDEX[initialHash], false)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div ref="root" :style="{ height: `${spacerHeight}px` }" class="relative">
    <div class="sticky top-0 h-screen overflow-hidden">
      <div :ref="(el) => setWindowRef(0, el)" class="absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(0, el)">
          <HeroSection />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(1, el)" class="absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(1, el)">
          <AboutSection />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(2, el)" class="absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(2, el)">
          <SkillsGrid />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(3, el)" class="absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(3, el)">
          <ProjectsSection />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(4, el)" class="absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(4, el)">
          <ContactSection />
        </div>
      </div>
      <canvas ref="canvasEl" class="pointer-events-none absolute inset-0" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Typecheck**

Run: `cd C:\Labo\Perso\Portfolio && npx vue-tsc --noEmit -p tsconfig.json`
Expected: pas de nouvelle erreur (le warning pré-existant `vue-router/volar/sfc-route-blocks` est normal, exit code 0).

- [ ] **Step 3: Lint**

Run: `cd C:\Labo\Perso\Portfolio && npx eslint app/components/home/DissolveStage.vue`
Expected: pas d'erreur.

---

## Task R3 : Câbler `DissolveStage` dans `index.vue` et retirer l'ancien système

**Files:**
- Modify: `app/pages/index.vue`
- Delete: `app/components/home/SectionTransitionZone.vue`
- Modify: `app/components/home/HeroSection.vue`, `app/components/home/AboutSection.vue`, `app/components/home/SkillsGrid.vue`, `app/components/home/ProjectsSection.vue`, `app/components/home/ContactSection.vue` (retirer `defineExpose` — plus nécessaire, `DissolveStage.vue` n'a plus besoin de refs individuelles vers chaque section)

**Interfaces:**
- Consumes : `useDissolveEnabled` (existant), `DissolveStage` (Task R2, auto-importé par Nuxt).

- [ ] **Step 1: Retirer `defineExpose` des 5 sections**

Dans chacun de `app/components/home/HeroSection.vue`, `AboutSection.vue`, `SkillsGrid.vue`, `ProjectsSection.vue`, `ContactSection.vue` : lis le fichier, retire uniquement la ligne `defineExpose({ el: sectionRef })` (et la ligne vide qui la précède si elle isole ce bloc). Ne touche à rien d'autre dans ces fichiers — `sectionRef`, `ref="sectionRef"`, `useScrollReveal(sectionRef, ...)` restent tels quels (toujours utilisés par le fallback mobile/reduced-motion, en flux normal).

- [ ] **Step 2: Mettre à jour `index.vue`**

Remplace tout le contenu de `app/pages/index.vue` par :

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'

const { t } = useI18n()
const { enabled: dissolveEnabled } = useDissolveEnabled()

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDescription'),
})
</script>

<template>
  <div>
    <DissolveStage v-if="dissolveEnabled" />
    <template v-else>
      <HeroSection />
      <AboutSection />
      <SkillsGrid />
      <ProjectsSection />
      <ContactSection />
    </template>
  </div>
</template>
```

- [ ] **Step 3: Supprimer l'ancien composant**

Supprime le fichier `app/components/home/SectionTransitionZone.vue` (remplacé par `DissolveStage.vue`, plus utilisé nulle part).

- [ ] **Step 4: Typecheck**

Run: `cd C:\Labo\Perso\Portfolio && npx vue-tsc --noEmit -p tsconfig.json`
Expected: pas de nouvelle erreur.

- [ ] **Step 5: Lint**

Run: `cd C:\Labo\Perso\Portfolio && npx eslint .`
Expected: pas d'erreur.

- [ ] **Step 6: Run full test suite**

Run: `cd C:\Labo\Perso\Portfolio && npx vitest run`
Expected: PASS (tous les tests existants — aucun test ne référence `SectionTransitionZone` ni `defineExpose`, donc rien ne devrait casser).

---

## Task R4 : Vérification manuelle (superposition, scroll interne, navigation par ancre)

**Files:**
- Potentially modify: `app/assets/css/main.css` (uniquement si un écart de navigation par ancre est constaté, voir Step 4)

Pas de nouveau code par défaut — cette tâche vérifie au navigateur que la scène unique fonctionne comme prévu : sections réellement superposées (pas de flux normal visible entre elles), scroll interne simulé pour une section plus haute qu'un écran, navigation par ancre correcte, fallback mobile/reduced-motion inchangé.

## Important : ne touche jamais un serveur de dev déjà lancé par l'utilisateur

L'utilisateur a très probablement déjà `npm run dev` qui tourne sur le port 3000 dans son propre terminal. Ne le tue jamais, ne l'utilise jamais pour tes tests. Lance TA PROPRE instance isolée (`cd C:\Labo\Perso\Portfolio && (npm run dev > "%TEMP%\nuxt-r4-verify.log" 2>&1 &)` ou équivalent PowerShell en arrière-plan), attends la ligne `Local:` dans le log (le port peut différer de 3000 s'il est occupé). À la fin, arrête UNIQUEMENT ton instance (retrouve son PID via le port qu'elle a réellement utilisé), jamais un process sur le port 3000.

## Outils navigateur

Les outils `mcp__claude-in-chrome__*` sont différés — charge-les en un seul appel `ToolSearch` (query: `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__resize_window`) avant de les utiliser, puis `tabs_context_mcp` avec `createIfEmpty: true`. Si l'extension Chrome n'est pas connectée, n'insiste pas : arrête ton instance de dev et retourne BLOCKED avec le message d'erreur exact.

- [ ] **Step 1: Lancer ta propre instance de dev isolée et ouvrir la page**

Redimensionne la fenêtre à au moins 1280x900 (`resize_window`) pour être au-dessus du breakpoint desktop.

- [ ] **Step 2: Vérifier la superposition et le scroll interne**

Scroller lentement depuis le tout début de la page. Prends des captures d'écran régulières et confirme :
- Au chargement, seule la section Hero est visible, plein écran.
- En continuant à scroller, la ligne verte apparaît et balaie l'écran, la section suivante (À propos) prend sa place — **aucun moment où on voit un défilement de page classique entre les deux** (pas de saut, pas de contenu qui glisse verticalement de façon continue comme une page normale en dehors des fenêtres de transition).
- Si "Projets" contient plus de contenu qu'un écran (regarde son rendu) : pendant qu'elle est la section active, continuer à scroller doit faire défiler SON PROPRE contenu à l'intérieur de la scène (le contenu bouge, mais aucune autre section n'apparaît) avant que la transition vers "Contact" ne démarre.
- Aucune barre de défilement horizontale : via `javascript_tool`, `document.documentElement.scrollWidth - document.documentElement.clientWidth` doit valoir `0`.
- La ligne se comporte comme un détecteur de bruit (calme en scroll lent, perturbée en scroll rapide, se relisse à l'arrêt) — comme dans la version précédente déjà validée.

- [ ] **Step 3: Vérifier qu'on peut remonter (réversibilité)**

Après être arrivé sur "Contact", scroller vers le haut : les transitions doivent se rejouer à l'envers correctement jusqu'à revenir sur Hero, sans état incohérent (section qui reste bloquée, ligne qui ne réapparaît pas, etc.).

- [ ] **Step 4: Vérifier la navigation par ancre**

Depuis Hero, clique sur chaque lien du header ("À propos", "Compétences", "Projets", "Contact") et le bouton "Voir mes projets". Pour chacun, confirme que la page atterrit directement sur la section demandée, **pleinement assemblée** (pas en cours de transition), sans avoir à re-scroller manuellement à travers les sections intermédiaires.

**Seulement si un écart est constaté** (atterrissage au mauvais endroit) : inspecte `scrollToSection` dans `DissolveStage.vue` plutôt que de modifier le CSS — le calcul `root.value.offsetTop + segment.start` est la source de vérité, un correctif CSS (`scroll-margin-top`) n'aurait aucun effet ici puisque le scroll est piloté entièrement en JS (`window.scrollTo`), pas par positionnement natif d'ancre. Documente l'écart précis dans ton rapport plutôt que de deviner un correctif.

- [ ] **Step 5: Vérifier le fallback mobile/reduced-motion**

Redimensionne sous 768px (`resize_window`, ex. 600x900), recharge : la page doit afficher les 5 sections en flux normal classique (comportement d'avant tout ce plan), sans scène épinglée.

- [ ] **Step 6: Vérifier le focus clavier et `inert`**

À largeur desktop, depuis le haut, envoie plusieurs `Tab`. Vérifie via `javascript_tool` (`document.activeElement`) que le focus ne quitte jamais la section actuellement visible pour atterrir sur un élément d'une section masquée (cachée par `inert`).

- [ ] **Step 7: Arrêter ton instance de dev isolée**

Retrouve le PID sur TON port et arrête-le. Confirme qu'un éventuel serveur de l'utilisateur sur le port 3000 répond toujours (`curl` ou équivalent) si tu ne l'as pas touché.

## Report contract

Write your full report to: describe tes observations pour chaque step (2 à 6), avec les chemins des captures d'écran prises.

In your final chat message, return ONLY:
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Files touched (exact paths, or "none")
- Ce que tu as observé pour chaque step 2-6 (une ligne chacune)
- Concerns (if any) — y compris tout ce qui semble visuellement incorrect même si tu ne l'as pas corrigé

---

## Self-Review Summary

- **Couverture de la spec révisée** : scène unique (Task R2) · scroll interne simulé (Task R2, `applyActive`) · coupure via `clip-path` live, jamais via les images capturées (Task R2, `applyTransition`) · captures html2canvas non persistantes entre traversées (Task R2, `ensureCaptured`/`capturedPairKey`) · navigation par ancre + hash initial (Task R2, `handleDocumentClick`/`scrollToSection`) · `inert` sur sections masquées (Task R2, `setInert`) · retrait de l'ancien système (Task R3) · vérification complète (Task R4).
- **Placeholders** : aucun — code complet à chaque étape ; Task R4 est une vérification manuelle avec une consigne explicite de ne pas deviner de correctif non vérifié.
- **Cohérence des types/noms** : `computeStageLayout`/`findStageSegment`/`ownScrollFor`/`StageLayout`/`StageSegment` (Task R1) → utilisés tels quels dans Task R2. `captureElement` (existant, Task 1 du premier plan) et `createScrollNoiseTracker` (existant, Task 2 du premier plan) → réutilisés sans changement. `DissolveStage` (Task R2) → utilisé tel quel dans `index.vue` (Task R3).
