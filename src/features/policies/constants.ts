import type { Region, Severity, ReviewType } from './types'

// --- Domain values ---

export const REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
export const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']
export const REVIEW_TYPES: ReviewType[] = [
  'License', 'Staff Training', 'Incident Report', 'Billing Documentation',
  'Care Plan', 'Medication Log', 'Facility Inspection', 'Insurance Certificate',
]

// --- Pagination ---

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
export const DEFAULT_PAGE_SIZE = 20
export const MAX_VISIBLE_PAGES = 5

// --- Filter slider ranges ---

export const PREMIUM_RANGE = { min: 0, max: 1_000_000, step: 10_000 } as const
export const CLAIMS_RANGE = { min: 0, max: 1_000_000, step: 10_000 } as const
export const RISK_RANGE = { min: 0, max: 1, step: 0.01 } as const

// --- Table columns ---

export const TABLE_COLUMN_COUNT = 8
