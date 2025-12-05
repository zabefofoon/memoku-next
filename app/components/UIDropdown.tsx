// UIDropdown.tsx
import etcUtil from '@/app/utils/etc.util'
import { getOverflowAncestors } from '@floating-ui/dom'
import {
  autoPlacement,
  autoUpdate,
  hide,
  size as middlewareSize,
  offset,
  Placement,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'

export type AxisX = 'LEFT' | 'RIGHT'
export type AxisY = 'TOP' | 'BOTTOM'

export type Position = {
  x?: AxisX
  y?: AxisY
}

type DropdownRenderApi = {
  toggle: (next?: boolean, cb?: () => void) => void
  open: boolean
  refs: {
    reference: (el: HTMLDivElement | null) => void
    floating: (el: HTMLDivElement | null) => void
  }
}

export interface UIDropdownProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  position?: Partial<Position>
  optionsClass?: string
  fitOptionsParent?: boolean
  customOffset?: number
  preventHideOutside?: boolean
  preventHideScroll?: boolean
  className?: string
  renderButton: (api: DropdownRenderApi) => ReactNode
  renderOptions: (api: DropdownRenderApi) => ReactNode
}

export function UIDropdown({
  isOpen,
  onOpenChange,
  position,
  optionsClass,
  fitOptionsParent = true,
  customOffset = 10,
  preventHideOutside = false,
  preventHideScroll = false,
  className,
  renderButton,
  renderOptions,
}: UIDropdownProps) {
  const referenceRef = useRef<HTMLDivElement | null>(null)
  const floatingRef = useRef<HTMLDivElement | null>(null)

  const defaultPlacements: Placement[] = useMemo(
    () => ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'],
    []
  )

  const placementTable: Record<
    NonNullable<Position['x']> | 'undefined',
    Record<NonNullable<Position['y']> | 'undefined', Placement[]>
  > = useMemo(
    () => ({
      undefined: {
        undefined: defaultPlacements,
        TOP: ['top'],
        BOTTOM: ['bottom'],
      },
      LEFT: {
        undefined: ['top-start', 'bottom-start'],
        TOP: ['top-start'],
        BOTTOM: ['bottom-start'],
      },
      RIGHT: {
        undefined: ['top-end', 'bottom-end'],
        TOP: ['top-end'],
        BOTTOM: ['bottom-end'],
      },
    }),
    [defaultPlacements]
  )

  const allowedPlacements = useMemo<Placement[]>(() => {
    const x = (position?.x ?? 'undefined') as keyof typeof placementTable
    const y = (position?.y ?? 'undefined') as keyof (typeof placementTable)[typeof x]
    return placementTable[x]?.[y] ?? defaultPlacements
  }, [defaultPlacements, placementTable, position?.x, position?.y])

  const { refs, floatingStyles, placement, context } = useFloating({
    elements: {
      reference: referenceRef.current,
      floating: floatingRef.current,
    },
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange,
    middleware: [
      shift({
        mainAxis: !fitOptionsParent,
        crossAxis: !fitOptionsParent,
      }),
      offset(customOffset),
      hide(),
      middlewareSize({
        apply({ rects, elements }) {
          if (fitOptionsParent) {
            ;(elements.floating as HTMLElement).style.width = `${rects.reference.width}px`
          }
        },
      }),
      autoPlacement({ allowedPlacements }),
    ],
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context, {
      outsidePress: !preventHideOutside,
    }),
  ])

  useEffect(() => {
    if (preventHideScroll) return
    if (!isOpen || !referenceRef.current) return

    const ancestors = getOverflowAncestors(referenceRef.current)
    const onScroll = () => onOpenChange(false)

    ancestors.forEach((el) => {
      el.addEventListener('scroll', onScroll, { passive: true })
    })

    return () => {
      ancestors.forEach((el) => el.removeEventListener('scroll', onScroll))
    }
  }, [isOpen, preventHideScroll, onOpenChange])

  const toggle = (next?: boolean, cb?: () => void) => {
    cb?.()
    setTimeout(() => {
      onOpenChange(next != null ? next : !isOpen)
    })
  }

  const api: DropdownRenderApi = {
    toggle,
    open: isOpen,
    refs: {
      reference: (el) => {
        referenceRef.current = el
        refs.setReference(el)
      },
      floating: (el) => {
        floatingRef.current = el
        refs.setFloating(el)
      },
    },
  }

  // Vue의 Transition name에 대응하는 클래스 훅 (필요 시 CSS에서 활용)
  const transitionName = placement?.includes('top') ? 'select-options-top' : 'select-options-bottom'

  return (
    <div className={etcUtil.classNames('ui-dropdown', className)}>
      <div
        ref={api.refs.reference}
        {...getReferenceProps()}>
        {renderButton(api)}
      </div>

      {/* 필요하다면 CSSTransition/Framer Motion으로 애니메이션 추가 */}
      {isOpen && (
        <div
          ref={api.refs.floating}
          {...getFloatingProps()}
          className={etcUtil.classNames(
            'options z-[10] bg-white dark:bg-zinc-700 rounded-lg shadow-xl shadow-black/20 dark:shadow-black',
            optionsClass,
            transitionName // 전환 방향 클래스 훅
          )}
          style={floatingStyles as CSSProperties}>
          {renderOptions(api)}
        </div>
      )}
    </div>
  )
}

export default UIDropdown
