import { useEffect, useCallback, memo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import DateInput from '@/components/common/DateInput'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { REGIONS, SEVERITIES, REVIEW_TYPES, RISK_RANGE } from '../constants'
import { PolicyFormSchema, DEFAULT_FORM_VALUES } from './PolicyFormModal.schema'
import type { PolicyFormData } from './PolicyFormModal.schema'
import type { Policy } from '../types'

type PolicyFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  policy?: Policy | null
  onSubmit: (data: PolicyFormData) => void
  isPending: boolean
}

const policyToFormData = (policy: Policy): PolicyFormData => ({
  accountName: policy.account.name,
  region: policy.account.region,
  facilityCount: policy.account.facilityCount,
  effectiveDate: policy.renewal.effectiveDate,
  daysUntilRenewal: policy.renewal.daysUntilRenewal,
  premium: policy.financials.premium,
  claimsTotal: policy.financials.claimsTotal,
  reimbursementRisk: policy.financials.reimbursementRisk,
  missingDocuments: policy.compliance.missingDocuments,
  expiredDocuments: policy.compliance.expiredDocuments,
  pendingReviews: policy.compliance.pendingReviews.map((r) => ({
    type: r.type,
    dueDate: r.dueDate,
    severity: r.severity,
  })),
})

const PolicyFormModal = ({ open, onOpenChange, mode, policy, onSubmit, isPending }: PolicyFormModalProps) => {
  const {
    register, handleSubmit, control, reset, setValue, watch,
    formState: { errors },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(PolicyFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'pendingReviews' })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && policy) {
      reset(policyToFormData(policy))
    } else {
      reset(DEFAULT_FORM_VALUES)
    }
  }, [open, mode, policy, reset])

  const riskValue = watch('reimbursementRisk')

  const handleAddReview = useCallback(() => {
    append({ type: '', dueDate: '', severity: '' })
  }, [append])

  const handleRegionChange = useCallback((v: string) => {
    setValue('region', v, { shouldValidate: true })
  }, [setValue])

  const handleRiskSliderChange = useCallback(([v]: number[]) => {
    setValue('reimbursementRisk', v, { shouldValidate: true })
  }, [setValue])

  const handleEffectiveDateChange = useCallback((value: string | undefined) => {
    setValue('effectiveDate', value ?? '', { shouldValidate: true })
  }, [setValue])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[85vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Policy' : 'Edit Policy'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60">Account</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Account Name</label>
                <Input {...register('accountName')} placeholder="Account name" />
                {errors.accountName && <p className="text-xs text-red-500">{errors.accountName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Facilities</label>
                <Input type="number" {...register('facilityCount', { valueAsNumber: true })} />
                {errors.facilityCount && <p className="text-xs text-red-500">{errors.facilityCount.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Region</label>
              <Select value={watch('region')} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && <p className="text-xs text-red-500">{errors.region.message}</p>}
            </div>
          </div>

          <Separator />

          {/* Renewal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60">Renewal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Effective Date</label>
                <DateInput value={watch('effectiveDate') || undefined} onChange={handleEffectiveDateChange} />
                {errors.effectiveDate && <p className="text-xs text-red-500">{errors.effectiveDate.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Days Until Renewal</label>
                <Input type="number" {...register('daysUntilRenewal', { valueAsNumber: true })} />
                {errors.daysUntilRenewal && <p className="text-xs text-red-500">{errors.daysUntilRenewal.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Financials */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60">Financials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Premium ($)</label>
                <Input type="number" {...register('premium', { valueAsNumber: true })} />
                {errors.premium && <p className="text-xs text-red-500">{errors.premium.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Claims Total ($)</label>
                <Input type="number" {...register('claimsTotal', { valueAsNumber: true })} />
                {errors.claimsTotal && <p className="text-xs text-red-500">{errors.claimsTotal.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Reimbursement Risk */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60">Reimbursement Risk</h4>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                step={RISK_RANGE.step}
                min={RISK_RANGE.min}
                max={RISK_RANGE.max}
                className="w-24"
                {...register('reimbursementRisk', { valueAsNumber: true })}
              />
              <div className="flex-1">
                <Slider
                  min={RISK_RANGE.min}
                  max={RISK_RANGE.max}
                  step={RISK_RANGE.step}
                  value={[riskValue]}
                  onValueChange={handleRiskSliderChange}
                />
              </div>
            </div>
            {errors.reimbursementRisk && <p className="text-xs text-red-500">{errors.reimbursementRisk.message}</p>}
          </div>

          <Separator />

          {/* Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60">Compliance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Missing Documents</label>
                <Input type="number" {...register('missingDocuments', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Expired Documents</label>
                <Input type="number" {...register('expiredDocuments', { valueAsNumber: true })} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pending Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60">Pending Reviews</h4>
              <button type="button" onClick={handleAddReview} className="text-xs font-semibold uppercase tracking-wide text-[#1976d2] hover:text-[#1565c0]">
                + Add Review
              </button>
            </div>
            {fields.map((field, idx) => (
              <PendingReviewField
                key={field.id}
                index={idx}
                watch={watch}
                setValue={setValue}
                onRemove={remove}
              />
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending} className="uppercase text-xs font-semibold tracking-wide">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#1976d2] hover:bg-[#1565c0] text-white uppercase text-xs font-semibold tracking-wide">
              {isPending ? 'Saving...' : mode === 'create' ? 'Create Policy' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Extracted to avoid inline arrows in .map()
type PendingReviewFieldProps = {
  index: number
  watch: ReturnType<typeof useForm<PolicyFormData>>['watch']
  setValue: ReturnType<typeof useForm<PolicyFormData>>['setValue']
  onRemove: (index: number) => void
}

const PendingReviewField = memo(({ index, watch, setValue, onRemove }: PendingReviewFieldProps) => {
  const handleTypeChange = useCallback((v: string) => {
    setValue(`pendingReviews.${index}.type`, v, { shouldValidate: true })
  }, [setValue, index])

  const handleSeverityChange = useCallback((v: string) => {
    setValue(`pendingReviews.${index}.severity`, v, { shouldValidate: true })
  }, [setValue, index])

  const handleDueDateChange = useCallback((value: string | undefined) => {
    setValue(`pendingReviews.${index}.dueDate`, value ?? '', { shouldValidate: true })
  }, [setValue, index])

  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [onRemove, index])

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Select value={watch(`pendingReviews.${index}.type`)} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Review type" />
          </SelectTrigger>
          <SelectContent>
            {REVIEW_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[160px] shrink-0">
        <DateInput value={watch(`pendingReviews.${index}.dueDate`) || undefined} onChange={handleDueDateChange} placeholder="Due date" />
      </div>
      <div className="w-[120px] shrink-0">
        <Select value={watch(`pendingReviews.${index}.severity`)} onValueChange={handleSeverityChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button type="button" onClick={handleRemove} className="text-black/40 hover:text-black/60">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
})

export default PolicyFormModal
