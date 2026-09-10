import { describe, expect, it, vi } from 'vitest'

import html2canvas from 'html2canvas'
import { captureElement } from '../../app/utils/sectionCapture'

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue('fake-canvas'),
}))

describe('captureElement', () => {
  it('calls html2canvas with a transparent background and no logging', async () => {
    const el = document.createElement('div')

    const result = await captureElement(el)

    expect(html2canvas).toHaveBeenCalledWith(el, expect.objectContaining({
      backgroundColor: null,
      logging: false,
    }))
    expect(result).toBe('fake-canvas')
  })

  it('caps the capture scale at 2x even on higher-DPR displays', async () => {
    const originalDpr = window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true })

    await captureElement(document.createElement('div'))

    expect(html2canvas).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ scale: 2 }))
    Object.defineProperty(window, 'devicePixelRatio', { value: originalDpr, configurable: true })
  })
})
