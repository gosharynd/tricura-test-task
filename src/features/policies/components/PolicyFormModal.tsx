import { useEffect, useCallback, memo } from 'react'
import { useForm, useFieldArray, useWatch, type Control, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import DateInput from '@/components/common/DateInput'
import FloatingInput from '@/components/common/FloatingInput'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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
  onDelete?: () => void
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

const PolicyFormModal = ({ open, onOpenChange, mode, policy, onSubmit, onDelete, isPending }: PolicyFormModalProps) => {
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
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Policy' : 'Edit Policy'}</DialogTitle>
          {mode === 'edit' && policy && (
            <p className="text-[13px] text-black/60">{policy.id}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          {/* Account */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6">Account</h5>
            <div className="grid grid-cols-3 gap-3">
              <FloatingInput legend="Account name" error={errors.accountName?.message}>
                <input
                  {...register('accountName')}
                  placeholder="Account name"
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
              <FloatingInput legend="Region" error={errors.region?.message}>
                <Select value={watch('region')} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-full w-full !h-auto border-0 p-0 shadow-none focus:ring-0 text-[13px]">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FloatingInput>
              <FloatingInput legend="Facility count" error={errors.facilityCount?.message}>
                <input
                  type="number"
                  {...register('facilityCount', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
            </div>
          </div>

          {/* Renewal */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6">Renewal</h5>
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput legend="Effective date" error={errors.effectiveDate?.message}>
                <DateInput value={watch('effectiveDate') || undefined} onChange={handleEffectiveDateChange} variant="inline" />
              </FloatingInput>
              <FloatingInput legend="Days until renewal (computed)" error={errors.daysUntilRenewal?.message}>
                <input
                  type="number"
                  {...register('daysUntilRenewal', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6">Financials</h5>
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput legend="Premium ($)" error={errors.premium?.message}>
                <input
                  type="number"
                  {...register('premium', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
              <FloatingInput legend="Claims total ($)" error={errors.claimsTotal?.message}>
                <input
                  type="number"
                  {...register('claimsTotal', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
            </div>
          </div>

          {/* Reimbursement Risk (under Financials — no separator) */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6">Reimbursement Risk</h5>
            <div className="max-w-[180px]">
              <FloatingInput legend="Value" error={errors.reimbursementRisk?.message}>
                <input
                  type="number"
                  step={RISK_RANGE.step}
                  min={RISK_RANGE.min}
                  max={RISK_RANGE.max}
                  {...register('reimbursementRisk', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
            </div>
            <Slider
              min={RISK_RANGE.min}
              max={RISK_RANGE.max}
              step={RISK_RANGE.step}
              value={[riskValue]}
              onValueChange={handleRiskSliderChange}
            />
            <div className="flex justify-between text-[11px] text-black/60 tabular-nums">
              <span>0.00</span>
              <span>1.00</span>
            </div>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6">Compliance</h5>
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput legend="Missing documents">
                <input
                  type="number"
                  {...register('missingDocuments', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
              <FloatingInput legend="Expired documents">
                <input
                  type="number"
                  {...register('expiredDocuments', { valueAsNumber: true })}
                  className="w-full text-[13px] text-black/87 bg-transparent outline-none placeholder:text-black/38"
                />
              </FloatingInput>
            </div>
          </div>

          {/* Pending Reviews (under Compliance — no separator) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60">Pending Reviews</span>
              <button type="button" onClick={handleAddReview} className="text-xs font-medium uppercase tracking-wide text-primary hover:text-primary-hover">
                + Add Review
              </button>
            </div>
            {fields.map((field, idx) => (
              <PendingReviewField
                key={field.id}
                index={idx}
                control={control}
                setValue={setValue}
                onRemove={remove}
                errors={errors}
              />
            ))}
          </div>

          <DialogFooter className="flex-row items-center sm:justify-between border-t border-black/12 pt-4">
            {mode === 'edit' && onDelete ? (
              <Button type="button" variant="ghost" onClick={onDelete} disabled={isPending} className="uppercase text-xs font-medium tracking-wide text-black/60 hover:text-danger hover:bg-danger-bg">
                Delete policy
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isPending} className="uppercase text-xs font-medium tracking-wide">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary-hover text-white uppercase text-xs font-medium tracking-wide">
                {isPending ? 'Saving...' : mode === 'create' ? 'Create policy' : 'Save changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Extracted to avoid inline arrows in .map()
type PendingReviewFieldProps = {
  index: number
  control: Control<PolicyFormData>
  setValue: ReturnType<typeof useForm<PolicyFormData>>['setValue']
  onRemove: (index: number) => void
  errors: FieldErrors<PolicyFormData>
}

const PendingReviewField = memo(({ index, control, setValue, onRemove, errors }: PendingReviewFieldProps) => {
  const review = useWatch({ control, name: `pendingReviews.${index}` })

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
    <div className="flex items-center gap-2">
      <div className="flex-[2]">
        <FloatingInput legend="Type" error={errors.pendingReviews?.[index]?.type?.message}>
          <Select value={review.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full w-full !h-auto border-0 p-0 shadow-none focus:ring-0 text-[13px]">
              <SelectValue placeholder="Review type" />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FloatingInput>
      </div>
      <div className="flex-1">
        <FloatingInput legend="Due date" error={errors.pendingReviews?.[index]?.dueDate?.message}>
          <DateInput value={review.dueDate || undefined} onChange={handleDueDateChange} placeholder="Due date" variant="inline" />
        </FloatingInput>
      </div>
      <div className="flex-1">
        <FloatingInput legend="Severity" error={errors.pendingReviews?.[index]?.severity?.message}>
          <Select value={review.severity} onValueChange={handleSeverityChange}>
            <SelectTrigger className="w-full w-full !h-auto border-0 p-0 shadow-none focus:ring-0 text-[13px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FloatingInput>
      </div>
      <button type="button" onClick={handleRemove} className="text-black/38 hover:text-black/60">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
})

export default PolicyFormModal
