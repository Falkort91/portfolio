<script setup lang="ts">
import { computed } from 'vue'
import type { CompactProject } from '~/data/projects'

const props = defineProps<{ project: CompactProject }>()
const { t } = useI18n()

const title = computed(() => t(`projects.${props.project.slug}.title`))
const mark = computed(() => title.value.slice(0, 1))
</script>

<template>
  <article class="flex items-center gap-3 rounded border border-border p-4 transition-colors hover:border-accent-cyan">
    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-bg-alt text-xs font-bold text-accent-green">
      {{ mark }}
    </span>
    <div class="min-w-0 flex-1">
      <h3 class="truncate text-sm font-semibold">{{ title }}</h3>
      <p class="truncate text-xs text-text-muted">{{ t(`projects.${project.slug}.description`) }}</p>
    </div>
    <div class="flex shrink-0 gap-3 text-xs">
      <a
        v-if="project.demoUrl"
        :href="project.demoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold text-accent-green hover:underline"
      >
        {{ t('projects.viewDemo') }} ↗
      </a>
      <a
        :href="project.repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold text-accent-cyan hover:underline"
      >
        GitHub ↗
      </a>
    </div>
  </article>
</template>
