import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
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
import { PAGE_SIZE_OPTIONS, MAX_VISIBLE_PAGES, TABLE_COLUMN_COUNT } from '../constants'
import type { PoliciesListResponse, PolicyListItem, Policy } from '../types'

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

  const tableRef = useRef<HTMLDivElement>(null)

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  // Focus the table container when a row expands so ↑/↓ work immediately
  useEffect(() => {
    if (expandedId) {
      tableRef.current?.focus({ preventScroll: true })
    }
  }, [expandedId])

  // ↑/↓ keyboard navigation — move expanded row through the list
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!data || data.data.length === 0 || !expandedId) return
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

    e.preventDefault()
    const ids = data.data.map((p) => p.id)
    const currentIdx = ids.indexOf(expandedId)
    if (currentIdx === -1) return

    const nextIdx = e.key === 'ArrowDown'
      ? Math.min(currentIdx + 1, ids.length - 1)
      : Math.max(currentIdx - 1, 0)

    if (nextIdx !== currentIdx) {
      setExpandedId(ids[nextIdx])
    }
  }, [data, expandedId])

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!deleteId) return
    deleteMutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        if (expandedId === deleteId) setExpandedId(null)
        toast.success('Policy deleted successfully')
      },
      onError: (err) => {
        toast.error('Failed to delete policy', { description: err.message })
      },
    })
  }, [deleteId, deleteMutate, expandedId])

  const handleCloseDeleteDialog = useCallback((open: boolean) => {
    if (!open) setDeleteId(null)
  }, [])

  const handleLimitChange = useCallback((v: string) => {
    onLimitChange(Number(v))
  }, [onLimitChange])

  const handlePrevPage = useCallback(() => {
    onPageChange(page - 1)
  }, [onPageChange, page])

  const handleNextPage = useCallback(() => {
    onPageChange(page + 1)
  }, [onPageChange, page])

  const pagination = data?.pagination
  const totalPages = useMemo(() => pagination?.totalPages ?? 1, [pagination?.totalPages])
  const total = useMemo(() => pagination?.total ?? 0, [pagination?.total])

  const paginationLabel = useMemo(() => {
    const startItem = (page - 1) * limit + 1
    const endItem = Math.min(page * limit, total)
    return `${startItem}–${endItem} of ${total}`
  }, [page, limit, total])

  const pageNumbers = useMemo(() => {
    const count = Math.min(MAX_VISIBLE_PAGES, totalPages)
    let start = Math.max(1, page - Math.floor(count / 2))
    const end = Math.min(totalPages, start + count - 1)
    start = Math.max(1, end - count + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  const emptyActions = useMemo(() => [
    { label: 'CLEAR FILTERS', onClick: onClearFilters, variant: 'outline' as const },
    { label: '+ CREATE NEW POLICY', onClick: onCreateNew, variant: 'default' as const },
  ], [onClearFilters, onCreateNew])

  const hasData = !isLoading && !isError && data && data.data.length > 0
  const isEmpty = !isLoading && !isError && data && data.data.length === 0

  return (
    <>
    <div ref={tableRef} className="bg-white border border-black/12 rounded-lg outline-none" onKeyDown={handleTableKeyDown} tabIndex={-1}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-semibold text-black/87">Policies</h2>
        <Button onClick={onCreateNew} size="sm" className="bg-[#1976d2] hover:bg-[#1565c0] text-white uppercase text-xs font-semibold tracking-wide">
          + NEW POLICY
        </Button>
      </div>

      {/* Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 px-2" />
              <TableHead>Account Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-center">Facilities</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead className="text-right">Premium</TableHead>
              <TableHead className="text-right">Claims Total</TableHead>
              <TableHead>Risk</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading && <TableSkeleton rows={limit} columns={TABLE_COLUMN_COUNT} />}

          {isError && (
            <TableBody>
              <TableRow>
                <td colSpan={TABLE_COLUMN_COUNT}>
                  <ErrorState
                    title="Couldn't load policies"
                    description="Something went wrong, try again in a moment."
                    errorCode={error?.message}
                    onRetry={onRetry}
                  />
                </td>
              </TableRow>
            </TableBody>
          )}

          {isEmpty && (
            <TableBody>
              <TableRow>
                <td colSpan={TABLE_COLUMN_COUNT}>
                  <EmptyState
                    title="No policies match these filters"
                    description="Try widening your search to see more results."
                    actions={emptyActions}
                  />
                </td>
              </TableRow>
            </TableBody>
          )}

          {hasData && (
            <TableBody>
              {data.data.map((policy) => (
                <PolicyRowWithDetail
                  key={policy.id}
                  policy={policy}
                  isExpanded={expandedId === policy.id}
                  onToggle={handleToggle}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  detailPolicy={expandedId === policy.id ? detailPolicy : undefined}
                  detailLoading={expandedId === policy.id && detailLoading}
                  detailError={expandedId === policy.id && detailError}
                  detailErrorObj={expandedId === policy.id ? detailErrorObj : null}
                  onRetryDetail={refetchDetail}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Pagination */}
      {hasData && (
        <div className="flex items-center justify-end gap-4 text-xs p-4 border-t border-black/12">
          <div className="flex items-center gap-2">
            <span className="text-black/60">Rows per page:</span>
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-black/60 tabular-nums">{paginationLabel}</span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={handlePrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((p) => (
              <PageButton key={p} page={p} isActive={p === page} onPageChange={onPageChange} />
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={handleNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={handleCloseDeleteDialog}
        title="Delete Policy"
        description="Are you sure you want to delete this policy? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isPending={deletePending}
      />
    </>
  )
}

// Pagination page button — avoids inline arrow in .map()
type PageButtonProps = {
  page: number
  isActive: boolean
  onPageChange: (page: number) => void
}

const PageButton = memo(({ page, isActive, onPageChange }: PageButtonProps) => {
  const handleClick = useCallback(() => {
    onPageChange(page)
  }, [onPageChange, page])

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      className={isActive ? 'bg-[#1976d2] text-white hover:bg-[#1565c0]' : ''}
      onClick={handleClick}
    >
      {page}
    </Button>
  )
})

// Row + expandable detail — avoids inline arrows in .map()
type PolicyRowWithDetailProps = {
  policy: PolicyListItem
  isExpanded: boolean
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  detailPolicy?: Policy
  detailLoading: boolean
  detailError: boolean
  detailErrorObj?: Error | null
  onRetryDetail: () => void
}

const PolicyRowWithDetail = memo(({
  policy, isExpanded, onToggle, onEdit, onDelete,
  detailPolicy, detailLoading, detailError, detailErrorObj,
  onRetryDetail,
}: PolicyRowWithDetailProps) => {
  const handleToggle = useCallback(() => {
    onToggle(policy.id)
  }, [onToggle, policy.id])

  const handleEdit = useCallback(() => {
    onEdit(policy.id)
  }, [onEdit, policy.id])

  const handleDelete = useCallback(() => {
    onDelete(policy.id)
  }, [onDelete, policy.id])

  return (
    <>
      <PolicyRow policy={policy} isExpanded={isExpanded} onToggle={handleToggle} />
      {isExpanded && (
        <PolicyDetail
          policy={detailPolicy}
          isLoading={detailLoading}
          isError={detailError}
          error={detailErrorObj}
          onRetry={onRetryDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  )
})

export default PoliciesTable
