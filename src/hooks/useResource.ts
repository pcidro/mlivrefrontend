import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../lib/api/apiClient'

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>, refreshKey: string | number = 0) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string }>({ data: null, loading: true, error: '' })
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function run() {
      setState((current) => ({ ...current, loading: true, error: '' }))
      try {
        const data = await load(controller.signal)
        if (!controller.signal.aborted) setState({ data, loading: false, error: '' })
      } catch (error) {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: errorMessage(error) })
      }
    }
    void run()
    return () => controller.abort()
  }, [load, revision, refreshKey])
  const reload = useCallback(() => setRevision((value) => value + 1), [])
  return { ...state, reload }
}
