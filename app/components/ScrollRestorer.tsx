'use client'

import { useEffect } from 'react'
import { useScrollStore } from '../stores/scroll.store'

export default function ScrollRestorer() {
  useEffect(() => {
    const handlePopstate = () => {
      setTimeout(() => {
        const { savedScroll, deleteScroll } = useScrollStore.getState()
        savedScroll.get(location.pathname)?.forEach(({ elId, scrollTop }) => {
          if (elId === 'window') window.scrollTo({ top: scrollTop })
          else if (elId) document.getElementById(elId)?.scrollTo({ top: scrollTop })
        })
        deleteScroll(location.pathname)
      }, 100)
    }

    window.addEventListener('popstate', handlePopstate)
    return () => {
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [])

  return null
}
