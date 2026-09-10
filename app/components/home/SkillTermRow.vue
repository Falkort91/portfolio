<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useScramble } from '~/composables/useScramble'

const props = defineProps<{
  text: string
  icon: string
  categoryLabel?: string
  index: number
  triggerKey: number
}>()

// Délai négatif : chaque icône démarre déjà en cours de rotation, désynchronisée
// des autres dès le premier rendu (évite un départ groupé peu naturel).
const spinDelay = computed(() => `-${props.index % 7}s`)

const { displayedText, start } = useScramble({ speed: 26 })
let timeoutId: ReturnType<typeof setTimeout> | undefined

function play() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => start(props.text, reduced), reduced ? 0 : props.index * 45)
}

onMounted(play)
watch(() => props.triggerKey, play)
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="flex items-center gap-2 text-sm">
    <span class="icon-spin-perspective inline-flex h-5 w-5 shrink-0">
      <span class="icon-3d text-accent-green" :style="{ animationDelay: spinDelay }">
        <Icon :name="icon" class="icon-3d-face icon-3d-face--front h-5 w-5" aria-hidden="true" />
        <Icon :name="icon" class="icon-3d-face icon-3d-face--back h-5 w-5" aria-hidden="true" />
        <span class="icon-3d-edge icon-3d-edge--right" aria-hidden="true" />
        <span class="icon-3d-edge icon-3d-edge--left" aria-hidden="true" />
      </span>
    </span>
    <span aria-hidden="true">{{ displayedText }}</span>
    <span class="sr-only">{{ text }}</span>
    <span v-if="categoryLabel" class="text-xs text-text-muted" aria-hidden="true">// {{ categoryLabel }}</span>
  </div>
</template>
