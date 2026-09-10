import { ref } from 'vue'

export function useTitleGlitch() {
  const active = ref(false)

  function pulse() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    active.value = false
    requestAnimationFrame(() => { active.value = true })
  }

  return { active, pulse }
}
