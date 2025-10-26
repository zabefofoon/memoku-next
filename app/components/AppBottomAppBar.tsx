'use client'

import etcUtil from '@/app/utils/etc.util'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  if (pathname.match(/\/todos\//gi)) return null

  return (
    <div className='w-full | sticky bottom-0 left-0 z-[50] | px-[8px] py-[12px] mx-auto | sm:hidden | max-w-[360px]'>
      <nav className='flex items-center | bg-white dark:bg-zinc-800 | rounded-full shadow-lg overflow-hidden'>
        {menus.map((menu) => (
          <Link
            href={menu.href}
            key={menu.href}
            replace
            className='w-full | p-[6px]'>
            <div
              className={etcUtil.classNames([
                'relative | flex flex-col items-center justify-center rounded-full | p-[6px]',
                { 'bg-indigo-500 text-white': pathname === menu.href },
              ])}>
              {menu.induce && (
                <div className='absolute w-[4px] top-[4px] left-[16px] | aspect-square rounded-full | bg-red-500'></div>
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
