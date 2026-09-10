<script setup lang="ts">
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="glitch-hover flex h-9 w-9 items-center justify-center rounded border border-border text-text-muted transition-colors hover:border-accent-green hover:text-accent-green"
    :aria-label="theme === 'dark' ? $t('theme.switchToLight') : $t('theme.switchToDark')"
    @click="toggle"
  >
    <Icon :name="theme === 'dark' ? 'heroicons:sun' : 'heroicons:moon'" class="h-5 w-5" />
  </button>
</template>
