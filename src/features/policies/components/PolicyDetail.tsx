import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorState from '@/components/common/ErrorState'
import RiskBadge from './RiskBadge'
import { formatCurrencyAbbr, formatDate } from '@/lib/format'
import { SEVERITY_COLORS, computeRiskLevel } from '../risk'
import type { Policy } from '../types'

type PolicyDetailProps = {
  policy?: Policy
  isLoading: boolean
  isError: boolean
  error?: Error | null
  onRetry: () => void
  onEdit: () => void
  onDelete: () => void
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-3 gap-6 p-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
)

const PolicyDetail = ({ policy, isLoading, isError, error, onRetry, onEdit, onDelete }: PolicyDetailProps) => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="p-0">
        <div className="border-t bg-muted/30">
          {isLoading && <LoadingSkeleton />}
          {isError && (
            <div className="p-6">
              <ErrorState
                title="Failed to load policy details"
                description={error?.message ?? 'An unexpected error occurred'}
                onRetry={onRetry}
              />
            </div>
          )}
          {policy && !isLoading && !isError && (
            <div className="grid grid-cols-3 gap-6 p-6">
              {/* Renewal & Account */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Renewal & Account
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Effective Date</dt>
                    <dd>{formatDate(policy.renewal.effectiveDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Days to Renewal</dt>
                    <dd>{policy.renewal.daysUntilRenewal}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Region</dt>
                    <dd>{policy.account.region}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Facilities</dt>
                    <dd>{policy.account.facilityCount}</dd>
                  </div>
                </dl>
              </div>

              {/* Financials */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Financials
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Premium</dt>
                    <dd className="font-medium">{formatCurrencyAbbr(policy.financials.premium)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Claims Total</dt>
                    <dd className="font-medium">{formatCurrencyAbbr(policy.financials.claimsTotal)}</dd>
                  </div>
                </dl>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reimbursement Risk</span>
                    <RiskBadge reimbursementRisk={policy.financials.reimbursementRisk} />
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${computeRiskLevel(policy.financials.reimbursementRisk) === 'High' ? 'bg-red-500' : computeRiskLevel(policy.financials.reimbursementRisk) === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(policy.financials.reimbursementRisk * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Compliance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Compliance &middot; {policy.compliance.missingDocuments} missing &middot; {policy.compliance.expiredDocuments} expired
                  </h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onDelete}>
                      Delete
                    </Button>
                  </div>
                </div>
                {policy.compliance.pendingReviews.length > 0 && (
                  <ul className="space-y-1.5">
                    {policy.compliance.pendingReviews.map((review, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="flex-1">{review.type}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(review.dueDate)}</span>
                        <span className={`text-xs font-medium ${SEVERITY_COLORS[review.severity]}`}>
                          {review.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default PolicyDetail
