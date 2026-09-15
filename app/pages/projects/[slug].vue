<script setup lang="ts">
import { featuredProjects, type ProjectVideo } from '~/data/projects'

type LightboxItem = { type: 'image'; src: string; alt: string } | { type: 'video'; video: ProjectVideo }

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

const showcaseCaptions = computed(() =>
  (tm(`projects.${slug}.showcase`) as unknown[]).map((item) => rt(item as string)),
)

// mediaFormat isole les ajustements de gabarit par projet : les captures desktop larges
// (landscape, ex. Toryu) ont besoin d'un cadrage et d'un espacement différents des captures
// mobile étroites (portrait, ex. Questy) — sans que l'un ne déborde sur l'autre.
const isLandscape = featuredProject.mediaFormat === 'landscape'
const showcaseWrapperClass = isLandscape ? 'shrink-0' : 'w-full max-w-[240px] shrink-0 sm:max-w-xs'
const showcaseMediaClass = isLandscape
  ? 'mx-auto max-h-[375px] w-auto max-w-full rounded border border-border sm:mx-0 sm:max-h-[450px] sm:max-w-[550px]'
  : 'w-full rounded border border-border'
const showcaseRowSpacing = isLandscape ? 'mt-16 sm:mt-20' : '-mt-6 sm:-mt-10'

const lightboxItem = ref<LightboxItem | null>(null)

useSeoMeta({
  title: () => t(`projects.${slug}.title`),
  description: () => t(`projects.${slug}.description`),
})
</script>

<template>
  <article class="py-20">
    <div class="px-[10%]">
      <NuxtLink to="/#projects" class="text-sm text-accent-cyan hover:underline">
        ← {{ t('projects.back') }}
      </NuxtLink>

      <NuxtImg
        v-if="featuredProject.heroImage"
        :src="featuredProject.heroImage"
        :alt="t(`projects.${slug}.title`)"
        class="mt-4 w-full cursor-zoom-in rounded border border-border object-cover"
        @click="lightboxItem = { type: 'image', src: featuredProject.heroImage, alt: t(`projects.${slug}.title`) }"
      />

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

      <p class="mt-6 text-lg leading-relaxed text-text-muted sm:text-xl">{{ t(`projects.${slug}.context`) }}</p>

      <div class="mt-6 flex flex-wrap gap-3">
        <StackIcon v-for="icon in featuredProject.stack" :key="icon" :name="icon" class="h-6 w-6 text-text-muted" />
      </div>
    </div>

    <div v-if="featuredProject.showcase.length" class="mx-auto max-w-6xl px-6 mt-12 sm:px-10 lg:px-16">
      <div
        v-for="(item, index) in featuredProject.showcase"
        :key="index"
        class="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
        :class="[{ 'sm:flex-row-reverse': index % 2 === 1 }, index > 0 ? showcaseRowSpacing : '']"
      >
        <div :class="showcaseWrapperClass">
          <video
            v-if="item.type === 'video'"
            :class="[showcaseMediaClass, 'cursor-zoom-in']"
            autoplay
            muted
            loop
            playsinline
            @click="lightboxItem = { type: 'video', video: item.video }"
          >
            <source :src="item.video.webm" type="video/webm" >
            <source :src="item.video.mp4" type="video/mp4" >
          </video>
          <div
            v-else-if="item.type === 'images'"
            class="flex items-center gap-3"
            :class="item.layout === 'row' ? 'flex-row flex-wrap justify-center' : 'flex-col'"
          >
            <NuxtImg
              v-for="src in item.srcs"
              :key="src"
              :src="src"
              :alt="showcaseCaptions[index]"
              :class="[showcaseMediaClass, 'cursor-zoom-in']"
              loading="lazy"
              @click="lightboxItem = { type: 'image', src, alt: showcaseCaptions[index] ?? '' }"
            />
          </div>
          <NuxtImg
            v-else
            :src="item.src"
            :alt="showcaseCaptions[index]"
            :class="[showcaseMediaClass, 'cursor-zoom-in']"
            loading="lazy"
            @click="lightboxItem = { type: 'image', src: item.src, alt: showcaseCaptions[index] ?? '' }"
          />
        </div>
        <p class="text-lg leading-relaxed text-text-muted sm:max-w-md sm:text-xl lg:max-w-lg">
          {{ showcaseCaptions[index] }}
        </p>
      </div>
    </div>

    <div class="px-[10%]">
      <section class="mt-10">
        <h2 class="text-xl font-semibold">{{ t('projects.challengesTitle') }}</h2>
        <ul class="mt-4 space-y-3 text-text-muted">
          <li v-for="(challenge, index) in challenges" :key="index">{{ challenge }}</li>
        </ul>
      </section>
    </div>

    <div class="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
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
    </div>

    <MediaLightbox v-if="lightboxItem" :item="lightboxItem" @close="lightboxItem = null" />
  </article>
</template>
