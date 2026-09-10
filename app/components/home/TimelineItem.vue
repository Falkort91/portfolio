<script setup lang="ts">
import type { TimelineEntry } from '~/data/timeline'

const props = defineProps<{ entry: TimelineEntry }>()

const { t, te } = useI18n()

const typeIcon: Record<TimelineEntry['type'], string> = {
  studies: 'heroicons:academic-cap',
  internship: 'heroicons:briefcase',
  project: 'heroicons:rocket-launch',
}

const hasProjects = computed(() => (props.entry.projectKeys?.length ?? 0) > 0)

const noteKey = `about.timeline.${props.entry.key}.note`
const hasNote = computed(() => te(noteKey))
</script>

<template>
  <li class="relative">
    <span class="absolute -left-[1.95rem] flex h-5 w-5 items-center justify-center rounded-full border border-accent-green bg-bg text-accent-green">
      <Icon :name="typeIcon[entry.type]" class="h-3 w-3" />
    </span>
    <p v-if="entry.period" class="text-xs uppercase tracking-wide text-accent-cyan">{{ entry.period }}</p>
    <h3 class="font-semibold text-text">{{ t(`about.timeline.${entry.key}.title`) }}</h3>
    <p class="text-sm text-text-muted">{{ t(`about.timeline.${entry.key}.description`) }}</p>
    <ul v-if="hasProjects" class="mt-2 space-y-1">
      <li v-for="projectKey in entry.projectKeys" :key="projectKey">
        <details class="group">
          <summary class="flex cursor-pointer items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-green">
            <Icon name="heroicons:chevron-right" class="chevron-hint h-4 w-4 shrink-0 text-accent-green transition-transform group-open:rotate-90" />
            <span>{{ t(`about.timeline.${entry.key}.projects.${projectKey}.summary`) }}</span>
          </summary>
          <p class="mt-1 pl-4 text-sm text-text-muted">{{ t(`about.timeline.${entry.key}.projects.${projectKey}.detail`) }}</p>
        </details>
      </li>
    </ul>
    <p v-if="hasNote" class="mt-2 text-sm text-text-muted">{{ t(noteKey) }}</p>
  </li>
</template>
