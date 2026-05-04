import { TableRow, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorState from '@/components/common/ErrorState'
import { formatCurrencyAbbr, formatDate, formatDateShort } from '@/lib/format'
import { SEVERITY_COLORS, RISK_COLORS, computeRiskLevel } from '../risk'
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

const PolicyDetail = ({ policy, isLoading, isError, error, onRetry, onEdit, onDelete: _onDelete }: PolicyDetailProps) => {
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
          {policy && !isLoading && !isError && (() => {
            const riskLevel = computeRiskLevel(policy.financials.reimbursementRisk)
            const riskBarColor = riskLevel === 'High' ? 'bg-red-500' : riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'

            return (
              <div className="grid grid-cols-3 divide-x">
                {/* Renewal & Account */}
                <div className="p-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider mb-4">
                    Renewal & Account
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Effective</div>
                      <div className="text-sm font-semibold mt-0.5">{formatDate(policy.renewal.effectiveDate)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Days to renewal</div>
                      <div className="text-sm font-semibold mt-0.5">{policy.renewal.daysUntilRenewal}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Region</div>
                      <div className="text-sm font-semibold mt-0.5">{policy.account.region}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Facilities</div>
                      <div className="text-sm font-semibold mt-0.5">{policy.account.facilityCount}</div>
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="p-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider mb-4">
                    Financials
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Premium</div>
                      <div className="text-xl font-bold mt-0.5">{formatCurrencyAbbr(policy.financials.premium)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Claims</div>
                      <div className="text-xl font-bold mt-0.5">{formatCurrencyAbbr(policy.financials.claimsTotal)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Reimbursement risk</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${RISK_COLORS[riskLevel]}`}>
                          {riskLevel}
                        </span>
                        <span className="text-sm">{policy.financials.reimbursementRisk.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${riskBarColor}`}
                        style={{ width: `${Math.min(policy.financials.reimbursementRisk * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider">
                      Compliance
                      <span className="font-normal text-muted-foreground">
                        {' '}· {policy.compliance.missingDocuments} missing · {policy.compliance.expiredDocuments} expired
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={onEdit}
                      className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    {policy.compliance.pendingReviews.map((review, idx) => (
                      <div key={idx} className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">{review.type}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Due {formatDateShort(review.dueDate)}
                          </div>
                        </div>
                        <span className={`text-xs font-medium flex items-center gap-1 ${SEVERITY_COLORS[review.severity]}`}>
                          <span>●</span>
                          {review.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default PolicyDetail
