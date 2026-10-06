import { useCallback, useEffect, useState } from 'react'
import { importsService } from '../services/importsService'
import type { ImportSummary } from '../types/import'
import { errorMessage } from '../../../lib/api/apiClient'

/** Retoma a leitura pelo banco após OAuth ou recarregamento da página. */
export function useMercadoLivreSync() {
  const [syncs, setSyncs] = useState<ImportSummary[]>([])
  const [syncError, setSyncError] = useState('')
  const [syncStarting, setSyncStarting] = useState(false)
  const [revision, setRevision] = useState(0)
  const refreshSyncs = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    async function poll(previous?: ImportSummary[]) {
      try {
        const records = previous
          ? await Promise.all(previous.map(record => record.status === 'PROCESSING'
            ? importsService.get(record.id, controller.signal) : Promise.resolve(record)))
          : await importsService.latest(controller.signal)
        if (controller.signal.aborted) return
        setSyncs(records)
        setSyncError('')
        if (records.some(record => record.status === 'PROCESSING')) {
          timer = setTimeout(() => void poll(records), 3000)
        }
      } catch (caught) {
        if (controller.signal.aborted) return
        setSyncError(errorMessage(caught))
        // Falha de consulta não implica falha da importação; volta a consultar.
        timer = setTimeout(() => void poll(previous), 5000)
      }
    }
    void poll()
    window.addEventListener('focus', refreshSyncs)
    return () => {
      controller.abort()
      if (timer) clearTimeout(timer)
      window.removeEventListener('focus', refreshSyncs)
    }
  }, [revision, refreshSyncs])
  const sync = useCallback(async (accountId: string) => {
    setSyncStarting(true)
    setSyncError('')
    try {
      const record = await importsService.sync(accountId)
      setSyncs(previous => [record, ...previous.filter(item => item.marketplaceAccountId !== accountId)])
      refreshSyncs()
    } catch (caught) { setSyncError(errorMessage(caught)) }
    finally { setSyncStarting(false) }
  }, [refreshSyncs])
  return { syncs, syncError, syncStarting, sync, refreshSyncs }
}
