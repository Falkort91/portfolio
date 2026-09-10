import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTitleGlitch } from '../../app/composables/useTitleGlitch'

function stubMatchMedia(prefersReducedMotion: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
    matches: prefersReducedMotion,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
}

function mountHook() {
  let result: ReturnType<typeof useTitleGlitch> | undefined
  const TestComponent = defineComponent({
    setup() {
      result = useTitleGlitch()
      return () => h('div')
    },
  })
  mount(TestComponent)
  return result!
}

describe('useTitleGlitch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('activates the glitch pulse when triggered', () => {
    stubMatchMedia(false)
    const { active, pulse } = mountHook()

    expect(active.value).toBe(false)
    pulse()
    vi.advanceTimersToNextFrame()

    expect(active.value).toBe(true)
  })

  it('does nothing when the user prefers reduced motion', () => {
    stubMatchMedia(true)
    const { active, pulse } = mountHook()

    pulse()
    vi.advanceTimersToNextFrame()

    expect(active.value).toBe(false)
  })

  it('resets before reactivating on a repeated call, so the CSS animation restarts', () => {
    stubMatchMedia(false)
    const { active, pulse } = mountHook()

    pulse()
    vi.advanceTimersToNextFrame()
    expect(active.value).toBe(true)

    pulse()
    expect(active.value).toBe(false)
    vi.advanceTimersToNextFrame()
    expect(active.value).toBe(true)
  })
})
