import { useState, useCallback, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import FilterChips from './FilterChips'
import PoliciesTable from './PoliciesTable'
import FiltersModal from './FiltersModal'
import PolicyFormModal from './PolicyFormModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePolicyFilters } from '../filters/hook'
import { usePolicies, usePolicy, useCreatePolicy, useUpdatePolicy, useDeletePolicy } from '../api/queries'
import { formDataToApiPayload } from '../mappers'
import type { ListPoliciesParams } from '../api/api'
import type { PolicyFilters } from '../filters/schema'
import type { PolicyFormData } from './PolicyFormModal.schema'

type FormModalState = {
  open: boolean
  mode: 'create' | 'edit'
  policyId?: string
}

const PoliciesPage = () => {
  const { filters, setFilters, updateFilter, resetFilters, activeFilterCount, page, limit, setPage, setLimit } = usePolicyFilters()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [formModal, setFormModal] = useState<FormModalState>({ open: false, mode: 'create' })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const debouncedSearch = useDebounce(filters.search, 300)

  const apiParams = useMemo((): ListPoliciesParams => {
    const params: ListPoliciesParams = {
      page,
      limit,
      search: debouncedSearch || undefined,
      effectiveDateFrom: filters.effectiveDateFrom,
      effectiveDateTo: filters.effectiveDateTo,
      premiumMin: filters.premiumMin,
      premiumMax: filters.premiumMax,
      claimsTotalMin: filters.claimsTotalMin,
      claimsTotalMax: filters.claimsTotalMax,
      reimbursementRiskMin: filters.reimbursementRiskMin,
      reimbursementRiskMax: filters.reimbursementRiskMax,
    }
    if (filters.region && filters.region.length > 0) {
      params.region = filters.region.join(',')
    }
    return params
  }, [filters, debouncedSearch, page, limit])

  const { data: policiesData, isLoading, isError, error, refetch } = usePolicies(apiParams)

  // Edit policy data
  const editPolicyId = formModal.open && formModal.mode === 'edit' ? formModal.policyId ?? null : null
  const { data: editPolicy } = usePolicy(editPolicyId)

  const { mutate: createMutate, isPending: createPending } = useCreatePolicy()
  const { mutate: updateMutate, isPending: updatePending } = useUpdatePolicy()
  const { mutate: deleteMutate, isPending: deletePending } = useDeletePolicy()

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter('search', e.target.value || undefined)
  }, [updateFilter])

  const handleClearSearch = useCallback(() => {
    updateFilter('search', undefined)
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

  const handleOpenFilters = useCallback(() => {
    setFiltersOpen(true)
  }, [])

  const handleFormDeleteClick = useCallback(() => {
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmFormDelete = useCallback(() => {
    if (!formModal.policyId) return
    deleteMutate(formModal.policyId, {
      onSuccess: () => {
        setDeleteConfirmOpen(false)
        setFormModal({ open: false, mode: 'create' })
        toast.success('Policy deleted successfully')
      },
      onError: (err) => {
        toast.error('Failed to delete policy', { description: err.message })
      },
    })
  }, [formModal.policyId, deleteMutate])

  const handleDeleteConfirmOpenChange = useCallback((open: boolean) => {
    setDeleteConfirmOpen(open)
  }, [])

  const handleFormSubmit = useCallback((data: PolicyFormData) => {
    const input = formDataToApiPayload(data)
    if (formModal.mode === 'create') {
      createMutate(input, {
        onSuccess: () => {
          setFormModal({ open: false, mode: 'create' })
          toast.success('Policy created successfully')
        },
        onError: (err) => {
          toast.error('Failed to create policy', { description: err.message })
        },
      })
    } else if (formModal.policyId) {
      updateMutate({ id: formModal.policyId, input }, {
        onSuccess: () => {
          setFormModal({ open: false, mode: 'create' })
          toast.success('Policy updated successfully')
        },
        onError: (err) => {
          toast.error('Failed to update policy', { description: err.message })
        },
      })
    }
  }, [formModal, createMutate, updateMutate])

  const filterButtonClass = `h-[30px] text-xs font-medium uppercase tracking-wide rounded ${activeFilterCount > 0 ? 'text-primary border-primary/50' : ''}`

  const filterButtonLabel = activeFilterCount > 0 ? `FILTERS · ${activeFilterCount}` : 'FILTERS'

  return (
    <div className="p-6 space-y-4">
      {/* Filter bar card */}
      <div className="bg-white border border-black/12 rounded-lg px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <Input
              placeholder="Search accounts by name..."
              value={filters.search ?? ''}
              onChange={handleSearchChange}
              className="pl-9 pr-9 h-[36px] text-[13px] border-black/12 rounded"
            />
            {filters.search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleOpenFilters}
            className={filterButtonClass}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            {filterButtonLabel}
          </Button>
        </div>
        <FilterChips filters={filters} onRemove={handleRemoveFilter} onClearAll={resetFilters} />
      </div>

      {/* Table */}
      <PoliciesTable
        data={policiesData}
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
        onDelete={handleFormDeleteClick}
        isPending={createPending || updatePending || deletePending}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={handleDeleteConfirmOpenChange}
        title="Delete Policy"
        description="Are you sure you want to delete this policy? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmFormDelete}
        isPending={deletePending}
      />
    </div>
  )
}

export default PoliciesPage
