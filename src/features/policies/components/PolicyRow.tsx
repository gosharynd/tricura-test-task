import { useCallback, memo } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import RiskBadge from './RiskBadge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PolicyListItem } from '../types'

type PolicyRowProps = {
  policy: PolicyListItem
  isExpanded: boolean
  onToggle: () => void
}

const PolicyRow = memo(({ policy, isExpanded, onToggle }: PolicyRowProps) => {
  const arrow = isExpanded ? '▾' : '▸'

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }, [onToggle])

  return (
    <TableRow
      className="cursor-pointer"
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
      data-policy-id={policy.id}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
    >
      <TableCell className="w-8 px-2">
        <span className="text-[13px] text-black/60" aria-hidden="true">{arrow}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-black/87">{policy.accountName}</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-black/60">{policy.id}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-full border border-black/60 px-2 h-[22px] text-[11px] font-semibold tracking-wide text-black/60">
          {policy.region}
        </span>
      </TableCell>
      <TableCell className="text-center tabular-nums">{policy.facilityCount}</TableCell>
      <TableCell className="tabular-nums">{formatDate(policy.effectiveDate)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatCurrency(policy.premium)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatCurrency(policy.claimsTotal)}</TableCell>
      <TableCell>
        <RiskBadge reimbursementRisk={policy.reimbursementRisk} />
      </TableCell>
    </TableRow>
  )
})

export default PolicyRow
