import { onMounted, ref } from 'vue'

export function useDissolveEnabled() {
  const enabled = ref(false)
  const desktopQuery = '(min-width: 768px)'
  const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

  function evaluate() {
    const isDesktop = window.matchMedia(desktopQuery).matches
    const reducedMotion = window.matchMedia(reducedMotionQuery).matches
    enabled.value = isDesktop && !reducedMotion
  }

  onMounted(() => {
    evaluate()
    window.matchMedia(desktopQuery).addEventListener('change', evaluate)
    window.matchMedia(reducedMotionQuery).addEventListener('change', evaluate)
  })

  return { enabled }
}
