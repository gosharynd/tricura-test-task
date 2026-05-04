import type { Region, Severity, ReviewType } from './types'

export const REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
export const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']
export const REVIEW_TYPES: ReviewType[] = [
  'License', 'Staff Training', 'Incident Report', 'Billing Documentation',
  'Care Plan', 'Medication Log', 'Facility Inspection', 'Insurance Certificate',
]
