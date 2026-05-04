import { ChevronRight, ChevronDown } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import RiskBadge from './RiskBadge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PolicyListItem } from '../types'

type PolicyRowProps = {
  policy: PolicyListItem
  isExpanded: boolean
  onToggle: () => void
}

const PolicyRow = ({ policy, isExpanded, onToggle }: PolicyRowProps) => {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

  return (
    <TableRow
      className="cursor-pointer"
      aria-expanded={isExpanded}
      onClick={onToggle}
    >
      <TableCell className="w-8">
        <ChevronIcon className="h-4 w-4 text-muted-foreground" />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{policy.accountName}</span>
          <span className="text-xs text-muted-foreground">POL-{policy.id}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
          {policy.region}
        </span>
      </TableCell>
      <TableCell className="text-center">{policy.facilityCount}</TableCell>
      <TableCell>{formatDate(policy.effectiveDate)}</TableCell>
      <TableCell>{formatCurrency(policy.premium)}</TableCell>
      <TableCell>{formatCurrency(policy.claimsTotal)}</TableCell>
      <TableCell>
        <RiskBadge reimbursementRisk={policy.reimbursementRisk} />
      </TableCell>
    </TableRow>
  )
}

export default PolicyRow
