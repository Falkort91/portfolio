export interface StageSegment {
  kind: 'active' | 'transition'
  index: number
  start: number
  length: number
}

export interface StageLayout {
  segments: StageSegment[]
  totalLength: number
}

export function ownScrollFor(contentHeight: number, stageHeight: number): number {
  return Math.max(0, contentHeight - stageHeight)
}

export function computeStageLayout(
  contentHeights: number[],
  stageHeight: number,
  dwellRatio: number | number[],
  transitionRatio: number,
): StageLayout {
  const segments: StageSegment[] = []
  let cursor = 0
  const transitionPx = stageHeight * transitionRatio

  for (let i = 0; i < contentHeights.length; i++) {
    const ratio = Array.isArray(dwellRatio) ? dwellRatio[i]! : dwellRatio
    const dwellPx = stageHeight * ratio
    const own = ownScrollFor(contentHeights[i]!, stageHeight)
    const length = Math.max(own, dwellPx)
    segments.push({ kind: 'active', index: i, start: cursor, length })
    cursor += length

    if (i < contentHeights.length - 1) {
      segments.push({ kind: 'transition', index: i, start: cursor, length: transitionPx })
      cursor += transitionPx
    }
  }

  return { segments, totalLength: cursor }
}

export function findStageSegment(layout: StageLayout, scrolled: number): { segment: StageSegment, t: number } {
  const clamped = Math.max(0, Math.min(scrolled, layout.totalLength))

  for (const segment of layout.segments) {
    if (clamped < segment.start + segment.length) {
      const t = segment.length > 0 ? (clamped - segment.start) / segment.length : 1
      return { segment, t: Math.max(0, Math.min(1, t)) }
    }
  }

  // Toujours défini : computeStageLayout ne produit un layout vide que si contentHeights
  // l'est, ce qui n'arrive jamais en usage réel (toujours les 5 sections).
  const last = layout.segments[layout.segments.length - 1]!
  return { segment: last, t: 1 }
}
