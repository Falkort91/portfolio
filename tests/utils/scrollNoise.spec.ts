import { describe, expect, it } from 'vitest'
import { createScrollNoiseTracker } from '../../app/utils/scrollNoise'

describe('createScrollNoiseTracker', () => {
  it('starts at zero intensity with no movement', () => {
    const tracker = createScrollNoiseTracker(0)

    const intensity = tracker.update(0, 16)

    expect(intensity).toBe(0)
  })

  it('ramps up intensity when scrolling fast', () => {
    const tracker = createScrollNoiseTracker(0)
    let intensity = 0
    let scrollY = 0

    for (let i = 0; i < 20; i++) {
      scrollY += 50 // scroll rapide : 50px toutes les 16ms
      intensity = tracker.update(scrollY, 16)
    }

    expect(intensity).toBeGreaterThan(0.5)
  })

  it('decays gradually (not instantly) once scrolling stops', () => {
    const tracker = createScrollNoiseTracker(0)
    let scrollY = 0
    let intensity = 0

    for (let i = 0; i < 20; i++) {
      scrollY += 50
      intensity = tracker.update(scrollY, 16)
    }
    const intensityAtStop = intensity

    intensity = tracker.update(scrollY, 16) // même position : le scroll s'est arrêté

    expect(intensity).toBeLessThan(intensityAtStop)
    expect(intensity).toBeGreaterThan(intensityAtStop * 0.5)
  })

  it('eventually settles back near zero after scrolling stops', () => {
    const tracker = createScrollNoiseTracker(0)
    let scrollY = 0
    let intensity = 0

    for (let i = 0; i < 20; i++) {
      scrollY += 50
      intensity = tracker.update(scrollY, 16)
    }
    for (let i = 0; i < 200; i++) {
      intensity = tracker.update(scrollY, 16)
    }

    expect(intensity).toBeLessThan(0.01)
  })

  it('responds proportionally to slower scroll speeds', () => {
    const fastTracker = createScrollNoiseTracker(0)
    const slowTracker = createScrollNoiseTracker(0)
    let fastY = 0, slowY = 0
    let fastIntensity = 0, slowIntensity = 0

    for (let i = 0; i < 20; i++) {
      fastY += 50
      slowY += 5
      fastIntensity = fastTracker.update(fastY, 16)
      slowIntensity = slowTracker.update(slowY, 16)
    }

    expect(slowIntensity).toBeGreaterThan(0)
    expect(slowIntensity).toBeLessThan(fastIntensity)
  })
})
