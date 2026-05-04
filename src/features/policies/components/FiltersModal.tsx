import { useState, useEffect, useCallback } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import RangeSlider from '@/components/common/RangeSlider'
import { REGIONS } from '../constants'
import { formatCurrency } from '@/lib/format'
import type { PolicyFilters } from '../filters/schema'

type FiltersModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: PolicyFilters
  onApply: (filters: PolicyFilters) => void
}

const FiltersModal = ({ open, onOpenChange, filters, onApply }: FiltersModalProps) => {
  const [draft, setDraft] = useState<PolicyFilters>(filters)

  useEffect(() => {
    if (open) {
      setDraft(filters)
    }
  }, [open, filters])

  const updateDraft = useCallback(<K extends keyof PolicyFilters>(key: K, value: PolicyFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleRegionToggle = useCallback((region: string, checked: boolean) => {
    setDraft((prev) => {
      const current = prev.region ?? []
      const next = checked
        ? [...current, region]
        : current.filter((r) => r !== region)
      return { ...prev, region: next.length > 0 ? next : undefined }
    })
  }, [])

  const handleReset = useCallback(() => {
    setDraft({})
  }, [])

  const handleApply = useCallback(() => {
    onApply(draft)
    onOpenChange(false)
  }, [draft, onApply, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Narrow the policy list. Filters are combined with AND.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Region */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Region
            </label>
            <div className="flex flex-wrap gap-4">
              {REGIONS.map((region) => (
                <label key={region} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={(draft.region ?? []).includes(region)}
                    onCheckedChange={(checked) => handleRegionToggle(region, !!checked)}
                  />
                  {region}
                </label>
              ))}
            </div>
          </div>

          {/* Effective Date Range */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Effective Date Range
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={draft.effectiveDateFrom ?? ''}
                  onChange={(e) => updateDraft('effectiveDateFrom', e.target.value || undefined)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={draft.effectiveDateTo ?? ''}
                  onChange={(e) => updateDraft('effectiveDateTo', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Premium Range */}
          <RangeSlider
            label="Premium Range"
            min={0}
            max={1_000_000}
            step={10_000}
            value={[draft.premiumMin, draft.premiumMax]}
            onChange={([min, max]) => {
              setDraft((prev) => ({ ...prev, premiumMin: min, premiumMax: max }))
            }}
            formatLabel={formatCurrency}
          />

          {/* Claims Range */}
          <RangeSlider
            label="Claims Range"
            min={0}
            max={1_000_000}
            step={10_000}
            value={[draft.claimsTotalMin, draft.claimsTotalMax]}
            onChange={([min, max]) => {
              setDraft((prev) => ({ ...prev, claimsTotalMin: min, claimsTotalMax: max }))
            }}
            formatLabel={formatCurrency}
          />

          {/* Reimbursement Risk Range */}
          <RangeSlider
            label="Reimbursement Risk"
            min={0}
            max={1}
            step={0.01}
            value={[draft.reimbursementRiskMin, draft.reimbursementRiskMax]}
            onChange={([min, max]) => {
              setDraft((prev) => ({ ...prev, reimbursementRiskMin: min, reimbursementRiskMax: max }))
            }}
            formatLabel={(v) => v.toFixed(2)}
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleReset}>
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FiltersModal
