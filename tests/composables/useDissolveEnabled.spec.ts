import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDissolveEnabled } from '../../app/composables/useDissolveEnabled'

function stubMatchMedia(isDesktop: boolean, prefersReducedMotion: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? prefersReducedMotion : isDesktop,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
}

function mountHook() {
  let result: ReturnType<typeof useDissolveEnabled> | undefined
  const TestComponent = defineComponent({
    setup() {
      result = useDissolveEnabled()
      return () => h('div')
    },
  })
  mount(TestComponent)
  return result!
}

describe('useDissolveEnabled', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is enabled on desktop without reduced motion', () => {
    stubMatchMedia(true, false)

    const { enabled } = mountHook()

    expect(enabled.value).toBe(true)
  })

  it('is disabled under the desktop breakpoint', () => {
    stubMatchMedia(false, false)

    const { enabled } = mountHook()

    expect(enabled.value).toBe(false)
  })

  it('is disabled when the user prefers reduced motion, even on desktop', () => {
    stubMatchMedia(true, true)

    const { enabled } = mountHook()

    expect(enabled.value).toBe(false)
  })
})
