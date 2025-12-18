'use client'

import { usePathname } from 'next/navigation'
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  use,
  useEffect,
  useRef,
  useState,
} from 'react'

export type Direction = 'idle' | 'forward' | 'back' | 'unknown'

type NavigationInfo = {
  pointer: number
  pathStack: string[]
  direction: Direction
}

export const ViewTransitionsContext = createContext<{
  rootPages?: string[]
  setNav: Dispatch<SetStateAction<NavigationInfo>>
}>({
  rootPages: [],
  setNav: () => {},
})

interface Props {
  rootPages: string[]
}

export function ViewTransitions({ rootPages, children }: PropsWithChildren<Props>) {
  const pathname = usePathname()
  const currentPathname = useRef<string>(pathname)

  const [_, setNav] = useState<NavigationInfo>({
    pointer: -1,
    pathStack: [],
    direction: 'idle',
  })

  const pendingRenderingRef = useRef<Promise<void> | undefined>(undefined)
  const resolveRenderingRef = useRef<(() => void) | undefined>(undefined)

  const skipAnimation = useRef<boolean>(false)

  const handleNavigate = (event: NavigateEvent) => {
    skipAnimation.current = event.hasUAVisualTransition
  }

  const handleTouchcancel = () => {
    skipAnimation.current = true
  }

  const handleTouchstart = (event: TouchEvent) => {
    const clientX = event.changedTouches[0].clientX
    skipAnimation.current = clientX < 30 || clientX > window.innerWidth - 30
  }

  useEffect(() => {
    if (!('startViewTransition' in document)) return

    const onPopState = () => {
      const currentPath = window.location.pathname
      setNav((prev) => {
        const idx = prev.pathStack.indexOf(currentPath)

        if (idx === -1) {
          const newStack = [...prev.pathStack, currentPath]

          const result = {
            pointer: newStack.length - 1,
            pathStack: newStack,
            direction: 'unknown' as Direction,
          }

          if (typeof window !== 'undefined')
            window.sessionStorage.setItem('nav-info', JSON.stringify(result))

          return result
        }

        let dir: Direction = 'idle'
        if (idx < prev.pointer) dir = 'back'
        else if (idx > prev.pointer) dir = 'forward'

        document.documentElement.classList.remove('back', 'forward')
        if (dir === 'back') document.documentElement.classList.add('back')
        if (dir === 'forward') document.documentElement.classList.add('forward')

        const result = { ...prev, pointer: idx, direction: dir }

        if (typeof window !== 'undefined')
          window.sessionStorage.setItem('nav-info', JSON.stringify(result))

        return result
      })

      const isCrossRoots =
        rootPages.includes(currentPathname.current) && rootPages.includes(currentPath)
      if (isCrossRoots || skipAnimation.current) return
      if (currentPath === currentPathname.current) return

      let resolveFn
      const pendingTransition = new Promise((resolve) => (resolveFn = resolve))
      pendingRenderingRef.current = new Promise<void>((resolve) => {
        return document.startViewTransition(() => {
          resolve()
          return pendingTransition
        })
      })
      resolveRenderingRef.current = resolveFn!
    }

    window.navigation?.addEventListener('navigate', handleNavigate)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('touchcancel', handleTouchcancel)
    window.addEventListener('touchstart', handleTouchstart)
    return () => {
      window.navigation?.removeEventListener('navigate', handleNavigate)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('touchcancel', handleTouchcancel)
      window.removeEventListener('touchstart', handleTouchstart)
    }
  }, [rootPages])

  if (pendingRenderingRef.current && currentPathname.current !== pathname) {
    use(pendingRenderingRef.current)
  }

  useEffect(() => {
    setNav((prev) => {
      if (prev.pointer !== -1) return prev // 이미 초기화 됐으면 패스

      let initialNavInfo: NavigationInfo
      const defaultInfo = {
        pointer: 0,
        pathStack: [pathname],
        direction: 'idle' as Direction,
      }

      const saved = window.sessionStorage.getItem('nav-info')
      if (!saved) initialNavInfo = defaultInfo
      else {
        const parsed: NavigationInfo = JSON.parse(saved)
        const lastPath = parsed.pathStack[parsed.pointer]

        initialNavInfo =
          lastPath === pathname
            ? (initialNavInfo = { ...parsed, direction: 'idle' })
            : (initialNavInfo = defaultInfo)
      }

      window.sessionStorage.setItem('nav-info', JSON.stringify(initialNavInfo))
      return initialNavInfo
    })

    currentPathname.current = pathname

    if (resolveRenderingRef.current) {
      resolveRenderingRef.current()
      resolveRenderingRef.current = undefined
      pendingRenderingRef.current = undefined
    }

    skipAnimation.current = false
  }, [pathname])

  return (
    <ViewTransitionsContext.Provider value={{ rootPages: rootPages, setNav }}>
      {children}
    </ViewTransitionsContext.Provider>
  )
}
