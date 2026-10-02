export type QueryParams = Record<string, string | number | boolean | null | undefined>

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  params?: QueryParams
  signal?: AbortSignal
  notifyUnauthorized?: boolean
}

export function queryString(params: QueryParams = {}): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  }
  return query.size ? `?${query}` : ''
}

export function createApiClient(baseUrl: string, onUnauthorized: () => void = () => {}, fetchFn = globalThis.fetch) {
  const base = baseUrl.replace(/\/$/, '')
  async function request<T>(path: string, method: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    let response: Response
    try {
      response = await fetchFn(`${base}${path}${queryString(options.params)}`, {
        method, credentials: 'include', signal: options.signal,
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
    } catch (error) {
      if (options.signal?.aborted) throw error
      throw new ApiError('Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.', 0)
    }
    if (response.status === 401 && options.notifyUnauthorized !== false) onUnauthorized()
    let data: unknown = null
    if (response.status !== 204) data = await response.json().catch(() => null)
    if (!response.ok) {
      const serverMessage = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : null
      throw new ApiError(response.status === 401
        ? options.notifyUnauthorized === false ? 'E-mail ou senha incorretos.' : 'Sua sessão expirou. Entre novamente.'
        : serverMessage ?? 'Não foi possível concluir a solicitação. Tente novamente.', response.status)
    }
    if (response.status !== 204 && data === null) throw new ApiError('O servidor retornou uma resposta inesperada.', 502)
    return data as T
  }
  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, 'GET', undefined, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'POST', body, options),
    delete: <T = void>(path: string, options?: RequestOptions) => request<T>(path, 'DELETE', undefined, options),
    url: (path: string) => `${base}${path}`,
  }
}

export const SESSION_EXPIRED_EVENT = 'central:session-expired'
export const apiClient = createApiClient(
  import.meta.env?.VITE_API_URL || (import.meta.env?.DEV ? 'http://localhost:3333/api' : 'https://sistemamlivre.onrender.com/api'),
  () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)),
)

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Não foi possível concluir a operação. Tente novamente.'
}
