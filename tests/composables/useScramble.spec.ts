import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScramble } from '../../app/composables/useScramble'

describe('useScramble', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals characters left to right, masking the rest with the charset', () => {
    const { displayedText, isDone, start } = useScramble({ speed: 50, charset: 'X', random: () => 0 })

    start('Hi')

    expect(displayedText.value).toBe('XX')
    expect(isDone.value).toBe(false)

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('HX')

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('Hi')
    expect(isDone.value).toBe(true)
  })

  it('keeps spaces visible without waiting for their turn', () => {
    const { displayedText, start } = useScramble({ speed: 50, charset: 'X', random: () => 0 })

    start('A B')

    expect(displayedText.value).toBe('X X')

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('A X')
  })

  it('restarts cleanly when called again with new text', () => {
    const { displayedText, start } = useScramble({ speed: 50, charset: 'X', random: () => 0 })

    start('Old')
    vi.advanceTimersByTime(150)
    expect(displayedText.value).toBe('Old')

    start('New')
    expect(displayedText.value).toBe('XXX')
    vi.advanceTimersByTime(150)
    expect(displayedText.value).toBe('New')
  })

  it('shows the final text immediately when started in instant mode', () => {
    const { displayedText, isDone, start } = useScramble({ speed: 50, charset: 'X', random: () => 0 })

    start('Skip', true)

    expect(displayedText.value).toBe('Skip')
    expect(isDone.value).toBe(true)

    vi.advanceTimersByTime(200)
    expect(displayedText.value).toBe('Skip')
  })
})
