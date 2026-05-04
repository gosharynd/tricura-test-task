import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy } from './api'
import type { ListPoliciesParams } from './api'

const policyKeys = {
  all: ['policies'] as const,
  lists: () => [...policyKeys.all, 'list'] as const,
  list: (params: ListPoliciesParams) => [...policyKeys.lists(), params] as const,
  details: () => [...policyKeys.all, 'detail'] as const,
  detail: (id: string) => [...policyKeys.details(), id] as const,
}

export const usePolicies = (params: ListPoliciesParams) => {
  return useQuery({
    queryKey: policyKeys.list(params),
    queryFn: () => listPolicies(params),
    staleTime: 30_000,
  })
}

export const usePolicy = (id: string | null) => {
  return useQuery({
    queryKey: policyKeys.detail(id!),
    queryFn: () => getPolicy(id!),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export const useCreatePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() })
    },
  })
}

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updatePolicy>[1] }) =>
      updatePolicy(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: policyKeys.detail(id) })
    },
  })
}

export const useDeletePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() })
    },
  })
}
