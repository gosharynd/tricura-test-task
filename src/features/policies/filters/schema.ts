import { z } from 'zod'

export const PolicyFiltersSchema = z.object({
  search: z.string().optional(),
  region: z.array(z.string()).optional(),
  effectiveDateFrom: z.string().optional(),
  effectiveDateTo: z.string().optional(),
  premiumMin: z.number().optional(),
  premiumMax: z.number().optional(),
  claimsTotalMin: z.number().optional(),
  claimsTotalMax: z.number().optional(),
  reimbursementRiskMin: z.number().optional(),
  reimbursementRiskMax: z.number().optional(),
})

export type PolicyFilters = z.infer<typeof PolicyFiltersSchema>

export const DEFAULT_FILTERS: PolicyFilters = {}

export const isFilterActive = (filters: PolicyFilters): boolean => {
  return Object.values(filters).some((v) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== undefined && v !== ''
  })
}

export const activeFilterCount = (filters: PolicyFilters): number => {
  let count = 0
  if (filters.region && filters.region.length > 0) count++
  if (filters.effectiveDateFrom || filters.effectiveDateTo) count++
  if (filters.premiumMin !== undefined || filters.premiumMax !== undefined) count++
  if (filters.claimsTotalMin !== undefined || filters.claimsTotalMax !== undefined) count++
  if (filters.reimbursementRiskMin !== undefined || filters.reimbursementRiskMax !== undefined) count++
  return count
}
