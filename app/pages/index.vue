<!-- app/pages/index.vue -->
<script setup lang="ts">
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'

const { t } = useI18n()
const { enabled: dissolveEnabled } = useDissolveEnabled()

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDescription'),
})
</script>

<template>
  <div>
    <DissolveStage v-if="dissolveEnabled" />
    <template v-else>
      <HeroSection />
      <AboutSection />
      <SkillsGrid />
      <ProjectsSection />
      <ContactSection />
    </template>
  </div>
</template>
