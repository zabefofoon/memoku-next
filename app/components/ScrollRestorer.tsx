'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { usePrevState } from '../hooks/usePrevState'
import { useScrollStore } from '../stores/scroll.store'

export default function ScrollRestorer() {
  const pathname = usePathname()
  const prevPathname = usePrevState(pathname)

  useEffect(() => {
    const handlePopstate = () => {
      setTimeout(() => {
        const { savedScroll, deleteScroll } = useScrollStore.getState()

        savedScroll.get(location.pathname)?.forEach(({ elId, scrollTop }) => {
          if (elId) document.getElementById(elId)?.scrollTo({ top: scrollTop })
        })
        setTimeout(() => deleteScroll(location.pathname), 100)
      }, 150)
    }

    window.addEventListener('popstate', handlePopstate)
    return () => {
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [])

  useEffect(() => {
    const { setPrevPathname } = useScrollStore.getState()
    setPrevPathname(prevPathname)
  }, [prevPathname])

  return null
}
