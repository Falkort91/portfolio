<script setup lang="ts">
import type { ExtensionProject } from '~/data/projects'

const props = defineProps<{ project: ExtensionProject }>()
const { t } = useI18n()

const title = computed(() => t(`projects.${props.project.slug}.title`))
</script>

<template>
  <article class="rounded-lg border border-border p-4">
    <div class="flex items-center gap-3">
      <img :src="project.icon" :alt="title" class="h-9 w-9 shrink-0 rounded-lg" >
      <div class="min-w-0">
        <h3 class="truncate text-sm font-bold">{{ title }}</h3>
        <p class="text-xs text-text-muted">{{ t('projects.extensions.kind') }}</p>
      </div>
    </div>

    <p class="mt-3 text-xs leading-relaxed text-text-muted">
      {{ t(`projects.${project.slug}.description`) }}
    </p>

    <div class="mt-3 flex flex-wrap gap-2">
      <StackIcon v-for="icon in project.stack" :key="icon" :name="icon" class="h-4 w-4 text-text-muted" />
    </div>

    <div class="mt-4 flex gap-2 text-xs font-semibold">
      <a
        :href="project.repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 rounded border border-border py-1.5 text-center transition-colors hover:border-accent-cyan hover:text-accent-cyan"
      >
        {{ t('projects.extensions.source') }} ↗
      </a>
      <a
        :href="project.downloadUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 rounded border border-accent-green py-1.5 text-center text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
      >
        {{ t('projects.extensions.download') }}
      </a>
    </div>
  </article>
</template>
