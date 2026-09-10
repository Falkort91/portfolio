export type TimelineType = 'studies' | 'internship' | 'project'

export interface TimelineEntry {
  key: string
  period?: string
  type: TimelineType
  // Sous-projets dépliables (voir i18n `about.timeline.<key>.projects.<projectKey>`).
  projectKeys?: string[]
}

export const timelineEntries: TimelineEntry[] = [
  { key: 'studies', period: '10/2024 — 06/2026', type: 'studies' },
  {
    key: 'internship',
    period: '02/2026 — 05/2026',
    type: 'internship',
    projectKeys: ['erp', 'commande', 'shelly'],
  },
  // Pas de période : le TFE se conclut naturellement en fin d'année scolaire (voir studies).
  { key: 'tfe', type: 'project' },
]
