import { useMemo, useCallback, memo } from 'react'
import { X } from 'lucide-react'
import type { PolicyFilters } from '../filters/schema'
import { formatCurrency, formatMonth } from '@/lib/format'

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
  const chips = useMemo(() => buildChips(filters), [filters])
  const hasChips = chips.length > 0

  if (!hasChips) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((chip) => (
        <FilterChip key={chip.key} chip={chip} onRemove={onRemove} />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium uppercase tracking-wide text-[#1976d2] hover:text-[#1565c0]"
      >
        Clear all
      </button>
    </div>
  )
}

// Extracted to avoid inline arrow in .map()
type FilterChipProps = {
  chip: ChipDef
  onRemove: <K extends keyof PolicyFilters>(key: K) => void
}

const FilterChip = memo(({ chip, onRemove }: FilterChipProps) => {
  const handleRemove = useCallback(() => {
    chip.removeKeys.forEach((k) => onRemove(k))
  }, [chip.removeKeys, onRemove])

  return (
    <span className="inline-flex items-center gap-1 bg-[#e1f5fe] text-[#0288d1] text-xs font-semibold px-2.5 h-6 rounded-full whitespace-nowrap">
      {chip.label}
      <button
        type="button"
        onClick={handleRemove}
        className="ml-0.5 hover:bg-[#b3e5fc] rounded-full p-0.5"
        aria-label={`Remove ${chip.label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
})

export default FilterChips
