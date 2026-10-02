export interface PaginationData { page: number; limit: number; total: number; totalPages: number }
export interface Paginated<T> { data: T[]; pagination: PaginationData }
export type ImportStatus = 'PROCESSING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'ERROR'
