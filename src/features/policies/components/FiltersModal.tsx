import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import DateInput from '@/components/common/DateInput'
import FloatingInput from '@/components/common/FloatingInput'
import RangeSlider from '@/components/common/RangeSlider'
import { REGIONS, PREMIUM_RANGE, CLAIMS_RANGE, RISK_RANGE } from '../constants'
import { formatInteger, formatDecimal } from '@/lib/format'
import type { PolicyFilters } from '../filters/schema'

type FiltersModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: PolicyFilters
  onApply: (filters: PolicyFilters) => void
}

const FiltersModal = ({ open, onOpenChange, filters, onApply }: FiltersModalProps) => {
  const [draft, setDraft] = useState<PolicyFilters>(filters)

  // Sync draft state when modal opens — intentional pattern for draft/apply modals
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) setDraft(filters) }, [open, filters])

  const handleRegionToggle = useCallback((region: string, checked: boolean) => {
    setDraft((prev) => {
      const current = prev.region ?? []
      const next = checked
        ? [...current, region]
        : current.filter((r) => r !== region)
      return { ...prev, region: next.length > 0 ? next : undefined }
    })
  }, [])

  const handleDateFromChange = useCallback((value: string | undefined) => {
    setDraft((prev) => ({ ...prev, effectiveDateFrom: value }))
  }, [])

  const handleDateToChange = useCallback((value: string | undefined) => {
    setDraft((prev) => ({ ...prev, effectiveDateTo: value }))
  }, [])

  const handlePremiumChange = useCallback(([min, max]: [number | undefined, number | undefined]) => {
    setDraft((prev) => ({ ...prev, premiumMin: min, premiumMax: max }))
  }, [])

  const handleClaimsChange = useCallback(([min, max]: [number | undefined, number | undefined]) => {
    setDraft((prev) => ({ ...prev, claimsTotalMin: min, claimsTotalMax: max }))
  }, [])

  const handleRiskChange = useCallback(([min, max]: [number | undefined, number | undefined]) => {
    setDraft((prev) => ({ ...prev, reimbursementRiskMin: min, reimbursementRiskMax: max }))
  }, [])

  const handleReset = useCallback(() => {
    setDraft({})
  }, [])

  const handleApply = useCallback(() => {
    onApply(draft)
    onOpenChange(false)
  }, [draft, onApply, onOpenChange])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const formatRiskLabel = useCallback((v: number) => v.toFixed(2), [])

  const formatCurrencyShort = useCallback((v: number) => {
    if (v >= 1_000_000) return `$${v / 1_000_000}M`
    if (v >= 1_000) return `$${v / 1_000}k`
    return `$${v}`
  }, [])

  const premiumValue = useMemo(
    (): [number | undefined, number | undefined] => [draft.premiumMin, draft.premiumMax],
    [draft.premiumMin, draft.premiumMax],
  )

  const claimsValue = useMemo(
    (): [number | undefined, number | undefined] => [draft.claimsTotalMin, draft.claimsTotalMax],
    [draft.claimsTotalMin, draft.claimsTotalMax],
  )

  const riskValue = useMemo(
    (): [number | undefined, number | undefined] => [draft.reimbursementRiskMin, draft.reimbursementRiskMax],
    [draft.reimbursementRiskMin, draft.reimbursementRiskMax],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Narrow the policy list. Filters are combined with AND.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Region */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6 mb-2.5">
              Region
            </h5>
            <div className="flex gap-4">
              {REGIONS.map((region) => (
                <RegionCheckbox
                  key={region}
                  region={region}
                  checked={(draft.region ?? []).includes(region)}
                  onToggle={handleRegionToggle}
                />
              ))}
            </div>
          </div>

          {/* Effective Date Range */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6 mb-2.5">
              Effective Date Range
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput legend="From">
                <DateInput value={draft.effectiveDateFrom} onChange={handleDateFromChange} variant="inline" />
              </FloatingInput>
              <FloatingInput legend="To">
                <DateInput value={draft.effectiveDateTo} onChange={handleDateToChange} variant="inline" />
              </FloatingInput>
            </div>
          </div>

          {/* Premium Range */}
          <RangeSlider
            label="Premium Range ($)"
            min={PREMIUM_RANGE.min}
            max={PREMIUM_RANGE.max}
            step={PREMIUM_RANGE.step}
            value={premiumValue}
            onChange={handlePremiumChange}
            formatLabel={formatCurrencyShort}
            formatValue={formatInteger}
          />

          {/* Claims Range */}
          <RangeSlider
            label="Total Claims Range ($)"
            min={CLAIMS_RANGE.min}
            max={CLAIMS_RANGE.max}
            step={CLAIMS_RANGE.step}
            value={claimsValue}
            onChange={handleClaimsChange}
            formatLabel={formatCurrencyShort}
            formatValue={formatInteger}
          />

          {/* Reimbursement Risk Range */}
          <RangeSlider
            label="Reimbursement Risk Range"
            min={RISK_RANGE.min}
            max={RISK_RANGE.max}
            step={RISK_RANGE.step}
            value={riskValue}
            onChange={handleRiskChange}
            formatLabel={formatRiskLabel}
            formatValue={formatDecimal}
          />
        </div>

        <DialogFooter className="flex-row items-center sm:justify-between border-t border-black/12 pt-4">
          <Button variant="ghost" onClick={handleReset} className="text-[#1976d2] uppercase text-xs font-medium tracking-wide">
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel} className="uppercase text-xs font-medium tracking-wide">
              Cancel
            </Button>
            <Button onClick={handleApply} className="bg-[#1976d2] hover:bg-[#1565c0] text-white uppercase text-xs font-semibold tracking-wide">
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Extracted to avoid inline arrow in .map()
type RegionCheckboxProps = {
  region: string
  checked: boolean
  onToggle: (region: string, checked: boolean) => void
}

const RegionCheckbox = memo(({ region, checked, onToggle }: RegionCheckboxProps) => {
  const handleChange = useCallback((checkedState: boolean | 'indeterminate') => {
    onToggle(region, !!checkedState)
  }, [onToggle, region])

  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={handleChange} />
      {region}
    </label>
  )
})

export default FiltersModal
