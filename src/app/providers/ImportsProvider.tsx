import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ImportsContext } from '../../features/imports/hooks/useImports'
import { importsService } from '../../features/imports/services/importsService'
import type { ImportSummary } from '../../features/imports/types/import'
import { errorMessage } from '../../lib/api/apiClient'

/** Mantém a requisição e o bloqueio de envio durante navegação entre páginas. */
export function ImportsProvider({ children }: { children: ReactNode }) {
  const locked = useRef(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ImportSummary | null>(null)
  const [history, setHistory] = useState<ImportSummary[]>([])
  const [error, setError] = useState('')
  return <ImportsContext.Provider value={{ processing, result, history, error, start: async (input) => {
    if (locked.current) return
    locked.current = true
    setProcessing(true)
    setResult(null)
    setError('')
    try {
      const completed = await importsService.start(input)
      setResult(completed)
      setHistory(current => [completed, ...current.filter(previous => previous.id !== completed.id)])
    }
    catch (caught) { setError(errorMessage(caught)) }
    finally { locked.current = false; setProcessing(false) }
  } }}>{children}</ImportsContext.Provider>
}
