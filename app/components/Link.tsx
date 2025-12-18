'use client'

import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useCallback } from 'react'
import { useTransitionRouter } from '../hooks/useTransitionRouter'
import { SavedScrollTarget, useScrollStore } from '../stores/scroll.store'

interface LinkProps extends NextLinkProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  scroll?: boolean
  className?: string
  saveScrollTargets?: string[]
}

export function Link({
  href,
  as,
  replace,
  scroll,
  className,
  onClick,
  saveScrollTargets,
  ...rest
}: PropsWithChildren<LinkProps>) {
  const saveScroll = useScrollStore((s) => s.saveScroll)
  const router = useTransitionRouter()
  const pathname = usePathname()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const isSupported = 'startViewTransition' in document

      const preserve = shouldPreserveDefault(e)

      // 뷰 트랜지션 안 쓰거나, 기본 동작 유지해야 하는 경우
      if (!isSupported || preserve || e.currentTarget.dataset['prevent']) return onClick?.(e)

      e.preventDefault()
      onClick?.(e)

      const navigate = replace ? router.replace : router.push

      const defaultTarget: SavedScrollTarget = {
        elId: 'window',
        scrollTop: window.scrollY,
      }

      const scrollTargets: SavedScrollTarget[] = [defaultTarget]

      if (saveScrollTargets) {
        const customTargets = saveScrollTargets.map((elId) => ({
          elId,
          scrollTop: document.getElementById(elId)?.scrollTop ?? 0,
        }))
        scrollTargets.push(...customTargets)
      }

      saveScroll(pathname, scrollTargets)
      navigate((as ?? href) as string, { scroll })
    },
    [onClick, href, as, replace, scroll, router, pathname, saveScroll, saveScrollTargets]
  )

  return (
    <NextLink
      {...rest}
      className={className}
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
    />
  )
}

function shouldPreserveDefault(e: React.MouseEvent<HTMLAnchorElement>): boolean {
  const nodeName = e.currentTarget.nodeName
  const target = e.currentTarget.getAttribute('target')
  return (
    e.defaultPrevented ||
    (nodeName.toUpperCase() === 'A' && target && target !== '_self') ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e.nativeEvent as any).which === 2
  )
}
