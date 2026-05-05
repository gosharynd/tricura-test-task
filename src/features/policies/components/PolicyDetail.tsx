import { useMemo } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorState from '@/components/common/ErrorState'
import { formatCurrencyAbbr, formatDate, formatDateShort } from '@/lib/format'
import { SEVERITY_COLORS, RISK_COLORS, computeRiskLevel } from '../risk'
import { TABLE_COLUMN_COUNT } from '../constants'
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

const PolicyDetail = ({ policy, isLoading, isError, error, onRetry, onEdit }: PolicyDetailProps) => {
  const riskLevel = useMemo(
    () => policy ? computeRiskLevel(policy.financials.reimbursementRisk) : null,
    [policy],
  )

  const riskBarColor = useMemo(
    () => riskLevel === 'High' ? 'bg-red-500' : riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500',
    [riskLevel],
  )

  const riskBarWidth = useMemo(
    () => policy ? `${Math.min(policy.financials.reimbursementRisk * 100, 100)}%` : '0%',
    [policy],
  )

  const showDetail = policy && !isLoading && !isError && riskLevel

  return (
    <TableRow>
      <TableCell colSpan={TABLE_COLUMN_COUNT} className="p-0">
        <div className="border-t border-black/12">
          {isLoading && <LoadingSkeleton />}
          {isError && (
            <div className="p-6">
              <ErrorState
                title="Couldn't load policy details"
                description="Something went wrong, try again in a moment."
                errorCode={error?.message}
                onRetry={onRetry}
              />
            </div>
          )}
          {showDetail && (
            <div className="grid grid-cols-3">
              {/* Renewal & Account */}
              <div className="p-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-black/60 mb-4">
                  Renewal & Account
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-black/60">Effective</div>
                    <div className="text-sm font-medium mt-0.5 text-black/87 tabular-nums">{formatDate(policy.renewal.effectiveDate)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-black/60">Days to renewal</div>
                    <div className={`text-sm font-medium mt-0.5 tabular-nums ${policy.renewal.daysUntilRenewal < 0 ? 'text-[#d32f2f]' : 'text-black/87'}`}>{policy.renewal.daysUntilRenewal}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-black/60">Region</div>
                    <div className="text-sm font-medium mt-0.5 text-black/87">{policy.account.region}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-black/60">Facilities</div>
                    <div className="text-sm font-medium mt-0.5 text-black/87 tabular-nums">{policy.account.facilityCount}</div>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="p-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-black/60 mb-4">
                  Financials
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-black/60">Premium</div>
                    <div className="text-lg font-semibold tracking-tight mt-0.5 tabular-nums">{formatCurrencyAbbr(policy.financials.premium)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-black/60">Claims</div>
                    <div className="text-lg font-semibold tracking-tight mt-0.5 tabular-nums">{formatCurrencyAbbr(policy.financials.claimsTotal)}</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] text-black/60">Reimbursement risk</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold tracking-wide px-2 h-[22px] inline-flex items-center rounded-full ${RISK_COLORS[riskLevel]}`}>
                        {riskLevel}
                      </span>
                      <span className="text-xs text-black/60 tabular-nums">{policy.financials.reimbursementRisk.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/6">
                    <div
                      className={`h-full rounded-full ${riskBarColor}`}
                      style={{ width: riskBarWidth }}
                    />
                  </div>
                </div>
              </div>

              {/* Compliance */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-black/60">
                    Compliance
                    <span className="font-normal text-black/60">
                      {' '}· {policy.compliance.missingDocuments} missing · {policy.compliance.expiredDocuments} expired
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="text-[11px] font-bold uppercase tracking-wider text-[#1976d2] hover:text-[#1565c0]"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  {policy.compliance.pendingReviews.map((review, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-medium text-black/87">{review.type}</div>
                        <div className="text-xs text-black/60 mt-0.5 tabular-nums">
                          Due {formatDateShort(review.dueDate)}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-[7px] h-5 inline-flex items-center rounded-full ${SEVERITY_COLORS[review.severity]}`}>
                        <span className="mr-1 opacity-85">●</span>
                        {review.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default PolicyDetail
