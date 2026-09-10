export interface ScrollNoiseTracker {
  update: (scrollY: number, frameMs: number) => number
}

const VELOCITY_SCALE = 3.2 // px/ms de scroll pour atteindre l'intensité max
const RISE_RATE = 0.45
const FALL_RATE = 0.03
const VELOCITY_SMOOTHING = 0.5
const INTENSITY_CURVE = 0.65 // < 1 : sensible dès les vitesses moyennes

export function createScrollNoiseTracker(initialScrollY = 0): ScrollNoiseTracker {
  let lastScrollY = initialScrollY
  let velocity = 0
  let intensity = 0

  function update(scrollY: number, frameMs: number): number {
    const dy = Math.abs(scrollY - lastScrollY)
    lastScrollY = scrollY
    const instantVelocity = frameMs > 0 ? dy / frameMs : 0
    velocity += (instantVelocity - velocity) * VELOCITY_SMOOTHING

    const raw = Math.max(0, Math.min(1, velocity / VELOCITY_SCALE))
    const target = Math.pow(raw, INTENSITY_CURVE)
    const rate = target > intensity ? RISE_RATE : FALL_RATE
    intensity += (target - intensity) * rate

    return intensity
  }

  return { update }
}
