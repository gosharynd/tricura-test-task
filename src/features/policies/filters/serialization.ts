import type { PolicyFilters } from './schema'

export const filtersToSearchParams = (
  filters: PolicyFilters,
  page: number,
  limit: number,
): URLSearchParams => {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.region && filters.region.length > 0) {
    params.set('region', filters.region.join(','))
  }
  if (filters.effectiveDateFrom) params.set('effectiveDateFrom', filters.effectiveDateFrom)
  if (filters.effectiveDateTo) params.set('effectiveDateTo', filters.effectiveDateTo)
  if (filters.premiumMin !== undefined) params.set('premiumMin', String(filters.premiumMin))
  if (filters.premiumMax !== undefined) params.set('premiumMax', String(filters.premiumMax))
  if (filters.claimsTotalMin !== undefined) params.set('claimsTotalMin', String(filters.claimsTotalMin))
  if (filters.claimsTotalMax !== undefined) params.set('claimsTotalMax', String(filters.claimsTotalMax))
  if (filters.reimbursementRiskMin !== undefined) params.set('reimbursementRiskMin', String(filters.reimbursementRiskMin))
  if (filters.reimbursementRiskMax !== undefined) params.set('reimbursementRiskMax', String(filters.reimbursementRiskMax))
  if (page > 1) params.set('page', String(page))
  if (limit !== 20) params.set('limit', String(limit))

  return params
}

export const searchParamsToFilters = (
  params: URLSearchParams,
): { filters: PolicyFilters; page: number; limit: number } => {
  const parseNum = (key: string): number | undefined => {
    const v = params.get(key)
    if (v === null) return undefined
    const n = Number(v)
    return Number.isNaN(n) ? undefined : n
  }

  const regionStr = params.get('region')
  const region = regionStr ? regionStr.split(',').filter(Boolean) : undefined

  return {
    filters: {
      search: params.get('search') || undefined,
      region: region && region.length > 0 ? region : undefined,
      effectiveDateFrom: params.get('effectiveDateFrom') || undefined,
      effectiveDateTo: params.get('effectiveDateTo') || undefined,
      premiumMin: parseNum('premiumMin'),
      premiumMax: parseNum('premiumMax'),
      claimsTotalMin: parseNum('claimsTotalMin'),
      claimsTotalMax: parseNum('claimsTotalMax'),
      reimbursementRiskMin: parseNum('reimbursementRiskMin'),
      reimbursementRiskMax: parseNum('reimbursementRiskMax'),
    },
    page: Number(params.get('page') || '1'),
    limit: Number(params.get('limit') || '20'),
  }
}
