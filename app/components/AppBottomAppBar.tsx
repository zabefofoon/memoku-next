'use client'

import etcUtil from '@/app/utils/etc.util'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import FloatingButtons from './FloatingButtons'
import { Icon } from './Icon'

const menus = [
  { href: '/', name: '홈', divided: false, icon: 'home', induce: false },
  { href: '/todos', name: '할일', divided: false, icon: 'todos', induce: false },
  { href: '/calendar', name: '달력', divided: false, icon: 'calendar', induce: false },
  { href: '/news', name: '소식', divided: true, icon: 'news', induce: true },
  { href: '/settings', name: '설정', divided: false, icon: 'setting', induce: false },
]

export default function AppBottomAppBar() {
  const pathname = usePathname()
  const [isShow, setIsShow] = useState(true)

  useEffect(() => {
    let prevScrollTop = 0

    const handleScroll = (): void => {
      const scrollEl = document.getElementById('scroll-el')
      if (!scrollEl) return
      if (scrollEl.scrollTop < 132) setIsShow(true)

      const current = scrollEl.scrollTop
      const diff = Math.abs(current - prevScrollTop)

      if (diff < 10) return

      setIsShow(current < prevScrollTop)
      prevScrollTop = current
    }

    const el = document.getElementById('scroll-el')
    el?.addEventListener('scroll', handleScroll)

    return () => {
      el?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (pathname.match(/\/todos\//gi)) return null

  return (
    <div
      className='w-full | fixed bottom-0 left-1/2 -translate-x-1/2 z-[50] | px-[8px] py-[12px] | sm:hidden | max-w-[360px] transition-transform'
      style={{
        transform: isShow ? 'translate(0, 0)' : 'translate(0, 100%)',
      }}>
      <FloatingButtons />
      <nav
        className='flex items-center | border-t border-x border-white | rounded-full shadow-lg overflow-hidden'
        style={{
          backdropFilter: 'blur(4px)',
        }}>
        {menus.map((menu) => (
          <Link
            href={menu.href}
            key={menu.href}
            className='w-full | p-[6px]'>
            <div
              className={etcUtil.classNames([
                'relative | flex flex-col items-center justify-center rounded-full | p-[6px]',
                { 'bg-indigo-500 text-white': pathname === menu.href },
              ])}>
              {menu.induce && (
                <div className='absolute w-[4px] top-[4px] left-[16px] | aspect-square rounded-full'></div>
              )}
              <Icon
                name={menu.icon}
                className='text-[24px]'
              />
              <span className='text-[10px]'>{menu.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}
