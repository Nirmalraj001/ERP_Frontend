const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '')
  }
  return '/api/v1'
}

const API_BASE = getApiBase()

export interface ApiError {
  message: string
  errors?: Array<{ field: string; message: string }>
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem('slt_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const { body, ...restOptions } = options
  const serializedBody =
    body !== undefined && body !== null && typeof body === 'object' && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${cleanEndpoint}`

  const response = await fetch(fullUrl, {
    ...restOptions,
    body: serializedBody,
    headers,
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || `HTTP error ${response.status}`,
      errors: data.errors,
    }
    throw error
  }

  return data
}
