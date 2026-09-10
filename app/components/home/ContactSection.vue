<script setup lang="ts">
import { socialLinks } from '~/data/social'
import { useDissolveEnabled } from '~/composables/useDissolveEnabled'
import { useSectionActive } from '~/composables/useSectionActive'
import { useTitleGlitch } from '~/composables/useTitleGlitch'

const { t } = useI18n()
const config = useRuntimeConfig()
const sectionRef = ref<HTMLElement | null>(null)
const { enabled: dissolveEnabled } = useDissolveEnabled()
const sectionReady = computed(() => !dissolveEnabled.value)
useScrollReveal(sectionRef, sectionReady)

const { form, errors, status, submit } = useContactForm(config.public.formspreeEndpoint)

const { active: titleGlitch, pulse: pulseTitleGlitch } = useTitleGlitch()

// Les sections restent montées en permanence dans DissolveStage : sans ça, revenir sur
// Contact après avoir défilé ailleurs ne rejouerait aucune animation sur le titre.
useSectionActive('contact', pulseTitleGlitch)
</script>

<template>
  <section id="contact" ref="sectionRef" class="flex min-h-screen flex-col px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-3xl font-bold sm:text-4xl" :class="{ 'auto-glitch': titleGlitch }">{{ t('contact.title') }}</h2>

    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
      <div class="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <div data-reveal>
          <p class="text-text-muted">{{ t('contact.subtitle') }}</p>

          <div class="mt-6 flex flex-col gap-3">
            <a
              :href="`mailto:${t('contact.fallbackEmail')}`"
              class="group flex items-center gap-3 text-text-muted transition-colors hover:text-accent-green"
            >
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border transition-colors group-hover:border-accent-green">
                <Icon name="heroicons:envelope" class="h-5 w-5" />
              </span>
              <span class="font-semibold text-text">{{ t('contact.fallbackLink') }}</span>
            </a>

            <a
              v-for="link in socialLinks"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center gap-3 text-text-muted transition-colors hover:text-accent-cyan"
            >
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border transition-colors group-hover:border-accent-cyan">
                <Icon :name="link.icon" class="h-5 w-5" />
              </span>
              <span class="font-semibold text-text">{{ link.displayText }}</span>
            </a>
          </div>
        </div>

        <form data-reveal class="space-y-5" @submit.prevent="submit">
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="name" class="block text-sm font-semibold text-text-muted">{{ t('contact.name') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text focus:border-accent-green focus:outline-none"
              >
              <p v-if="errors.name" class="mt-1 text-xs text-accent-magenta">{{ t(`contact.errors.${errors.name}`) }}</p>
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-text-muted">{{ t('contact.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text focus:border-accent-green focus:outline-none"
              >
              <p v-if="errors.email" class="mt-1 text-xs text-accent-magenta">{{ t(`contact.errors.${errors.email}`) }}</p>
            </div>
          </div>

          <div>
            <label for="message" class="block text-sm font-semibold text-text-muted">{{ t('contact.message') }}</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text focus:border-accent-green focus:outline-none"
            />
            <p v-if="errors.message" class="mt-1 text-xs text-accent-magenta">{{ t(`contact.errors.${errors.message}`) }}</p>
          </div>

          <button
            type="submit"
            :disabled="status === 'submitting'"
            class="rounded border border-accent-green px-5 py-2.5 font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ status === 'submitting' ? t('contact.sending') : t('contact.send') }}
          </button>

          <p v-if="status === 'success'" class="text-sm text-accent-green">&gt; {{ t('contact.success') }} ✓</p>
          <p v-else-if="status === 'error'" class="text-sm text-accent-magenta">
            &gt; {{ t('contact.error') }}
            <a :href="`mailto:${t('contact.fallbackEmail')}`" class="underline">{{ t('contact.fallbackLink') }}</a>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
