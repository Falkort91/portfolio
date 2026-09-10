import { onMounted, onUnmounted, ref } from 'vue'

// Pause entre le début de deux vagues — volontairement large pour éviter l'effet
// "guirlande de Noël" (jamais deux vagues qui s'enchaînent trop vite).
const MIN_WAVE_GAP_MS = 4000
const MAX_WAVE_GAP_MS = 9000
// Décalage entre les icônes d'une même vague : un minimum garanti (pas juste un
// hasard qui pourrait tomber proche de zéro pour plusieurs icônes à la fois) plus
// un peu de hasard par-dessus pour ne pas paraître mécanique.
const STAGGER_STEP_MS = 500
const STAGGER_JITTER_MS = 350
const ICONS_PER_WAVE_MIN = 2
const ICONS_PER_WAVE_MAX = 3
// Doit rester synchronisé avec la durée de l'animation `icon-glitch` dans main.css.
export const GLITCH_DURATION_MS = 1300

interface IconEntry {
  trigger: () => void
}

// État de module (pas dans le composable) : une seule boucle est partagée par toutes
// les icônes de la page, plutôt qu'une boucle indépendante par icône — c'est ce qui
// permet de choisir "2-3 icônes à la fois parmi toutes" au lieu que chacune décide
// pour son propre compte, ce qui finissait statistiquement par en allumer trop.
const registry = new Set<IconEntry>()
let loopStarted = false

function pickRandomIcons(count: number): IconEntry[] {
  const pool = Array.from(registry)
  const picked: IconEntry[] = []
  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(index, 1)[0]!)
  }
  return picked
}

function runWave(): void {
  const count = ICONS_PER_WAVE_MIN + Math.floor(Math.random() * (ICONS_PER_WAVE_MAX - ICONS_PER_WAVE_MIN + 1))
  pickRandomIcons(count).forEach((icon, index) => {
    const delay = index * STAGGER_STEP_MS + Math.random() * STAGGER_JITTER_MS
    setTimeout(() => icon.trigger(), delay)
  })
}

function scheduleLoop(): void {
  const gap = MIN_WAVE_GAP_MS + Math.random() * (MAX_WAVE_GAP_MS - MIN_WAVE_GAP_MS)
  setTimeout(() => {
    runWave()
    scheduleLoop()
  }, gap)
}

export function useIconGlitch() {
  const glitching = ref(false)
  const entry: IconEntry = {
    trigger: () => {
      glitching.value = true
      setTimeout(() => {
        glitching.value = false
      }, GLITCH_DURATION_MS)
    },
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registry.add(entry)
    if (!loopStarted) {
      loopStarted = true
      scheduleLoop()
    }
  })

  onUnmounted(() => {
    registry.delete(entry)
  })

  return { glitching }
}
