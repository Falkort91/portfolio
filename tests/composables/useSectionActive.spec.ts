import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { SECTION_ACTIVE_EVENT, useSectionActive } from '../../app/composables/useSectionActive'

function mountHook(key: string, callback: () => void) {
  const TestComponent = defineComponent({
    setup() {
      useSectionActive(key, callback)
      return () => h('div')
    },
  })
  return mount(TestComponent)
}

function dispatchSectionActive(key: string) {
  window.dispatchEvent(new CustomEvent(SECTION_ACTIVE_EVENT, { detail: { key } }))
}

describe('useSectionActive', () => {
  it('calls the callback when the matching section becomes active', () => {
    const callback = vi.fn()
    mountHook('skills', callback)

    dispatchSectionActive('skills')

    expect(callback).toHaveBeenCalledOnce()
  })

  it('ignores activation events for other sections', () => {
    const callback = vi.fn()
    mountHook('skills', callback)

    dispatchSectionActive('projects')

    expect(callback).not.toHaveBeenCalled()
  })

  it('stops listening once the component is unmounted', () => {
    const callback = vi.fn()
    const wrapper = mountHook('skills', callback)

    wrapper.unmount()
    dispatchSectionActive('skills')

    expect(callback).not.toHaveBeenCalled()
  })
})
