<script setup lang="ts">
import { timelineEntries } from '~/data/timeline'
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'
import { useSectionActive } from '~/composables/useSectionActive'
import { useTitleGlitch } from '~/composables/useTitleGlitch'

const { t } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
const { enabled: dissolveEnabled } = useDissolveEnabled()
const sectionReady = computed(() => !dissolveEnabled.value)
useScrollReveal(sectionRef, sectionReady)

const { active: titleGlitch, pulse: pulseTitleGlitch } = useTitleGlitch()

// Les sections restent montées en permanence dans DissolveStage : sans ça, revenir sur
// À propos après avoir défilé ailleurs ne rejouerait aucune animation sur le titre.
useSectionActive('about', pulseTitleGlitch)
</script>

<template>
  <section id="about" ref="sectionRef" class="px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-3xl font-bold sm:text-4xl" :class="{ 'auto-glitch': titleGlitch }">{{ t('about.title') }}</h2>

    <!--
      3 colonnes fr (20/10/70) plutôt que 2 colonnes % + gap : la combinaison %+gap déborde
      (voir historique), fr calcule correctement l'espace restant. La colonne du milieu (1fr)
      sert d'écart de 10% — pas de gap-x supplémentaire pour ne pas recréer le même bug.
      L'intro reste proche de la photo (pl-10, ancien écart) ; seule la timeline démarre
      après l'écart de 10% (col-start-3), sur la 2e rangée implicite.
      La photo s'étend sur les 2 rangées (row-span-2) : sinon la 1ère rangée (intro, courte)
      s'étirerait à la hauteur de la photo, et la timeline ne démarrerait qu'après celle-ci.
    -->
    <div class="mt-8 grid gap-y-10 md:grid-cols-[2fr_1fr_7fr] md:items-start">
      <div data-reveal class="min-w-0 md:row-span-2">
        <img
          src="/images/profile.jpg"
          :alt="t('about.photoAlt')"
          class="aspect-square w-full max-w-xs rounded border border-border object-cover md:max-w-none"
        >
      </div>

      <div data-reveal class="speech-bubble min-w-0 rounded-lg border-2 border-accent-green bg-bg-alt p-5 md:col-span-2 md:ml-10">
        <p class="text-text-muted">{{ t('about.intro') }}</p>
      </div>

      <ol data-reveal class="min-w-0 space-y-6 border-l border-border pl-6 md:col-start-3">
        <TimelineItem
          v-for="entry in timelineEntries"
          :key="entry.key"
          :entry="entry"
        />
      </ol>
    </div>
  </section>
</template>
