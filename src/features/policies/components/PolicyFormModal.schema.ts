import { z } from 'zod'

const PendingReviewSchema = z.object({
  type: z.string().min(1, 'Review type is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  severity: z.string().min(1, 'Severity is required'),
})

export const PolicyFormSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  region: z.string().min(1, 'Region is required'),
  facilityCount: z.number().int().min(1, 'At least 1 facility'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  daysUntilRenewal: z.number().int().min(0),
  premium: z.number().min(0, 'Premium must be positive'),
  claimsTotal: z.number().min(0, 'Claims must be positive'),
  reimbursementRisk: z.number().min(0).max(1, 'Risk must be 0–1'),
  missingDocuments: z.number().int().min(0),
  expiredDocuments: z.number().int().min(0),
  pendingReviews: z.array(PendingReviewSchema),
})

export type PolicyFormData = z.infer<typeof PolicyFormSchema>

export const DEFAULT_FORM_VALUES: PolicyFormData = {
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
