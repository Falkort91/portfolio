<script setup lang="ts">
import { featuredProjects } from '~/data/projects'

const route = useRoute()
const { t, tm, rt } = useI18n()

const slug = route.params.slug as string

const featuredProject = featuredProjects.find((project) => project.slug === slug)

if (!featuredProject) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const challenges = computed(() =>
  (tm(`projects.${slug}.challenges`) as unknown[]).map((item) => rt(item as string)),
)

const getImageAlt = (index: number) => `${t(`projects.${slug}.title`)} - screenshot ${index + 1}`

useSeoMeta({
  title: () => t(`projects.${slug}.title`),
  description: () => t(`projects.${slug}.description`),
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
    <NuxtLink to="/#projects" class="text-sm text-accent-cyan hover:underline">
      ← {{ t('projects.back') }}
    </NuxtLink>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <h1 class="text-3xl font-bold">{{ t(`projects.${slug}.title`) }}</h1>
      <span
        v-if="featuredProject.isTfe"
        class="rounded border border-accent-cyan px-2 py-1 text-xs font-semibold uppercase text-accent-cyan"
      >
        {{ t('projects.tfeBadge') }}
      </span>
    </div>

    <div class="mt-3">
      <span
        v-if="!featuredProject.demoUrl"
        class="rounded border border-accent-magenta px-2 py-1 text-xs font-semibold uppercase text-accent-magenta"
      >
        {{ t('projects.demoSoon') }}
      </span>
      <a
        v-else
        :href="featuredProject.demoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded border border-accent-green px-3 py-1.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
      >
        {{ t('projects.viewDemo') }}
      </a>
    </div>

    <p class="mt-6 text-text-muted">{{ t(`projects.${slug}.context`) }}</p>

    <div class="mt-6 flex flex-wrap gap-3">
      <StackIcon v-for="icon in featuredProject.stack" :key="icon" :name="icon" class="h-6 w-6 text-text-muted" />
    </div>

    <div v-if="featuredProject.images.length" class="mt-10 grid gap-4 sm:grid-cols-2">
      <NuxtImg
        v-for="(image, index) in featuredProject.images"
        :key="image"
        :src="image"
        :alt="getImageAlt(index)"
        class="rounded border border-border"
        loading="lazy"
      />
    </div>

    <section class="mt-10">
      <h2 class="text-xl font-semibold">{{ t('projects.challengesTitle') }}</h2>
      <ul class="mt-4 space-y-3 text-text-muted">
        <li v-for="(challenge, index) in challenges" :key="index">{{ challenge }}</li>
      </ul>
    </section>

    <div class="mt-10 flex flex-wrap gap-4">
      <a
        v-for="repo in featuredProject.repoUrls"
        :key="repo.url"
        :href="repo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-accent-cyan hover:text-accent-cyan"
      >
        {{ repo.label }} ↗
      </a>
    </div>
  </article>
</template>
