import { describe, expect, it } from 'vitest'
import { computeStageLayout, findStageSegment, ownScrollFor } from '../../app/utils/scrollStageLayout'

describe('ownScrollFor', () => {
  it('returns 0 when content fits within the stage', () => {
    expect(ownScrollFor(800, 900)).toBe(0)
  })

  it('returns the excess height when content is taller than the stage', () => {
    expect(ownScrollFor(1500, 900)).toBe(600)
  })
})

describe('computeStageLayout', () => {
  it('builds alternating active/transition segments for N sections', () => {
    const layout = computeStageLayout([900, 900, 900], 900, 0.5, 1.2)

    expect(layout.segments.map((s) => s.kind)).toEqual([
      'active', 'transition', 'active', 'transition', 'active',
    ])
  })

  it('active segment length is at least the dwell distance even when content fits', () => {
    const layout = computeStageLayout([900], 900, 0.5, 1.2)

    expect(layout.segments[0].length).toBe(450)
  })

  it('active segment length grows to match own-scroll for tall content', () => {
    const layout = computeStageLayout([1800], 900, 0.5, 1.2)

    expect(layout.segments[0].length).toBe(900)
  })

  it('transition segments use the transition ratio', () => {
    const layout = computeStageLayout([900, 900], 900, 0.5, 1.2)
    const transition = layout.segments.find((s) => s.kind === 'transition')

    expect(transition?.length).toBe(1080)
  })

  it('totalLength equals the sum of all segment lengths', () => {
    const layout = computeStageLayout([900, 1800, 900], 900, 0.5, 1.2)
    const sum = layout.segments.reduce((acc, s) => acc + s.length, 0)

    expect(layout.totalLength).toBe(sum)
  })

  it('accepts a per-section dwell ratio array, e.g. no dwell for the first section', () => {
    const layout = computeStageLayout([900, 900], 900, [0, 0.5], 1.2)

    expect(layout.segments[0]!.length).toBe(0)
    expect(layout.segments[2]!.length).toBe(450)
  })
})

describe('findStageSegment', () => {
  const layout = computeStageLayout([900, 900], 900, 0.5, 1.2)
  // segments: active(0) 0-450, transition(0) 450-1530, active(1) 1530-1980

  it('finds the first active segment at the very start', () => {
    const { segment, t } = findStageSegment(layout, 0)

    expect(segment.kind).toBe('active')
    expect(segment.index).toBe(0)
    expect(t).toBe(0)
  })

  it('finds the transition segment mid-way through it, with correct local progress', () => {
    const { segment, t } = findStageSegment(layout, 450 + 540)

    expect(segment.kind).toBe('transition')
    expect(segment.index).toBe(0)
    expect(t).toBeCloseTo(0.5)
  })

  it('finds the last active segment at the very end, clamped to t=1', () => {
    const { segment, t } = findStageSegment(layout, 999999)

    expect(segment.kind).toBe('active')
    expect(segment.index).toBe(1)
    expect(t).toBe(1)
  })

  it('clamps negative scroll positions to the start', () => {
    const { segment, t } = findStageSegment(layout, -500)

    expect(segment.kind).toBe('active')
    expect(segment.index).toBe(0)
    expect(t).toBe(0)
  })
})
