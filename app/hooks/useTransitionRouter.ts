'use client'

import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { use, useCallback, useMemo, useRef } from 'react'
import { Direction, ViewTransitionsContext } from '../components/ViewTransitions'
import { useTranstionsStore } from '../stores/transitions.store'
import etcUtil from '../utils/etc.util'

export function useTransitionRouter() {
  const router = useRouter()
  const transitionContext = use(ViewTransitionsContext)
  const loadTried = useRef<number>(0)

  const push = useCallback(
    (href: string, options: NavigateOptions) => {
      transitionContext.setNav((prev) => {
        const trimmed = prev.pathStack.slice(0, prev.pointer + 1)
        const pathStack = [...trimmed, href]
        const pointer = pathStack.length - 1
        const result = {
          pointer,
          pathStack,
          direction: 'forward' as Direction,
        }

        if (typeof window !== 'undefined')
          window.sessionStorage.setItem('nav-info', JSON.stringify(result))

        return result
      })

      if (!('startViewTransition' in document)) return router.push(href, options)

      const path = href.split('?')[0]
      if (transitionContext.rootPages?.includes(path)) return router.push(href, options)
      else {
        const { setIsLoaded } = useTranstionsStore.getState()

        return document.startViewTransition(async () => {
          document.documentElement.classList.remove('back', 'forward')
          document.documentElement.classList.add('forward')
          router.push(href, options)

          loadTried.current = 0
          while (!useTranstionsStore.getState().isLoaded) {
            loadTried.current++
            if (loadTried.current > 10) break
            await etcUtil.sleep(100)
          }
          setIsLoaded(false)
        })
      }
    },
    [router, transitionContext]
  )

  const replace = useCallback(
    (href: string, options: NavigateOptions) => router.replace(href, options),
    [router]
  )

  return useMemo(() => ({ ...router, push, replace }), [router, push, replace])
}
