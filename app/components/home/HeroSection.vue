<script setup lang="ts">
import { useSectionActive } from '~/composables/useSectionActive'

const { t, locale } = useI18n()
const { displayedText, start } = useTypewriter({ speed: 55 })
const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  start(t('hero.greeting'))
})

watch(locale, () => {
  start(t('hero.greeting'))
})

// Rejoue l'animation de frappe quand on revient sur le Hero après avoir défilé ailleurs
// (les sections restent montées en permanence dans DissolveStage, donc onMounted seul
// ne suffit pas à la rejouer).
useSectionActive('top', () => start(t('hero.greeting')))
</script>

<template>
  <section id="top" ref="sectionRef" class="scanline-bg flex min-h-screen flex-col justify-center px-4 pt-16 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-3xl">
      <p class="text-sm text-accent-green">$ whoami</p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl md:text-5xl">
        <span class="terminal-cursor">{{ displayedText }}</span>
      </h1>
      <p class="mt-3 text-lg text-text-muted sm:text-xl">{{ t('hero.role') }}</p>
      <div class="mt-8 flex flex-wrap gap-4">
        <a
          href="#projects"
          class="rounded border border-accent-green px-5 py-2.5 font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
        >
          {{ t('hero.ctaProjects') }}
        </a>
        <a
          href="/cv.pdf"
          download
          class="rounded border border-border px-5 py-2.5 font-semibold text-text-muted transition-colors hover:border-accent-cyan hover:text-accent-cyan"
        >
          {{ t('hero.ctaCv') }}
        </a>
      </div>
    </div>
  </section>
</template>
