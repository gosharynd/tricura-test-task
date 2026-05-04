import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { PolicyFilters } from './schema'
import { activeFilterCount } from './schema'
import { filtersToSearchParams, searchParamsToFilters } from './serialization'

export const usePolicyFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const parsed = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  )

  const { filters, page, limit } = parsed

  const setFilters = useCallback(
    (newFilters: PolicyFilters) => {
      setSearchParams(filtersToSearchParams(newFilters, 1, limit), { replace: true })
    },
    [setSearchParams, limit],
  )

  const updateFilter = useCallback(
    <K extends keyof PolicyFilters>(key: K, value: PolicyFilters[K]) => {
      const updated = { ...filters, [key]: value }
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete updated[key]
      }
      setSearchParams(filtersToSearchParams(updated, 1, limit), { replace: true })
    },
    [filters, setSearchParams, limit],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(filtersToSearchParams(filters, newPage, limit), { replace: true })
    },
    [filters, setSearchParams, limit],
  )

  const setLimit = useCallback(
    (newLimit: number) => {
      setSearchParams(filtersToSearchParams(filters, 1, newLimit), { replace: true })
    },
    [filters, setSearchParams],
  )

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeFilterCount: activeFilterCount(filters),
    page,
    limit,
    setPage,
    setLimit,
  }
}
