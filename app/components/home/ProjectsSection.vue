<script setup lang="ts">
import { compactProjects, featuredProjects } from '~/data/projects'
import { socialLinks } from '~/data/social'
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'
import { useSectionActive } from '~/composables/useSectionActive'
import { useTitleGlitch } from '~/composables/useTitleGlitch'

const { t } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
const { enabled: dissolveEnabled } = useDissolveEnabled()
const sectionReady = computed(() => !dissolveEnabled.value)
useScrollReveal(sectionRef, sectionReady)

const { active: titleGlitch, pulse: pulseTitleGlitch } = useTitleGlitch()

const githubUrl = socialLinks.find((link) => link.label === 'GitHub')!.href

// Les sections restent montées en permanence dans DissolveStage : sans ça, revenir sur
// Projets après avoir défilé ailleurs ne rejouerait aucune animation sur le titre.
useSectionActive('projects', pulseTitleGlitch)
</script>

<template>
  <section id="projects" ref="sectionRef" class="px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-3xl font-bold sm:text-4xl" :class="{ 'auto-glitch': titleGlitch }">{{ t('projects.title') }}</h2>

    <div class="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-10">
      <div class="max-w-5xl">
        <div class="mt-8 space-y-6">
          <ProjectCardFeatured
            v-for="(project, index) in featuredProjects"
            :key="project.slug"
            data-reveal
            :project="project"
            :index="index"
          />
        </div>

        <div data-reveal class="mt-10 flex items-center gap-3 text-xs uppercase tracking-wide text-text-muted">
          <span>{{ t('projects.othersLabel') }}</span>
          <span class="h-px flex-1 bg-border" />
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <ProjectCardCompact
            v-for="project in compactProjects"
            :key="project.slug"
            data-reveal
            :project="project"
          />
        </div>

        <p data-reveal class="mt-6 text-center text-sm text-text-muted">
          {{ t('projects.githubNote') }}
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="underline">{{ t('projects.githubNoteLink') }}</a>.
        </p>
      </div>

      <ExtensionsColumn class="mt-10 lg:mt-8" />
    </div>
  </section>
</template>
