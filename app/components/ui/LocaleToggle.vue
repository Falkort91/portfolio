<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const otherLocale = computed(() => {
  const available = (locales.value as { code: string }[]).map((l) => l.code)
  return available.find((code) => code !== locale.value) ?? available[0]
})

function switchLocale() {
  setLocale(otherLocale.value as 'fr' | 'en')
}
</script>

<template>
  <button
    type="button"
    class="glitch-hover h-9 rounded border border-border px-2 text-sm font-semibold uppercase text-text-muted transition-colors hover:border-accent-cyan hover:text-accent-cyan"
    @click="switchLocale"
  >
    {{ otherLocale }}
  </button>
</template>
