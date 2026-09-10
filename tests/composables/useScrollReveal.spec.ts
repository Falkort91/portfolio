import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const gsapFrom = vi.fn()
const revert = vi.fn()
const gsapContext = vi.fn((fn: () => void) => {
  fn()
  return { revert }
})

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    context: gsapContext,
    from: gsapFrom,
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}))

const { useScrollReveal } = await import('../../app/composables/useScrollReveal')

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }))
}

function mountWithScrollReveal() {
  const TestComponent = defineComponent({
    setup() {
      const container = ref<HTMLElement | null>(null)
      useScrollReveal(container)
      return () => h('div', { ref: container })
    },
  })
  return mount(TestComponent)
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    gsapFrom.mockClear()
    gsapContext.mockClear()
    revert.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('animates [data-reveal] elements when motion is not reduced', () => {
    stubMatchMedia(false)

    mountWithScrollReveal()

    expect(gsapFrom).toHaveBeenCalledWith(
      '[data-reveal]',
      expect.objectContaining({ y: 24, autoAlpha: 0 }),
    )
  })

  it('does nothing when the user prefers reduced motion', () => {
    stubMatchMedia(true)

    mountWithScrollReveal()

    expect(gsapContext).not.toHaveBeenCalled()
    expect(gsapFrom).not.toHaveBeenCalled()
  })

  it('reverts the gsap context on unmount', () => {
    stubMatchMedia(false)
    const wrapper = mountWithScrollReveal()

    wrapper.unmount()

    expect(revert).toHaveBeenCalledOnce()
  })

  it('does nothing when enabled is explicitly false', async () => {
    const { defineComponent, h, ref } = await import('vue')
    const { mount } = await import('@vue/test-utils')
    const container = document.createElement('div')
    container.innerHTML = '<div data-reveal></div>'
    document.body.appendChild(container)

    const TestComponent = defineComponent({
      setup() {
        const sectionRef = ref<HTMLElement | null>(container)
        const enabled = ref(false)
        useScrollReveal(sectionRef, enabled)
        return () => h('div')
      },
    })

    // Ne doit pas lever d'exception et ne doit pas enregistrer d'animation GSAP.
    expect(() => mount(TestComponent)).not.toThrow()
    expect(gsapContext).not.toHaveBeenCalled()
    expect(gsapFrom).not.toHaveBeenCalled()
    document.body.removeChild(container)
  })
})
