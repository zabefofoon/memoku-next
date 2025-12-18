'use client'

import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { use, useCallback, useMemo } from 'react'
import { Direction, ViewTransitionsContext } from '../components/ViewTransitions'

export function useTransitionRouter() {
  const router = useRouter()
  const transitionContext = use(ViewTransitionsContext)

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

      if (!('startViewTransition' in document)) router.push(href, options)
      else {
        const path = href.split('?')[0]
        if (transitionContext.rootPages?.includes(path)) router.push(href, options)
        else {
          router.push(href)
          document.startViewTransition(async () => {
            document.documentElement.classList.remove('back', 'forward')
            document.documentElement.classList.add('forward')
          })
        }
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
