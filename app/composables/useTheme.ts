import { readonly, ref } from 'vue'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'portfolio-theme'

const theme = ref<Theme>('dark')

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
}

function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

export function useTheme() {
  function init() {
    theme.value = resolveInitialTheme()
    applyTheme(theme.value)
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_STORAGE_KEY, theme.value)
    applyTheme(theme.value)
  }

  return { theme: readonly(theme), init, toggle }
}
