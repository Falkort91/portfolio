<script setup lang="ts">
import { computed } from 'vue'
import { useIconGlitch } from '~/composables/useIconGlitch'
import { iconBrandColors } from '~/data/iconColors'

const props = defineProps<{ name: string }>()
const { glitching } = useIconGlitch()

const slug = computed(() => props.name.replace('simple-icons:', ''))
const brandColor = computed(() => iconBrandColors[slug.value])

// La couleur de marque est exposée en variable CSS (statique, pas de toggle JS) :
// c'est l'animation icon-glitch elle-même qui fait varier `color` entre cette valeur
// et le gris atténué à chaque étape, pour que la perte de couleur soit synchronisée
// avec les sursauts visuels plutôt que déclenchée séparément à la fin.
const style = computed(() =>
  brandColor.value ? { '--icon-brand-color': brandColor.value } : undefined,
)
</script>

<template>
  <Icon
    :name="name"
    class="stack-icon"
    :class="{ 'stack-icon--glitching': glitching }"
    :style="style"
  />
</template>
