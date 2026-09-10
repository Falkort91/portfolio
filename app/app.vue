<script setup lang="ts">
const { init } = useTheme()
const i18nHead = useLocaleHead()

// Suit la locale active pour que <html lang> reste correct (a11y/SEO) au changement de langue.
useHead({
  htmlAttrs: {
    lang: computed(() => i18nHead.value.htmlAttrs?.lang),
  },
})

onMounted(() => {
  init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
