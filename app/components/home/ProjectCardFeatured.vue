<script setup lang="ts">
import { computed } from 'vue'
import type { FeaturedProject } from '~/data/projects'

const props = defineProps<{ project: FeaturedProject; index: number }>()
const { t } = useI18n()

const title = computed(() => t(`projects.${props.project.slug}.title`))
const mark = computed(() => title.value.slice(0, 2))
const isAlt = computed(() => props.index % 2 === 1)
const hasImage = computed(() => props.project.images.length > 0)
</script>

<template>
  <article class="grid overflow-hidden rounded-lg border border-border bg-bg-alt/40 sm:grid-cols-2">
    <div
      class="project-visual relative flex min-h-48 items-center justify-center overflow-hidden"
      :class="{ 'sm:order-2': isAlt }"
    >
      <img v-if="hasImage" :src="project.images[0]" :alt="title" class="relative z-[1] h-full w-full object-cover" >
      <span v-else class="relative z-[1] text-5xl font-extrabold tracking-tight text-text/90">{{ mark }}</span>
    </div>

    <div class="flex flex-col p-6 sm:p-7">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="text-xl font-bold">{{ title }}</h3>
          <span
            v-if="project.isTfe"
            class="rounded border border-accent-cyan px-2 py-1 text-xs font-semibold uppercase text-accent-cyan"
          >
            {{ t('projects.tfeBadge') }}
          </span>
        </div>
        <span
          v-if="!project.demoUrl"
          class="rounded border border-accent-magenta px-2 py-1 text-xs font-semibold uppercase text-accent-magenta"
        >
          {{ t('projects.demoSoon') }}
        </span>
        <a
          v-else
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded border border-accent-green px-3 py-1.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
        >
          {{ t('projects.viewDemo') }}
        </a>
      </div>

      <p class="mt-3 line-clamp-3 text-text-muted">{{ t(`projects.${project.slug}.description`) }}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <StackIcon v-for="icon in project.stack" :key="icon" :name="icon" class="h-5 w-5 text-text-muted" />
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-4">
        <NuxtLink
          :to="`/projects/${project.slug}`"
          class="glitch-hover text-sm font-semibold text-accent-cyan"
        >
          {{ t('projects.viewDetails') }} →
        </NuxtLink>
        <a
          v-for="repo in project.repoUrls"
          :key="repo.url"
          :href="repo.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-text-muted underline-offset-2 hover:text-accent-cyan hover:underline"
        >
          {{ repo.label }} ↗
        </a>
      </div>
    </div>
  </article>
</template>
