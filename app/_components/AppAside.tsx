'use client'

import etcUtil from '@/utils/etc.util'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCookies } from 'react-cookie'
import packageJson from '../../package.json'

import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import UIToggle from './UIToggle'

interface Props {
  isDarkMode: boolean
}

const menus = [
  { href: '/', name: '대시보드', divided: false, icon: 'home', induce: false },
  { href: '/todos', name: '할일', divided: false, icon: 'todos', induce: false },
  { href: '/calendar', name: '달력', divided: false, icon: 'calendar', induce: false },
  { href: '/settings', name: '설정', divided: false, icon: 'setting', induce: false },
  { href: '/news', name: '소식', divided: true, icon: 'news', induce: true },
  { href: '/intro', name: '소개', divided: false, icon: 'help', induce: false },
]

export function AppAside(props: Props) {
  const pathname = usePathname()
  const [cookies, setCookie, removeCookie] = useCookies(['x-theme'])
  const [isDarkMode, setIsDarkMode] = useState<boolean>(props.isDarkMode)

  const toggleDarkMode = (value: boolean): void => {
    setIsDarkMode(value)
    if (value) {
      document.documentElement.classList.add('dark')
      setCookie('x-theme', 'dark', { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' })
    } else {
      document.documentElement.classList.remove('dark')
      removeCookie('x-theme', { path: '/' })
    }
  }

  useEffect(() => {
    setIsDarkMode(cookies['x-theme'] === 'dark')
  }, [cookies])

  return (
    <aside>
      <div className='flex flex-col | sticky top-[24px] | w-[240px] h-[calc(100dvh-48px)] | bg-white dark:bg-zinc-800 | rounded-2xl | shadow-lg'>
        <Link
          href='/'
          className='px-[10px] py-[12px] | flex items-center gap-[6px]'>
          <Icon
            name='logo'
            className='text-[20px]'
          />
          <span className='text-[18px] font-[700]'>MEMOKU</span>
        </Link>
        <nav className='flex flex-col gap-[4px]'>
          {menus.map((menu) => (
            <div
              key={menu.href}
              className={etcUtil.classNames([
                {
                  'border-t border-gray-100 dark:border-zinc-600 | mt-[12px] pt-[12px]':
                    menu.divided,
                },
              ])}>
              <Link
                href={menu.href}
                aria-current={pathname === menu.href ? 'page' : undefined}
                className={etcUtil.classNames([
                  'relative | flex items-center gap-[6px] | py-[6px] px-[10px] mx-[4px] | rounded-full hover:bg-slate-50 hover:dark:bg-zinc-700/50',
                  {
                    'bg-slate-100 dark:bg-zinc-700 hover:bg-slate-100 hover:dark:bg-zinc-700':
                      pathname === menu.href,
                  },
                ])}>
                <Icon
                  name={menu.icon}
                  className='text-[20px]'
                />
                <span className='text-[14px] align-top'>{menu.name}</span>
                {menu.induce && (
                  <div className='absolute w-[4px] top-[6px] left-[8px] | aspect-square rounded-full | bg-red-500'></div>
                )}
              </Link>
            </div>
          ))}
        </nav>
        <div className='flex items-center justify-between | mt-auto | px-[8px] py-[12px]'>
          <UIToggle
            id='다크모드'
            onIcon='moon'
            offIcon='sun'
            checked={isDarkMode}
            toggle={toggleDarkMode}
          />
          <span className='text-[13px]'>v{packageJson.version}</span>
        </div>
      </div>
    </aside>
  )
}
