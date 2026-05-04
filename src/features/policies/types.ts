export type Region = 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type ReviewType =
  | 'License'
  | 'Staff Training'
  | 'Incident Report'
  | 'Billing Documentation'
  | 'Care Plan'
  | 'Medication Log'
  | 'Facility Inspection'
  | 'Insurance Certificate'

export type RiskLevel = 'High' | 'Medium' | 'Low'

export type PendingReview = {
  type: ReviewType
  dueDate: string
  severity: Severity
}

export type Policy = {
  id: string
  account: {
    name: string
    region: Region
    facilityCount: number
  }
  renewal: {
    effectiveDate: string
    daysUntilRenewal: number
  }
  compliance: {
    missingDocuments: number
    expiredDocuments: number
    pendingReviews: PendingReview[]
  }
  financials: {
    premium: number
    claimsTotal: number
    reimbursementRisk: number
  }
}

export type PolicyListItem = {
  id: string
  accountName: string
  region: Region
  facilityCount: number
  effectiveDate: string
  premium: number
  claimsTotal: number
  reimbursementRisk: number
}

export type PoliciesListResponse = {
  data: PolicyListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CreatePolicyInput = Omit<Policy, 'id'>

export type UpdatePolicyInput = {
  account?: Partial<Policy['account']>
  renewal?: Partial<Policy['renewal']>
  compliance?: {
    missingDocuments?: number
    expiredDocuments?: number
    pendingReviews?: PendingReview[]
  }
  financials?: Partial<Policy['financials']>
}
