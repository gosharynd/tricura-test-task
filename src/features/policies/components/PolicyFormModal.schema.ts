import { z } from 'zod'
import { REGIONS, SEVERITIES, REVIEW_TYPES } from '../constants'

const PendingReviewSchema = z.object({
  type: z.enum(REVIEW_TYPES as [string, ...string[]], { message: 'Review type is required' }),
  dueDate: z.string().min(1, 'Due date is required'),
  severity: z.enum(SEVERITIES as [string, ...string[]], { message: 'Severity is required' }),
})

export const PolicyFormSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  region: z.enum(REGIONS as [string, ...string[]], { message: 'Region is required' }),
  facilityCount: z.number().int().min(1, 'At least 1 facility'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  daysUntilRenewal: z.number().int(),
  premium: z.number().min(0, 'Premium must be positive'),
  claimsTotal: z.number().min(0, 'Claims must be positive'),
  reimbursementRisk: z.number().min(0).max(1, 'Risk must be 0–1'),
  missingDocuments: z.number().int().min(0),
  expiredDocuments: z.number().int().min(0),
  pendingReviews: z.array(PendingReviewSchema),
})

export type PolicyFormData = z.infer<typeof PolicyFormSchema>

// Region defaults to empty string — Zod validation catches it on submit with "Region is required"
export const DEFAULT_FORM_VALUES = {
  accountName: '',
  region: '',
  facilityCount: 1,
  effectiveDate: '',
  daysUntilRenewal: 0,
  premium: 0,
  claimsTotal: 0,
  reimbursementRisk: 0,
  missingDocuments: 0,
  expiredDocuments: 0,
  pendingReviews: [],
}
