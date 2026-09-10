<script setup lang="ts">
import { extensionProjects } from '~/data/projects'

const { t } = useI18n()
</script>

<template>
  <aside data-reveal class="rounded-lg border border-border bg-bg-alt/50 p-5">
    <p class="text-xs font-bold uppercase tracking-wide text-accent-green">
      {{ t('projects.extensions.eyebrow') }}
    </p>
    <p class="mt-1 text-sm font-bold">{{ t('projects.extensions.title') }}</p>

    <div class="mt-4 space-y-3">
      <ExtensionCard v-for="project in extensionProjects" :key="project.slug" :project="project" />
    </div>

    <p class="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-text-muted">
      {{ t('projects.extensions.note') }}
    </p>
  </aside>
</template>
