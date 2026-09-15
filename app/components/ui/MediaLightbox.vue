<script setup lang="ts">
import type { ProjectVideo } from '~/data/projects'

const props = defineProps<{
  item: { type: 'image'; src: string; alt: string } | { type: 'video'; video: ProjectVideo }
}>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

// Empêche le scroll de la page derrière l'overlay tant que la version agrandie est ouverte.
onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
      @click="emit('close')"
    >
      <button
        type="button"
        class="absolute right-4 top-4 rounded border border-white/30 p-2 text-white transition-colors hover:border-white hover:bg-white/10"
        :aria-label="t('projects.lightboxClose')"
        @click="emit('close')"
      >
        <Icon name="heroicons:x-mark" class="h-6 w-6" />
      </button>

      <video
        v-if="props.item.type === 'video'"
        class="max-h-[90vh] max-w-[90vw] rounded border border-white/20"
        autoplay
        muted
        loop
        playsinline
        controls
        @click.stop
      >
        <source :src="props.item.video.webm" type="video/webm" >
        <source :src="props.item.video.mp4" type="video/mp4" >
      </video>
      <img
        v-else
        :src="props.item.src"
        :alt="props.item.alt"
        class="max-h-[90vh] max-w-[90vw] rounded border border-white/20 object-contain"
        @click.stop
      >
    </div>
  </Teleport>
</template>
