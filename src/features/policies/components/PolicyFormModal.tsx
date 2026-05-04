import { useEffect, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { REGIONS, SEVERITIES, REVIEW_TYPES } from '../constants'
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

  const handleFormSubmit = useCallback((data: PolicyFormData) => {
    onSubmit(data)
  }, [onSubmit])

  const handleAddReview = useCallback(() => {
    append({ type: '', dueDate: '', severity: '' })
  }, [append])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Policy' : 'Edit Policy'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h4>
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
              <Select
                value={watch('region')}
                onValueChange={(v) => setValue('region', v, { shouldValidate: true })}
              >
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
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Renewal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Effective Date</label>
                <Input type="date" {...register('effectiveDate')} />
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
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financials</h4>
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
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reimbursement Risk</h4>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="w-24"
                {...register('reimbursementRisk', { valueAsNumber: true })}
              />
              <div className="flex-1">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[riskValue]}
                  onValueChange={([v]) => setValue('reimbursementRisk', v, { shouldValidate: true })}
                />
              </div>
            </div>
            {errors.reimbursementRisk && <p className="text-xs text-red-500">{errors.reimbursementRisk.message}</p>}
          </div>

          <Separator />

          {/* Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compliance</h4>
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
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pending Reviews</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddReview}>
                <Plus className="h-4 w-4 mr-1" />
                Add Review
              </Button>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-start gap-3 rounded-md border p-3">
                <div className="flex-1 space-y-2">
                  <Select
                    value={watch(`pendingReviews.${idx}.type`)}
                    onValueChange={(v) => setValue(`pendingReviews.${idx}.type`, v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Review type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEW_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" {...register(`pendingReviews.${idx}.dueDate`)} />
                    <Select
                      value={watch(`pendingReviews.${idx}.severity`)}
                      onValueChange={(v) => setValue(`pendingReviews.${idx}.severity`, v, { shouldValidate: true })}
                    >
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
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : mode === 'create' ? 'Create Policy' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PolicyFormModal
