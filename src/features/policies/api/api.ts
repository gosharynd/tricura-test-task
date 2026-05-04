import { apiFetch } from '@/api/client'
import type {
  Policy,
  PoliciesListResponse,
  CreatePolicyInput,
  UpdatePolicyInput,
} from '../types'

export type ListPoliciesParams = {
  page?: number
  limit?: number
  region?: string
  search?: string
  effectiveDateFrom?: string
  effectiveDateTo?: string
  reimbursementRiskMin?: number
  reimbursementRiskMax?: number
  premiumMin?: number
  premiumMax?: number
  claimsTotalMin?: number
  claimsTotalMax?: number
}

export const listPolicies = (params: ListPoliciesParams = {}): Promise<PoliciesListResponse> => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const qs = searchParams.toString()
  return apiFetch<PoliciesListResponse>(`/policies${qs ? `?${qs}` : ''}`)
}

export const getPolicy = (id: string): Promise<Policy> => {
  return apiFetch<Policy>(`/policies/${id}`)
}

export const createPolicy = (input: CreatePolicyInput): Promise<Policy> => {
  return apiFetch<Policy>('/policies', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export const updatePolicy = (id: string, input: UpdatePolicyInput): Promise<Policy> => {
  return apiFetch<Policy>(`/policies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export const deletePolicy = (id: string): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>(`/policies/${id}`, {
    method: 'DELETE',
  })
}
