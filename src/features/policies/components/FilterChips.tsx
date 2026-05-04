import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PolicyFilters } from '../filters/schema'
import { formatCurrency } from '@/lib/format'

type FilterChipsProps = {
  filters: PolicyFilters
  onRemove: <K extends keyof PolicyFilters>(key: K) => void
  onClearAll: () => void
}

type ChipDef = {
  key: keyof PolicyFilters
  label: string
  removeKeys: (keyof PolicyFilters)[]
}

const formatMonth = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const buildChips = (filters: PolicyFilters): ChipDef[] => {
  const chips: ChipDef[] = []

  if (filters.region && filters.region.length > 0) {
    chips.push({ key: 'region', label: `Region: ${filters.region.join(', ')}`, removeKeys: ['region'] })
  }
  if (filters.reimbursementRiskMin !== undefined || filters.reimbursementRiskMax !== undefined) {
    const min = filters.reimbursementRiskMin?.toFixed(2) ?? '0.00'
    const max = filters.reimbursementRiskMax?.toFixed(2) ?? '1.00'
    chips.push({ key: 'reimbursementRiskMin', label: `Risk: ${min} – ${max}`, removeKeys: ['reimbursementRiskMin', 'reimbursementRiskMax'] })
  }
  if (filters.effectiveDateFrom || filters.effectiveDateTo) {
    const from = filters.effectiveDateFrom ? formatMonth(filters.effectiveDateFrom) : '...'
    const to = filters.effectiveDateTo ? formatMonth(filters.effectiveDateTo) : '...'
    chips.push({ key: 'effectiveDateFrom', label: `Effective: ${from} – ${to}`, removeKeys: ['effectiveDateFrom', 'effectiveDateTo'] })
  }
  if (filters.premiumMin !== undefined || filters.premiumMax !== undefined) {
    const min = filters.premiumMin !== undefined ? formatCurrency(filters.premiumMin) : '$0'
    const max = filters.premiumMax !== undefined ? formatCurrency(filters.premiumMax) : '...'
    chips.push({ key: 'premiumMin', label: `Premium: ${min} – ${max}`, removeKeys: ['premiumMin', 'premiumMax'] })
  }
  if (filters.claimsTotalMin !== undefined || filters.claimsTotalMax !== undefined) {
    const min = filters.claimsTotalMin !== undefined ? formatCurrency(filters.claimsTotalMin) : '$0'
    const max = filters.claimsTotalMax !== undefined ? formatCurrency(filters.claimsTotalMax) : '...'
    chips.push({ key: 'claimsTotalMin', label: `Claims: ${min} – ${max}`, removeKeys: ['claimsTotalMin', 'claimsTotalMax'] })
  }

  return chips
}

const FilterChips = ({ filters, onRemove, onClearAll }: FilterChipsProps) => {
  const chips = buildChips(filters)
  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {chip.label}
          <button type="button" onClick={() => chip.removeKeys.forEach((k) => onRemove(k))} className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs uppercase">Clear all</Button>
    </div>
  )
}

export default FilterChips
