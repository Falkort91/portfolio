// app/composables/useScrollReveal.ts
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(container: Ref<HTMLElement | null>, enabled: Ref<boolean> = ref(true)) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    if (!container.value) return
    if (!enabled.value) return
    // Si l'utilisateur préfère un mouvement réduit, on n'exécute pas .from() :
    // les éléments restent visibles tels quels dans le DOM (no-op sûr).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container.value,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
    }, container.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
