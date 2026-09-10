<script setup lang="ts">
import { socialLinks } from '~/data/social'

const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-border py-8">
    <div class="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
      <p class="text-sm text-text-muted">{{ t('footer.rights', { year: new Date().getFullYear() }) }}</p>
      <div class="flex gap-4">
        <a
          v-for="link in socialLinks"
          :key="link.label"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted transition-colors hover:text-accent-cyan"
          :aria-label="link.label"
        >
          <Icon :name="link.icon" class="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
</template>
