<!-- app/components/home/DissolveStage.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { captureElement } from '~/utils/sectionCapture'
import { createScrollNoiseTracker } from '~/utils/scrollNoise'
import { computeStageLayout, findStageSegment, ownScrollFor } from '~/utils/scrollStageLayout'
import type { StageLayout } from '~/utils/scrollStageLayout'
import { SECTION_ACTIVE_EVENT } from '~/composables/useSectionActive'
import { useTheme } from '~/composables/useTheme'

const SECTION_COUNT = 5
// Fraction de la hauteur de scène allouée "de lecture" minimum par section, même si son
// contenu tient déjà dans un écran. Nul pour le Hero (index 0) : la transition démarre dès
// le premier pixel de scroll, sans zone morte. Un segment "actif" de longueur nulle n'est
// jamais sélectionné par findStageSegment (voir applyTransition, qui appelle
// notifySectionActive(fromIndex) pour compenser et garder le rejeu d'animation au retour
// fonctionnel malgré tout).
const DWELL_RATIOS = [0, 0.5, 0.5, 0.5, 0.5]
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
// Ordre inverse de ANCHOR_TO_INDEX : sert à retrouver la clé de section à notifier
// quand applyActive() change d'index (voir notifySectionActive).
const SECTION_KEYS = ['top', 'about', 'skills', 'projects', 'contact']

const root = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const spacerHeight = ref(0)

const windowEls: (HTMLElement | null)[] = Array(SECTION_COUNT).fill(null)
const contentEls: (HTMLElement | null)[] = Array(SECTION_COUNT).fill(null)

function setWindowRef(i: number, el: Element | ComponentPublicInstance | null) {
  windowEls[i] = el as HTMLElement | null
}
function setContentRef(i: number, el: Element | ComponentPublicInstance | null) {
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

function invalidateCapture() {
  capturedPairKey = null
  capturedFrom = null
  capturedTo = null
}

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
    ownScrollArr[i] = ownScrollFor(heights[i]!, stageH)
  }
  layout = computeStageLayout(heights, stageH, DWELL_RATIOS, TRANSITION_RATIO)
  spacerHeight.value = layout.totalLength + stageH

  if (canvasEl.value) {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvasEl.value.width = stageW * dpr
    canvasEl.value.height = stageH * dpr
    canvasEl.value.style.width = `${stageW}px`
    canvasEl.value.style.height = `${stageH}px`
  }

  // La mise en page a pu changer : on invalide le cache de capture en cours.
  invalidateCapture()
}

function setInert(i: number, isInert: boolean) {
  const el = windowEls[i]
  if (!el) return
  if (isInert) el.setAttribute('inert', '')
  else el.removeAttribute('inert')
}

// null au départ : la toute première activation (arrivée sur la page) ne doit pas
// déclencher de "retour sur la section" — seul un changement d'index ultérieur en est un.
let previousActiveIndex: number | null = null

function notifySectionActive(index: number) {
  if (previousActiveIndex !== null && previousActiveIndex !== index) {
    window.dispatchEvent(new CustomEvent(SECTION_ACTIVE_EVENT, { detail: { key: SECTION_KEYS[index] } }))
  }
  previousActiveIndex = index
}

function applyActive(index: number, t: number) {
  notifySectionActive(index)
  for (let i = 0; i < SECTION_COUNT; i++) {
    const el = windowEls[i]
    if (!el) continue
    el.style.zIndex = i === index ? '2' : '1'
    el.style.clipPath = 'none'
    setInert(i, i !== index)
  }
  const content = contentEls[index]
  if (content) {
    content.style.transform = `translateY(${-t * ownScrollArr[index]!}px)`
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
  // Nécessaire ici aussi (pas seulement dans applyActive) : une section dont le segment
  // "actif" a une longueur nulle (Hero, voir DWELL_RATIOS) n'est jamais sélectionnée par
  // findStageSegment en tant que segment "active" — sans cet appel, applyActive() ne
  // s'exécuterait jamais pour cet index et son animation ne rejouerait jamais au retour.
  notifySectionActive(fromIndex)
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
  scrollToSection(ANCHOR_TO_INDEX[hash]!)
}

function handleResize() {
  computeLayout()
}

const { theme } = useTheme()
// Les screenshots capturés (capturedFrom/capturedTo) figent les couleurs de fond du thème
// courant. Sans cette invalidation, changer de thème sans changer de paire de sections
// laisse une bande de l'ancien thème (noire en clair, blanche en sombre) autour de la ligne.
let stopThemeWatch: (() => void) | null = null

onMounted(() => {
  if (canvasEl.value) ctx = canvasEl.value.getContext('2d')
  computeLayout()
  lastFrame = performance.now()
  rafId = requestAnimationFrame(loop)
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleDocumentClick)
  stopThemeWatch = watch(theme, invalidateCapture)

  const initialHash = window.location.hash.slice(1)
  if (initialHash in ANCHOR_TO_INDEX) {
    scrollToSection(ANCHOR_TO_INDEX[initialHash]!, false)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleDocumentClick)
  stopThemeWatch?.()
})
</script>

<template>
  <div ref="root" :style="{ height: `${spacerHeight}px` }" class="relative">
    <div class="sticky top-0 h-screen overflow-hidden">
      <div :ref="(el) => setWindowRef(0, el)" class="bg-bg absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(0, el)">
          <HeroSection />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(1, el)" class="bg-bg absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(1, el)">
          <AboutSection />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(2, el)" class="bg-bg absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(2, el)">
          <SkillsGrid />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(3, el)" class="bg-bg absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(3, el)">
          <ProjectsSection />
        </div>
      </div>
      <div :ref="(el) => setWindowRef(4, el)" class="bg-bg absolute inset-0 overflow-hidden">
        <div :ref="(el) => setContentRef(4, el)">
          <ContactSection />
        </div>
      </div>
      <canvas ref="canvasEl" class="pointer-events-none absolute inset-0 z-[3]" />
    </div>
  </div>
</template>
