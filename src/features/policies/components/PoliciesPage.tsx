import { useState, useCallback, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import FilterChips from './FilterChips'
import PoliciesTable from './PoliciesTable'
import FiltersModal from './FiltersModal'
import PolicyFormModal from './PolicyFormModal'
import { usePolicyFilters } from '../filters/hook'
import { usePolicies, usePolicy, useCreatePolicy, useUpdatePolicy } from '../api/queries'
import type { ListPoliciesParams } from '../api/api'
import type { PolicyFilters } from '../filters/schema'
import type { PolicyFormData } from './PolicyFormModal.schema'
import type { CreatePolicyInput, UpdatePolicyInput, Severity, ReviewType, Region } from '../types'

type FormModalState = {
  open: boolean
  mode: 'create' | 'edit'
  policyId?: string
}

const PoliciesPage = () => {
  const { filters, setFilters, updateFilter, resetFilters, activeFilterCount, page, limit, setPage, setLimit } = usePolicyFilters()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [formModal, setFormModal] = useState<FormModalState>({ open: false, mode: 'create' })

  // Build API params — if >1 region selected, omit from API (filter client-side)
  const apiParams = useMemo((): ListPoliciesParams => {
    const params: ListPoliciesParams = {
      page,
      limit,
      search: filters.search || undefined,
      effectiveDateFrom: filters.effectiveDateFrom,
      effectiveDateTo: filters.effectiveDateTo,
      premiumMin: filters.premiumMin,
      premiumMax: filters.premiumMax,
      claimsTotalMin: filters.claimsTotalMin,
      claimsTotalMax: filters.claimsTotalMax,
      reimbursementRiskMin: filters.reimbursementRiskMin,
      reimbursementRiskMax: filters.reimbursementRiskMax,
    }
    if (filters.region && filters.region.length === 1) {
      params.region = filters.region[0]
    }
    return params
  }, [filters, page, limit])

  const { data: policiesData, isLoading, isError, error, refetch } = usePolicies(apiParams)

  // Client-side region filtering when multiple regions selected
  const filteredData = useMemo(() => {
    if (!policiesData) return undefined
    if (!filters.region || filters.region.length <= 1) return policiesData
    const regionSet = new Set(filters.region)
    const filtered = policiesData.data.filter((p) => regionSet.has(p.region))
    return {
      ...policiesData,
      data: filtered,
      pagination: { ...policiesData.pagination, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) || 1 },
    }
  }, [policiesData, filters.region, limit])

  // Edit policy data
  const editPolicyId = formModal.open && formModal.mode === 'edit' ? formModal.policyId ?? null : null
  const { data: editPolicy } = usePolicy(editPolicyId)

  const { mutate: createMutate, isPending: createPending } = useCreatePolicy()
  const { mutate: updateMutate, isPending: updatePending } = useUpdatePolicy()

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter('search', e.target.value || undefined)
  }, [updateFilter])

  const handleRemoveFilter = useCallback(<K extends keyof PolicyFilters>(key: K) => {
    updateFilter(key, undefined)
  }, [updateFilter])

  const handleApplyFilters = useCallback((newFilters: PolicyFilters) => {
    setFilters(newFilters)
  }, [setFilters])

  const handleCreateNew = useCallback(() => {
    setFormModal({ open: true, mode: 'create' })
  }, [])

  const handleEdit = useCallback((id: string) => {
    setFormModal({ open: true, mode: 'edit', policyId: id })
  }, [])

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormModal((prev) => ({ ...prev, open }))
  }, [])

  const handleFormSubmit = useCallback((data: PolicyFormData) => {
    if (formModal.mode === 'create') {
      const input: CreatePolicyInput = {
        account: { name: data.accountName, region: data.region as Region, facilityCount: data.facilityCount },
        renewal: { effectiveDate: data.effectiveDate, daysUntilRenewal: data.daysUntilRenewal },
        financials: { premium: data.premium, claimsTotal: data.claimsTotal, reimbursementRisk: data.reimbursementRisk },
        compliance: {
          missingDocuments: data.missingDocuments,
          expiredDocuments: data.expiredDocuments,
          pendingReviews: data.pendingReviews.map((r) => ({ type: r.type as ReviewType, dueDate: r.dueDate, severity: r.severity as Severity })),
        },
      }
      createMutate(input, { onSuccess: () => setFormModal({ open: false, mode: 'create' }) })
    } else if (formModal.policyId) {
      const input: UpdatePolicyInput = {
        account: { name: data.accountName, region: data.region as Region, facilityCount: data.facilityCount },
        renewal: { effectiveDate: data.effectiveDate, daysUntilRenewal: data.daysUntilRenewal },
        financials: { premium: data.premium, claimsTotal: data.claimsTotal, reimbursementRisk: data.reimbursementRisk },
        compliance: {
          missingDocuments: data.missingDocuments,
          expiredDocuments: data.expiredDocuments,
          pendingReviews: data.pendingReviews.map((r) => ({ type: r.type as ReviewType, dueDate: r.dueDate, severity: r.severity as Severity })),
        },
      }
      updateMutate({ id: formModal.policyId, input }, { onSuccess: () => setFormModal({ open: false, mode: 'create' }) })
    }
  }, [formModal, createMutate, updateMutate])

  return (
    <div className="p-6 space-y-4">
      {/* Search + Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts by name..."
            value={filters.search ?? ''}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {activeFilterCount > 0 ? `FILTERS · ${activeFilterCount}` : 'FILTERS'}
        </Button>
      </div>

      {/* Filter chips */}
      <FilterChips filters={filters} onRemove={handleRemoveFilter} onClearAll={resetFilters} />

      {/* Table */}
      <PoliciesTable
        data={filteredData}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onClearFilters={resetFilters}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
      />

      {/* Modals */}
      <FiltersModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={handleApplyFilters}
      />
      <PolicyFormModal
        open={formModal.open}
        onOpenChange={handleFormOpenChange}
        mode={formModal.mode}
        policy={editPolicy}
        onSubmit={handleFormSubmit}
        isPending={createPending || updatePending}
      />
    </div>
  )
}

export default PoliciesPage
