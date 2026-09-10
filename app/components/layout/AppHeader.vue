<script setup lang="ts">
const { t } = useI18n()
const isMobileMenuOpen = ref(false)

const navLinks = [
  { key: 'about', href: '#about' },
  { key: 'skills', href: '#skills' },
  { key: 'projects', href: '#projects' },
  { key: 'contact', href: '#contact' },
]

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="#top" class="glitch-hover font-bold tracking-tight text-text">
        &gt; {{ t('header.brand') }}
      </a>

      <nav class="hidden gap-6 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.href"
          class="glitch-hover text-sm text-text-muted transition-colors hover:text-accent-green"
        >
          {{ t(`nav.${link.key}`) }}
        </a>
      </nav>

      <div class="flex items-center gap-2">
        <a
          href="/cv.pdf"
          download
          class="hidden rounded border border-accent-green px-3 py-1.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg sm:inline-block"
        >
          {{ t('header.downloadCv') }}
        </a>
        <ThemeToggle />
        <LocaleToggle />
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded border border-border text-text md:hidden"
          :aria-label="t('header.toggleMenu')"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <Icon :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <nav
      v-if="isMobileMenuOpen"
      class="flex flex-col gap-1 border-t border-border bg-bg px-4 py-3 md:hidden"
    >
      <a
        v-for="link in navLinks"
        :key="link.key"
        :href="link.href"
        class="rounded px-2 py-2 text-sm text-text-muted transition-colors hover:bg-bg-alt hover:text-accent-green"
        @click="closeMobileMenu"
      >
        {{ t(`nav.${link.key}`) }}
      </a>
      <a
        href="/cv.pdf"
        download
        class="rounded px-2 py-2 text-sm font-semibold text-accent-green"
        @click="closeMobileMenu"
      >
        {{ t('header.downloadCv') }}
      </a>
    </nav>
  </header>
</template>
