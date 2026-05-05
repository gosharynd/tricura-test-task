const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export const apiFetch = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const { headers: customHeaders, ...restOptions } = options ?? {}

  const headers: Record<string, string> = { ...customHeaders as Record<string, string> }
  if (restOptions.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'unknown',
      body?.error?.message ?? res.statusText,
    )
  }

  if (res.status === 204) return undefined as T

  return res.json()
}
