import { onMounted, onUnmounted } from 'vue'

export const SECTION_ACTIVE_EVENT = 'dissolve:section-active'

interface SectionActiveDetail {
  key: string
}

export function useSectionActive(key: string, callback: () => void) {
  function handler(event: Event) {
    const detail = (event as CustomEvent<SectionActiveDetail>).detail
    if (detail?.key === key) callback()
  }

  onMounted(() => {
    window.addEventListener(SECTION_ACTIVE_EVENT, handler)
  })

  onUnmounted(() => {
    window.removeEventListener(SECTION_ACTIVE_EVENT, handler)
  })
}
