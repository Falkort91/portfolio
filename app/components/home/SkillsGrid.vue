<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { skillCategories } from '~/data/skills'
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'
import { useScramble } from '~/composables/useScramble'
import { useSectionActive } from '~/composables/useSectionActive'
import { useTitleGlitch } from '~/composables/useTitleGlitch'

const { t } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
const { enabled: dissolveEnabled } = useDissolveEnabled()
const sectionReady = computed(() => !dissolveEnabled.value)
useScrollReveal(sectionRef, sectionReady)

const activeCategory = ref('all')
const revealKey = ref(0)
const { active: titleGlitch, pulse: pulseTitleGlitch } = useTitleGlitch()

const { displayedText: promptText, start: startPrompt } = useScramble({ speed: 22 })

const filteredSkills = computed(() => {
  const categories = activeCategory.value === 'all'
    ? skillCategories
    : skillCategories.filter(category => category.key === activeCategory.value)

  return categories.flatMap(category =>
    category.skills.map(skill => ({
      ...skill,
      categoryLabel: activeCategory.value === 'all' ? t(`skills.categories.${category.key}`) : undefined,
    })),
  )
})

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function playPrompt() {
  startPrompt(`cat --category=${activeCategory.value}`, reducedMotion())
}

function selectCategory(key: string) {
  if (key === activeCategory.value) return
  activeCategory.value = key
  revealKey.value += 1
  playPrompt()
  pulseTitleGlitch()
}

function replayEntrance() {
  revealKey.value += 1
  playPrompt()
  pulseTitleGlitch()
}

onMounted(playPrompt)

// Les sections restent montées en permanence dans DissolveStage : sans ça, revenir sur
// Compétences après avoir défilé ailleurs ne rejouerait pas le scramble (déjà joué une
// fois au montage).
useSectionActive('skills', replayEntrance)
</script>

<template>
  <section id="skills" ref="sectionRef" class="px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-3xl font-bold sm:text-4xl" :class="{ 'auto-glitch': titleGlitch }">
      {{ t('skills.title') }}
    </h2>

    <div data-reveal class="scanline-bg scanline-flicker relative mx-auto mt-8 max-w-5xl overflow-hidden rounded-lg border border-border bg-bg-alt/50">
      <div class="flex items-center gap-1.5 border-b border-border px-4 py-2.5 text-xs text-text-muted">
        <span class="h-2.5 w-2.5 rounded-full bg-border" />
        <span class="h-2.5 w-2.5 rounded-full bg-border" />
        <span class="h-2.5 w-2.5 rounded-full bg-border" />
        <span class="ml-2">skills.sh</span>
      </div>

      <div class="relative px-5 py-6 sm:px-6">
        <p class="mb-5 min-h-[1.2em] text-sm text-text-muted">
          <span class="text-accent-green">$</span>
          <span class="text-text"> {{ promptText }}</span>
          <span class="terminal-cursor" />
        </p>

        <div :aria-label="t('skills.filterLabel')" role="group" class="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs transition-colors"
            :class="activeCategory === 'all'
              ? 'border-accent-green text-bg bg-accent-green font-semibold'
              : 'border-border text-text-muted hover:text-text'"
            :aria-pressed="activeCategory === 'all'"
            @click="selectCategory('all')"
          >
            {{ t('skills.categories.all') }}
          </button>
          <button
            v-for="category in skillCategories"
            :key="category.key"
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs transition-colors"
            :class="activeCategory === category.key
              ? 'border-accent-green text-bg bg-accent-green font-semibold'
              : 'border-border text-text-muted hover:text-text'"
            :aria-pressed="activeCategory === category.key"
            @click="selectCategory(category.key)"
          >
            {{ t(`skills.categories.${category.key}`) }}
          </button>
        </div>

        <div class="grid min-h-[7rem] grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          <SkillTermRow
            v-for="(skill, index) in filteredSkills"
            :key="skill.name"
            :text="skill.name"
            :icon="skill.icon"
            :category-label="skill.categoryLabel"
            :index="index"
            :trigger-key="revealKey"
          />
        </div>
      </div>
    </div>
  </section>
</template>
