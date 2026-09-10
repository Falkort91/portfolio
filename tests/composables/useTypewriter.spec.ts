import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypewriter } from '../../app/composables/useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals the text one character at a time at the given speed', () => {
    const { displayedText, isDone, start } = useTypewriter({ speed: 50 })

    start('Hi')

    expect(displayedText.value).toBe('')
    expect(isDone.value).toBe(false)

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('H')

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('Hi')
    expect(isDone.value).toBe(true)
  })

  it('restarts cleanly when called again with new text', () => {
    const { displayedText, start } = useTypewriter({ speed: 50 })

    start('Old')
    vi.advanceTimersByTime(150)
    expect(displayedText.value).toBe('Old')

    start('New')
    expect(displayedText.value).toBe('')
    vi.advanceTimersByTime(150)
    expect(displayedText.value).toBe('New')
  })
})
