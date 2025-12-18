import { useEffect, useRef } from 'react'

export function usePrevState<T>(state: T) {
  const ref = useRef(state)
  useEffect(() => {
    ref.current = state
  }, [state])
  return ref.current
}
