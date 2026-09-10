# Transition "ligne de balayage" entre sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer, sur desktop et sans `prefers-reduced-motion`, l'empilement statique des 5 sections de la page d'accueil par une transition scroll-scrubbée : une ligne de balayage lumineuse (comportement de "détecteur de bruit" piloté par la vitesse de scroll) traverse l'écran et constitue la coupure réelle entre la section sortante et la section entrante, avec une bande décorative de pixels/glyphes autour d'elle.

**Architecture:** Chaque section reste un `<section>` normal dans le flux du document (hauteur naturelle, `useScrollReveal` inchangé pour le Hero). Entre deux sections adjacentes, un composant `SectionTransitionZone` s'insère : il occupe une hauteur de scroll dédiée (140vh), se pin en `position: sticky`, capture une fois (au premier passage) la section précédente et la section suivante via `html2canvas`, puis dessine sur un `<canvas>` la coupure nette (clip par rectangle canvas, pas de DOM dupliqué) + la bande glitch + la ligne bruitée. Une fois la zone franchie, elle se libère et le flux normal continue dans la section suivante — ce qui gère nativement les sections plus hautes qu'un écran (Projets, Contact) sans logique supplémentaire.

**Tech Stack:** Nuxt 4 / Vue 3 / TypeScript, Tailwind CSS, `html2canvas` (nouvelle dépendance, version validée `1.4.1`), Canvas 2D natif (pas de GSAP pour ce système — vanilla `requestAnimationFrame`, cohérent avec le prototype validé). Tests unitaires Vitest pour la logique pure (composables/utils), pas de test dédié pour le rendu canvas (aucun composable visuel existant du projet n'en a — `useScrollReveal` n'en a pas non plus).

**Spec:** `docs/superpowers/specs/2026-08-31-scroll-dissolve-transition-design.md`

## Global Constraints

- Actif uniquement `≥ 768px` (breakpoint `md`, cohérent avec le reste du site) ET `prefers-reduced-motion` non activé. Sinon : comportement actuel inchangé à l'identique.
- Couleur de la ligne/des glyphes : `#00ff8c` (== `--color-accent-green` en thème sombre — le thème est forcé sombre par défaut sur ce site).
- La coupure visuelle (quelle image est montrée où) ne doit jamais être décalée par la largeur de la bande décorative — bug déjà rencontré et corrigé pendant le prototypage, à ne pas réintroduire.
- Chaque section n'est capturée qu'une fois par entrée dans une zone de transition (jamais par frame de scroll).
- Chaque étape de code TypeScript/Vue se termine par `npx eslint .` et `npx vitest run` propres (mêmes commandes utilisées tout au long de ce projet) avant de passer à l'étape suivante.

---

## Task 1: Utilitaire de capture de section (`html2canvas`)

**Files:**
- Modify: `package.json` (nouvelle dépendance)
- Create: `app/utils/sectionCapture.ts`
- Test: `tests/utils/sectionCapture.spec.ts`

**Interfaces:**
- Produces: `captureElement(el: HTMLElement): Promise<HTMLCanvasElement>` — utilisée par `SectionTransitionZone.vue` (Task 4).

- [ ] **Step 1: Installer `html2canvas`**

Run: `npm install html2canvas@1.4.1`

- [ ] **Step 2: Write the failing test**

```ts
// tests/utils/sectionCapture.spec.ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue('fake-canvas'),
}))

import html2canvas from 'html2canvas'
import { captureElement } from '../../app/utils/sectionCapture'

describe('captureElement', () => {
  it('calls html2canvas with a transparent background and no logging', async () => {
    const el = document.createElement('div')

    const result = await captureElement(el)

    expect(html2canvas).toHaveBeenCalledWith(el, expect.objectContaining({
      backgroundColor: null,
      logging: false,
    }))
    expect(result).toBe('fake-canvas')
  })

  it('caps the capture scale at 2x even on higher-DPR displays', async () => {
    const originalDpr = window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true })

    await captureElement(document.createElement('div'))

    expect(html2canvas).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ scale: 2 }))
    Object.defineProperty(window, 'devicePixelRatio', { value: originalDpr, configurable: true })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/utils/sectionCapture.spec.ts`
Expected: FAIL — `app/utils/sectionCapture.ts` n'existe pas encore.

- [ ] **Step 4: Write minimal implementation**

```ts
// app/utils/sectionCapture.ts
import html2canvas from 'html2canvas'

export async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  return html2canvas(el, {
    backgroundColor: null,
    scale: dpr,
    logging: false,
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/utils/sectionCapture.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Lint**

Run: `npx eslint app/utils/sectionCapture.ts tests/utils/sectionCapture.spec.ts`
Expected: pas d'erreur.

---

## Task 2: Utilitaire "détecteur de bruit" (vitesse de scroll → intensité)

**Files:**
- Create: `app/utils/scrollNoise.ts`
- Test: `tests/utils/scrollNoise.spec.ts`

**Interfaces:**
- Produces: `createScrollNoiseTracker(initialScrollY?: number): { update(scrollY: number, frameMs: number): number }` — utilisée par `SectionTransitionZone.vue` (Task 4). `update()` retourne l'intensité courante (0-1).

- [ ] **Step 1: Write the failing test**

```ts
// tests/utils/scrollNoise.spec.ts
import { describe, expect, it } from 'vitest'
import { createScrollNoiseTracker } from '../../app/utils/scrollNoise'

describe('createScrollNoiseTracker', () => {
  it('starts at zero intensity with no movement', () => {
    const tracker = createScrollNoiseTracker(0)

    const intensity = tracker.update(0, 16)

    expect(intensity).toBe(0)
  })

  it('ramps up intensity when scrolling fast', () => {
    const tracker = createScrollNoiseTracker(0)
    let intensity = 0
    let scrollY = 0

    for (let i = 0; i < 20; i++) {
      scrollY += 50 // scroll rapide : 50px toutes les 16ms
      intensity = tracker.update(scrollY, 16)
    }

    expect(intensity).toBeGreaterThan(0.5)
  })

  it('decays gradually (not instantly) once scrolling stops', () => {
    const tracker = createScrollNoiseTracker(0)
    let scrollY = 0
    let intensity = 0

    for (let i = 0; i < 20; i++) {
      scrollY += 50
      intensity = tracker.update(scrollY, 16)
    }
    const intensityAtStop = intensity

    intensity = tracker.update(scrollY, 16) // même position : le scroll s'est arrêté

    expect(intensity).toBeLessThan(intensityAtStop)
    expect(intensity).toBeGreaterThan(intensityAtStop * 0.5)
  })

  it('eventually settles back near zero after scrolling stops', () => {
    const tracker = createScrollNoiseTracker(0)
    let scrollY = 0
    let intensity = 0

    for (let i = 0; i < 20; i++) {
      scrollY += 50
      intensity = tracker.update(scrollY, 16)
    }
    for (let i = 0; i < 200; i++) {
      intensity = tracker.update(scrollY, 16)
    }

    expect(intensity).toBeLessThan(0.01)
  })

  it('responds proportionally to slower scroll speeds', () => {
    const fastTracker = createScrollNoiseTracker(0)
    const slowTracker = createScrollNoiseTracker(0)
    let fastY = 0, slowY = 0
    let fastIntensity = 0, slowIntensity = 0

    for (let i = 0; i < 20; i++) {
      fastY += 50
      slowY += 5
      fastIntensity = fastTracker.update(fastY, 16)
      slowIntensity = slowTracker.update(slowY, 16)
    }

    expect(slowIntensity).toBeGreaterThan(0)
    expect(slowIntensity).toBeLessThan(fastIntensity)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils/scrollNoise.spec.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/utils/scrollNoise.ts
export interface ScrollNoiseTracker {
  update: (scrollY: number, frameMs: number) => number
}

const VELOCITY_SCALE = 3.2 // px/ms de scroll pour atteindre l'intensité max
const RISE_RATE = 0.45
const FALL_RATE = 0.03
const VELOCITY_SMOOTHING = 0.5
const INTENSITY_CURVE = 0.65 // < 1 : sensible dès les vitesses moyennes

export function createScrollNoiseTracker(initialScrollY = 0): ScrollNoiseTracker {
  let lastScrollY = initialScrollY
  let velocity = 0
  let intensity = 0

  function update(scrollY: number, frameMs: number): number {
    const dy = Math.abs(scrollY - lastScrollY)
    lastScrollY = scrollY
    const instantVelocity = frameMs > 0 ? dy / frameMs : 0
    velocity += (instantVelocity - velocity) * VELOCITY_SMOOTHING

    const raw = Math.max(0, Math.min(1, velocity / VELOCITY_SCALE))
    const target = Math.pow(raw, INTENSITY_CURVE)
    const rate = target > intensity ? RISE_RATE : FALL_RATE
    intensity += (target - intensity) * rate

    return intensity
  }

  return { update }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/utils/scrollNoise.spec.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Lint**

Run: `npx eslint app/utils/scrollNoise.ts tests/utils/scrollNoise.spec.ts`
Expected: pas d'erreur.

- [ ] **Step 6: Commit**

Pas de dépôt git sur ce projet (voir CLAUDE.md utilisateur) — ignorer cette étape partout dans ce plan.

---

## Task 3: Composable `useDissolveEnabled`

**Files:**
- Create: `app/composables/useDissolveEnabled.ts`
- Test: `tests/composables/useDissolveEnabled.spec.ts`

**Interfaces:**
- Consumes: rien (lit `window.matchMedia`).
- Produces: `useDissolveEnabled(): { enabled: Ref<boolean> }` — utilisée par `app/pages/index.vue` (Task 5) et par les 4 sections concernées (Task 6).

- [ ] **Step 1: Write the failing test**

```ts
// tests/composables/useDissolveEnabled.spec.ts
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDissolveEnabled } from '../../app/composables/useDissolveEnabled'

function stubMatchMedia(isDesktop: boolean, prefersReducedMotion: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? prefersReducedMotion : isDesktop,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
}

function mountHook() {
  let result: ReturnType<typeof useDissolveEnabled> | undefined
  const TestComponent = defineComponent({
    setup() {
      result = useDissolveEnabled()
      return () => h('div')
    },
  })
  mount(TestComponent)
  return result!
}

describe('useDissolveEnabled', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is enabled on desktop without reduced motion', () => {
    stubMatchMedia(true, false)

    const { enabled } = mountHook()

    expect(enabled.value).toBe(true)
  })

  it('is disabled under the desktop breakpoint', () => {
    stubMatchMedia(false, false)

    const { enabled } = mountHook()

    expect(enabled.value).toBe(false)
  })

  it('is disabled when the user prefers reduced motion, even on desktop', () => {
    stubMatchMedia(true, true)

    const { enabled } = mountHook()

    expect(enabled.value).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useDissolveEnabled.spec.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/composables/useDissolveEnabled.ts
import { onMounted, ref } from 'vue'

export function useDissolveEnabled() {
  const enabled = ref(false)
  const desktopQuery = '(min-width: 768px)'
  const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

  function evaluate() {
    const isDesktop = window.matchMedia(desktopQuery).matches
    const reducedMotion = window.matchMedia(reducedMotionQuery).matches
    enabled.value = isDesktop && !reducedMotion
  }

  onMounted(() => {
    evaluate()
    window.matchMedia(desktopQuery).addEventListener('change', evaluate)
    window.matchMedia(reducedMotionQuery).addEventListener('change', evaluate)
  })

  return { enabled }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useDissolveEnabled.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Lint**

Run: `npx eslint app/composables/useDissolveEnabled.ts tests/composables/useDissolveEnabled.spec.ts`
Expected: pas d'erreur.

---

## Task 4: Composant `SectionTransitionZone.vue`

**Files:**
- Create: `app/components/home/SectionTransitionZone.vue`

**Interfaces:**
- Consumes: `captureElement` (Task 1), `createScrollNoiseTracker` (Task 2).
- Consumes props: `fromSection: HTMLElement | null`, `toSection: HTMLElement | null` (fournis par `index.vue`, Task 5).
- Produces: aucun événement — purement visuel. Rendu uniquement quand monté (le parent contrôle le montage via `v-if="enabled"`, Task 5).

Pas de test unitaire dédié pour ce composant : il pilote `requestAnimationFrame`, `getBoundingClientRect` et un contexte Canvas 2D réel, dans la même situation que `useScrollReveal.ts` (GSAP/ScrollTrigger) qui n'a pas non plus de test dédié dans ce projet — la vérification se fait manuellement au navigateur (Task 7).

- [ ] **Step 1: Créer le composant**

```vue
<!-- app/components/home/SectionTransitionZone.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { captureElement } from '~/utils/sectionCapture'
import { createScrollNoiseTracker } from '~/utils/scrollNoise'

const props = defineProps<{
  fromSection: HTMLElement | null
  toSection: HTMLElement | null
}>()

const ZONE_VH = 140 // hauteur de scroll (vh) de la zone de transition
const BAND = 46 // hauteur (px CSS) de la bande "glitch" autour de la ligne
const SLIVER_H = 5 // hauteur d'une tranche glitch individuelle
const GLYPHS = '01ｱｲｳｴｵｶｷｸｹｺAZERTYQSDF#$%&'
const LINE_COLOR = '#00ff8c'

const root = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let dpr = 1
let stageW = 0
let stageH = 0
let capturedFrom: HTMLCanvasElement | null = null
let capturedTo: HTMLCanvasElement | null = null
let hasCaptured = false
let isCapturing = false
let rafId = 0
let lastFrame = 0
const noiseTracker = createScrollNoiseTracker()
let noiseIntensity = 0
let noiseTime = 0

function sizeCanvas() {
  if (!root.value || !canvasEl.value) return
  const rect = root.value.getBoundingClientRect()
  stageW = rect.width
  stageH = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasEl.value.width = stageW * dpr
  canvasEl.value.height = stageH * dpr
  canvasEl.value.style.width = `${stageW}px`
  canvasEl.value.style.height = `${stageH}px`
}

// Ne garde que le "dernier écran" de from (ancré en bas) et le "premier écran"
// de to (ancré en haut) : simplifie tout le rendu en aval (plus besoin de savoir
// que la section source peut être plus haute qu'un viewport).
function cropToViewport(img: HTMLCanvasElement, anchor: 'top' | 'bottom'): HTMLCanvasElement {
  const targetW = stageW * dpr
  const targetH = stageH * dpr
  const scale = targetW / img.width
  const sourceSliceH = Math.min(img.height, targetH / scale)
  const sourceY = anchor === 'bottom' ? img.height - sourceSliceH : 0
  const drawH = sourceSliceH * scale
  const drawY = anchor === 'bottom' ? targetH - drawH : 0

  const out = document.createElement('canvas')
  out.width = targetW
  out.height = targetH
  const outCtx = out.getContext('2d')
  if (!outCtx) return out
  outCtx.drawImage(img, 0, sourceY, img.width, sourceSliceH, 0, drawY, targetW, drawH)
  return out
}

async function ensureCaptured() {
  if (hasCaptured || isCapturing || !props.fromSection || !props.toSection) return
  isCapturing = true
  const [fromFull, toFull] = await Promise.all([
    captureElement(props.fromSection),
    captureElement(props.toSection),
  ])
  capturedFrom = cropToViewport(fromFull, 'bottom')
  capturedTo = cropToViewport(toFull, 'top')
  hasCaptured = true
  isCapturing = false
}

function progress(): number {
  if (!root.value) return 0
  const rect = root.value.getBoundingClientRect()
  const total = root.value.offsetHeight - window.innerHeight
  if (total <= 0) return rect.top <= 0 ? 1 : 0
  return Math.max(0, Math.min(1, -rect.top / total))
}

function waveOffset(x: number): number {
  const wave =
    Math.sin(x * 0.045 + noiseTime * 0.006) * 0.5 +
    Math.sin(x * 0.11 - noiseTime * 0.011) * 0.3 +
    Math.sin(x * 0.23 + noiseTime * 0.021) * 0.2
  const grain = (Math.random() - 0.5) * noiseIntensity * 0.9
  return wave + grain
}

function drawGlitchBand(lineY: number) {
  if (!ctx || !capturedFrom || !capturedTo) return
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
        GLYPHS[(Math.random() * GLYPHS.length) | 0],
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

function drawFrame(p: number) {
  if (!ctx || !canvasEl.value || !capturedFrom || !capturedTo) return
  ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)

  const lineY = p * stageH

  // La ligne EST la vraie coupure : from seulement en dessous, to seulement au-dessus.
  // La bande glitch dessinée ensuite est purement décorative, par-dessus.
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, lineY * dpr, canvasEl.value.width, canvasEl.value.height - lineY * dpr)
  ctx.clip()
  ctx.drawImage(capturedFrom, 0, 0)
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, canvasEl.value.width, lineY * dpr)
  ctx.clip()
  ctx.drawImage(capturedTo, 0, 0)
  ctx.restore()

  drawGlitchBand(lineY)
}

function loop(now: number) {
  const frameMs = now - lastFrame
  lastFrame = now
  noiseIntensity = noiseTracker.update(window.scrollY, frameMs)
  noiseTime += frameMs

  const p = progress()

  if (p > 0 && p < 1) {
    void ensureCaptured()
  }

  if (ctx && canvasEl.value) {
    if (p <= 0 || p >= 1 || !hasCaptured) {
      ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
    } else {
      drawFrame(p)
    }
  }

  rafId = requestAnimationFrame(loop)
}

function handleResize() {
  sizeCanvas()
  // La mise en page a pu changer : on invalide pour recapturer à la prochaine entrée.
  hasCaptured = false
  capturedFrom = null
  capturedTo = null
}

onMounted(() => {
  if (canvasEl.value) ctx = canvasEl.value.getContext('2d')
  sizeCanvas()
  lastFrame = performance.now()
  rafId = requestAnimationFrame(loop)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div ref="root" :style="{ height: `${ZONE_VH}vh` }" class="relative">
    <div class="sticky top-0 h-screen overflow-hidden">
      <canvas ref="canvasEl" class="pointer-events-none absolute inset-0" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Typecheck**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: pas de nouvelle erreur (le warning pré-existant `vue-router/volar/sfc-route-blocks` est normal, déjà présent avant ce projet).

- [ ] **Step 3: Lint**

Run: `npx eslint app/components/home/SectionTransitionZone.vue`
Expected: pas d'erreur.

---

## Task 5: Intégrer `SectionTransitionZone` dans `index.vue`

**Files:**
- Modify: `app/pages/index.vue`

**Interfaces:**
- Consumes: `useDissolveEnabled` (Task 3), `SectionTransitionZone` (Task 4). Chaque section (`HeroSection`, `AboutSection`, `SkillsGrid`, `ProjectsSection`, `ContactSection`) doit exposer son élément racine — voir Step 1.

- [ ] **Step 1: Exposer l'élément racine de chaque section**

Chaque composant de section (`app/components/home/HeroSection.vue`, `AboutSection.vue`, `SkillsGrid.vue`, `ProjectsSection.vue`, `ContactSection.vue`) utilise déjà un `ref` nommé `sectionRef` passé à `useScrollReveal`. Ajouter `defineExpose` à la fin du `<script setup>` de chacun (juste avant la fermeture, après l'appel à `useScrollReveal`) :

```ts
defineExpose({ el: sectionRef })
```

- [ ] **Step 2: Mettre à jour `index.vue`**

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'

const { t } = useI18n()
const { enabled: dissolveEnabled } = useDissolveEnabled()

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDescription'),
})

interface SectionExposed { el: HTMLElement | null }

const heroRef = ref<SectionExposed | null>(null)
const aboutRef = ref<SectionExposed | null>(null)
const skillsRef = ref<SectionExposed | null>(null)
const projectsRef = ref<SectionExposed | null>(null)
const contactRef = ref<SectionExposed | null>(null)
</script>

<template>
  <div>
    <HeroSection ref="heroRef" />
    <SectionTransitionZone
      v-if="dissolveEnabled"
      :from-section="heroRef?.el ?? null"
      :to-section="aboutRef?.el ?? null"
    />

    <AboutSection ref="aboutRef" />
    <SectionTransitionZone
      v-if="dissolveEnabled"
      :from-section="aboutRef?.el ?? null"
      :to-section="skillsRef?.el ?? null"
    />

    <SkillsGrid ref="skillsRef" />
    <SectionTransitionZone
      v-if="dissolveEnabled"
      :from-section="skillsRef?.el ?? null"
      :to-section="projectsRef?.el ?? null"
    />

    <ProjectsSection ref="projectsRef" />
    <SectionTransitionZone
      v-if="dissolveEnabled"
      :from-section="projectsRef?.el ?? null"
      :to-section="contactRef?.el ?? null"
    />

    <ContactSection ref="contactRef" />
  </div>
</template>
```

- [ ] **Step 3: Typecheck**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: pas de nouvelle erreur.

- [ ] **Step 4: Lint**

Run: `npx eslint app/pages/index.vue app/components/home/HeroSection.vue app/components/home/AboutSection.vue app/components/home/SkillsGrid.vue app/components/home/ProjectsSection.vue app/components/home/ContactSection.vue`
Expected: pas d'erreur.

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: PASS (tous les tests existants + ceux des tasks 1-3).

---

## Task 6: Désactiver le fade-in individuel (`useScrollReveal`) quand la dissolution est active

**Files:**
- Modify: `app/composables/useScrollReveal.ts`
- Modify: `app/components/home/AboutSection.vue`, `app/components/home/SkillsGrid.vue`, `app/components/home/ProjectsSection.vue`, `app/components/home/ContactSection.vue`
- Test: `tests/composables/useScrollReveal.spec.ts` (existant, à étendre)

**Interfaces:**
- `useScrollReveal(container: Ref<HTMLElement | null>, enabled?: Ref<boolean>)` — `enabled` optionnel, défaut `true`. Si `false` au montage, aucune animation n'est enregistrée (même court-circuit que le `prefers-reduced-motion` déjà existant).

`HeroSection.vue` n'est pas concerné (aucune transition n'arrive dessus, elle reste toujours révélée par son propre fade-in) et n'est pas modifié dans cette task.

- [ ] **Step 1: Étendre le test existant (cas qui doit encore échouer)**

Ajouter à la fin de `tests/composables/useScrollReveal.spec.ts` (avant la dernière accolade fermante du `describe`) :

```ts
  it('does nothing when enabled is explicitly false', async () => {
    const { defineComponent, h, ref } = await import('vue')
    const { mount } = await import('@vue/test-utils')
    const container = document.createElement('div')
    container.innerHTML = '<div data-reveal></div>'
    document.body.appendChild(container)

    const TestComponent = defineComponent({
      setup() {
        const sectionRef = ref<HTMLElement | null>(container)
        const enabled = ref(false)
        useScrollReveal(sectionRef, enabled)
        return () => h('div')
      },
    })

    // Ne doit pas lever d'exception et ne doit pas enregistrer d'animation GSAP.
    expect(() => mount(TestComponent)).not.toThrow()
    document.body.removeChild(container)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useScrollReveal.spec.ts`
Expected: FAIL — `useScrollReveal` n'accepte pas encore de second argument (erreur TypeScript à la compilation du test, ou le test passe "par accident" sans vérifier le bon comportement — dans les deux cas, passer à l'implémentation avant de continuer).

- [ ] **Step 3: Modifier `useScrollReveal.ts`**

```ts
// app/composables/useScrollReveal.ts
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(container: Ref<HTMLElement | null>, enabled: Ref<boolean> = ref(true)) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    if (!container.value) return
    if (!enabled.value) return
    // Si l'utilisateur préfère un mouvement réduit, on n'exécute pas .from() :
    // les éléments restent visibles tels quels dans le DOM (no-op sûr).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container.value,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
    }, container.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useScrollReveal.spec.ts`
Expected: PASS (tous les tests, y compris le nouveau).

- [ ] **Step 5: Câbler `enabled` dans les 4 sections concernées**

Dans chacun de `app/components/home/AboutSection.vue`, `SkillsGrid.vue`, `ProjectsSection.vue`, `ContactSection.vue`, modifier le haut du `<script setup>` :

```ts
const { enabled: dissolveEnabled } = useDissolveEnabled()
const sectionReady = computed(() => !dissolveEnabled.value)
useScrollReveal(sectionRef, sectionReady)
```

(remplace l'appel existant `useScrollReveal(sectionRef)`). Ajouter l'import :

```ts
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'
```

- [ ] **Step 6: Typecheck**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: pas de nouvelle erreur.

- [ ] **Step 7: Lint**

Run: `npx eslint .`
Expected: pas d'erreur.

- [ ] **Step 8: Run full test suite**

Run: `npx vitest run`
Expected: PASS.

---

## Task 7: Vérification manuelle (navigation par ancre + rendu) et ajustements

**Files:**
- Potentially modify: `app/assets/css/main.css` (uniquement si la vérification ci-dessous révèle un décalage)

Pas de nouveau code par défaut — cette task vérifie au navigateur que la fonctionnalité assemblée dans les tasks 1-6 se comporte comme prévu, et ne modifie du code que si un écart concret est constaté.

- [ ] **Step 1: Lancer le serveur de dev et ouvrir la page**

Run: `npm run dev`

Ouvrir `http://localhost:3000/` dans un navigateur large (≥ 1280px de large, thème sombre par défaut).

- [ ] **Step 2: Vérifier chaque transition**

Scroller lentement à travers chacune des 4 zones (Hero→About, About→Skills, Skills→Projects, Projects→Contact). Pour chacune, confirmer :
- La ligne balaie de haut en bas et suit le scroll (recule si on remonte).
- Aucune section ne déborde visiblement au-dessus de la ligne (le bug de coupure décalée ne doit pas être revenu).
- La ligne est plate/calme en scroll lent, se perturbe en scroll rapide, et se relisse en douceur à l'arrêt.
- Aucune barre de défilement horizontale n'apparaît (`document.documentElement.scrollWidth === document.documentElement.clientWidth` dans la console).

- [ ] **Step 3: Vérifier la navigation par ancre**

Cliquer sur chaque lien du header ("À propos", "Compétences", "Projets", "Contact") depuis le haut de la page, ainsi que le bouton "Voir mes projets" du Hero. Pour chacun :
- La page doit atterrir sur la section demandée **entièrement assemblée** (pas au milieu d'une zone de transition en cours de balayage).
- Si l'atterrissage tombe visiblement au milieu d'une zone de transition (à cause du header fixe `h-16` qui chevauche le haut de la section cible) : ajouter `scroll-margin-top: 4rem;` à la règle `.speech-bubble`... non — ajouter plutôt, dans `app/assets/css/main.css`, une règle générale :

```css
section[id] {
  scroll-margin-top: 4rem; /* hauteur du header fixe (h-16), évite qu'une ancre atterrisse sous le header */
}
```

N'ajouter cette règle que si l'écart est effectivement constaté à l'étape précédente.

- [ ] **Step 4: Vérifier le fallback mobile/reduced-motion**

Réduire la fenêtre sous 768px (ou activer "réduire les animations" dans les préférences système), recharger : la page doit redevenir un empilement normal avec le fade-in existant par section, identique au comportement d'avant ce plan.

- [ ] **Step 5: Vérifier le focus clavier**

Appuyer sur Tab depuis le haut de la page : l'ordre de focus doit suivre l'ordre naturel des sections (Hero → About → Compétences → Projets → Contact), sans saut ni élément inaccessible.

- [ ] **Step 6: Si des modifications ont été faites à l'étape 3, relancer la suite complète**

Run: `npx eslint . && npx vitest run`
Expected: PASS.

---

## Self-Review Summary

- **Couverture de la spec** : capture html2canvas (Task 1) · comportement "détecteur de bruit" (Task 2) · activation desktop + reduced-motion (Task 3) · coupure nette + bande glitch + ligne bruitée (Task 4) · intégration page + gestion des sections plus hautes qu'un écran via le flux normal entre les zones (Task 5) · désactivation du fade-in redondant (Task 6) · navigation par ancre + vérifications d'accessibilité (Task 7).
- **Placeholders** : aucun — chaque étape de code contient l'implémentation réelle ; la Task 7 est une vérification manuelle avec un correctif concret fourni, appliqué seulement si nécessaire (pattern standard : tester puis corriger).
- **Cohérence des types/noms** : `captureElement` (Task 1) → utilisé tel quel en Task 4. `createScrollNoiseTracker`/`update` (Task 2) → utilisé tel quel en Task 4. `useDissolveEnabled`/`enabled` (Task 3) → utilisé tel quel en Task 5 et Task 6. `SectionTransitionZone` props `from-section`/`to-section` (Task 4) → correspondent aux `:from-section`/`:to-section` de Task 5. `defineExpose({ el: sectionRef })` (Task 5, Step 1) → correspond à `SectionExposed { el: HTMLElement | null }` et `heroRef?.el` etc.
