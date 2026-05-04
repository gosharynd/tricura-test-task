import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableHeader, TableHead, TableRow, TableBody,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import TableSkeleton from '@/components/common/TableSkeleton'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PolicyRow from './PolicyRow'
import PolicyDetail from './PolicyDetail'
import { usePolicy, useDeletePolicy } from '../api/queries'
import type { PoliciesListResponse } from '../types'

type PoliciesTableProps = {
  data?: PoliciesListResponse
  isLoading: boolean
  isError: boolean
  error?: Error | null
  onRetry: () => void
  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onClearFilters: () => void
  onCreateNew: () => void
  onEdit: (id: string) => void
}

const PoliciesTable = ({
  data, isLoading, isError, error,
  onRetry, page, limit, onPageChange, onLimitChange,
  onClearFilters, onCreateNew, onEdit,
}: PoliciesTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: detailPolicy, isLoading: detailLoading, isError: detailError, error: detailErrorObj, refetch: refetchDetail } = usePolicy(expandedId)
  const { mutate: deleteMutate, isPending: deletePending } = useDeletePolicy()

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!deleteId) return
    deleteMutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        if (expandedId === deleteId) setExpandedId(null)
      },
    })
  }, [deleteId, deleteMutate, expandedId])

  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const total = pagination?.total ?? 0
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Policies</h2>
        <Button onClick={onCreateNew} size="sm">
          + New Policy
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Account</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-center">Facilities</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Claims Total</TableHead>
              <TableHead>Risk</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading && <TableSkeleton rows={limit} columns={8} />}

          {isError && (
            <TableBody>
              <TableRow>
                <td colSpan={8}>
                  <ErrorState
                    title="Failed to load policies"
                    description={error?.message ?? 'An unexpected error occurred'}
                    onRetry={onRetry}
                  />
                </td>
              </TableRow>
            </TableBody>
          )}

          {!isLoading && !isError && data && data.data.length === 0 && (
            <TableBody>
              <TableRow>
                <td colSpan={8}>
                  <EmptyState
                    title="No policies found"
                    description="Try adjusting your filters or create a new policy."
                    actions={[
                      { label: 'Clear Filters', onClick: onClearFilters, variant: 'outline' },
                      { label: 'Create New Policy', onClick: onCreateNew, variant: 'default' },
                    ]}
                  />
                </td>
              </TableRow>
            </TableBody>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <TableBody>
              {data.data.map((policy) => (
                <PolicyRowWithDetail
                  key={policy.id}
                  policyId={policy.id}
                  policy={policy}
                  isExpanded={expandedId === policy.id}
                  onToggle={() => handleToggle(policy.id)}
                  detailPolicy={expandedId === policy.id ? detailPolicy : undefined}
                  detailLoading={expandedId === policy.id && detailLoading}
                  detailError={expandedId === policy.id && detailError}
                  detailErrorObj={expandedId === policy.id ? detailErrorObj : null}
                  onRetryDetail={refetchDetail}
                  onEdit={() => onEdit(policy.id)}
                  onDelete={() => handleDelete(policy.id)}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Pagination */}
      {data && data.data.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>
            <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-muted-foreground">
            {startItem}–{endItem} of {total}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((p, idx) => {
              const prev = pageNumbers[idx - 1]
              const showEllipsis = prev !== undefined && p - prev > 1
              return (
                <span key={p} className="contents">
                  {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </Button>
                </span>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Policy"
        description="Are you sure you want to delete this policy? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isPending={deletePending}
      />
    </div>
  )
}

// Helper to keep the fragment pattern clean
type PolicyRowWithDetailProps = {
  policyId: string
  policy: import('../types').PolicyListItem
  isExpanded: boolean
  onToggle: () => void
  detailPolicy?: import('../types').Policy
  detailLoading: boolean
  detailError: boolean
  detailErrorObj?: Error | null
  onRetryDetail: () => void
  onEdit: () => void
  onDelete: () => void
}

const PolicyRowWithDetail = ({
  policy, isExpanded, onToggle,
  detailPolicy, detailLoading, detailError, detailErrorObj,
  onRetryDetail, onEdit, onDelete,
}: PolicyRowWithDetailProps) => {
  return (
    <>
      <PolicyRow policy={policy} isExpanded={isExpanded} onToggle={onToggle} />
      {isExpanded && (
        <PolicyDetail
          policy={detailPolicy}
          isLoading={detailLoading}
          isError={detailError}
          error={detailErrorObj}
          onRetry={onRetryDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  )
}

export default PoliciesTable
