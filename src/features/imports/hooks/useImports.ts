import { useCallback, useContext, createContext } from 'react'
import type { ImportInput, ImportSummary } from '../types/import'

export interface ImportsContextValue {
  processing: boolean
  result: ImportSummary | null
  history: ImportSummary[]
  error: string
  start(input: ImportInput): Promise<void>
}
export const ImportsContext = createContext<ImportsContextValue | null>(null)
export function useImports() {
  const state = useContext(ImportsContext)
  if (!state) throw new Error('ImportsProvider ausente')
  const start = useCallback((input: ImportInput) => state.start(input), [state])
  return { ...state, start }
}
