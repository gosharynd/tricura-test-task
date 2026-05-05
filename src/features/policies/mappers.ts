import type { PolicyFormData } from './components/PolicyFormModal.schema'
import type { CreatePolicyInput, Region, ReviewType, Severity } from './types'

export const formDataToApiPayload = (data: PolicyFormData): CreatePolicyInput => ({
  account: { name: data.accountName, region: data.region as Region, facilityCount: data.facilityCount },
  renewal: { effectiveDate: data.effectiveDate, daysUntilRenewal: data.daysUntilRenewal },
  financials: { premium: data.premium, claimsTotal: data.claimsTotal, reimbursementRisk: data.reimbursementRisk },
  compliance: {
    missingDocuments: data.missingDocuments,
    expiredDocuments: data.expiredDocuments,
    pendingReviews: data.pendingReviews.map((r) => ({ type: r.type as ReviewType, dueDate: r.dueDate, severity: r.severity as Severity })),
  },
})
