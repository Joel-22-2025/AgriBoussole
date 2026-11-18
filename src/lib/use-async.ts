import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

import { getApiError } from '@/lib/api/errors'

/** Charge une ressource distante une seule fois par changement de dépendances. */
export function useAsync<T>(factory: () => Promise<T>, deps: DependencyList) {
  const factoryRef = useRef(factory)
  factoryRef.current = factory

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await factoryRef.current()
      setData(result)
      return result
    } catch (cause) {
      setError(getApiError(cause).message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, reload, setData }
}
