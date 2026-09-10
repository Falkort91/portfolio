import { beforeEach, describe, expect, it } from 'vitest'
import { useTheme } from '../../app/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark when no preference is stored', () => {
    const { theme, init } = useTheme()

    init()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('respects a previously stored preference', () => {
    localStorage.setItem('portfolio-theme', 'light')
    const { theme, init } = useTheme()

    init()

    expect(theme.value).toBe('light')
  })

  it('toggle() flips the theme, persists it and updates the DOM class', () => {
    const { theme, init, toggle } = useTheme()
    init()

    toggle()

    expect(theme.value).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('portfolio-theme')).toBe('light')

    toggle()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('portfolio-theme')).toBe('dark')
  })
})
