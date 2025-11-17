'use client'

import etcUtil from '@/app/utils/etc.util'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCookies } from 'react-cookie'
import packageJson from '../../package.json'

import { AGE_1_YEAR, COOKIE_EXPAND, COOKIE_THEME } from '@/const'
import { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useThemeStore } from '../stores/theme.store'
import { Icon } from './Icon'
import UIToggle from './UIToggle'

interface Props {
  isExpand: boolean
}

const menus = [
  { href: '/', name: '홈', divided: false, icon: 'home', induce: false },
  { href: '/todos', name: '할일', divided: false, icon: 'todos', induce: false },
  { href: '/calendar', name: '달력', divided: false, icon: 'calendar', induce: false },
  { href: '/settings', name: '설정', divided: false, icon: 'setting', induce: false },
  { href: '/notifications', name: '알림', divided: false, icon: 'notification', induce: false },
  { href: '/news', name: '소식', divided: true, icon: 'news', induce: true },
  { href: '/intro', name: '소개', divided: false, icon: 'help', induce: false },
]

export function AppAside(props: Props) {
  const sheetStore = useSheetStore()
  const themeStore = useThemeStore()
  const pathname = usePathname()
  const [_, setCookie, removeCookie] = useCookies([COOKIE_THEME, COOKIE_EXPAND])

  const [isExpand, setIsExpand] = useState<boolean>(props.isExpand)

  const authStore = useAuthStore((s) => s)

  const toggleDarkMode = (value: boolean): void => {
    themeStore.setIsDarkMode(value)
    if (value) {
      document.documentElement.classList.add('dark')
      setCookie(COOKIE_THEME, 'dark', { maxAge: AGE_1_YEAR, path: '/', sameSite: 'lax' })
    } else {
      document.documentElement.classList.remove('dark')
      removeCookie(COOKIE_THEME, { path: '/' })
    }
  }

  const toggleExpandAside = (): void => {
    setIsExpand(!isExpand)
    if (isExpand) removeCookie(COOKIE_EXPAND, { path: '/' })
    else setCookie(COOKIE_EXPAND, 'true', { maxAge: AGE_1_YEAR, path: '/', sameSite: 'lax' })
  }

  const logout = async (): Promise<void> => {
    await fetch('/api/auth/google/logout', { method: 'POST' })
    authStore.setMemberInfo()
    sheetStore.setFileId('')
  }

  return (
    <aside
      className={etcUtil.classNames([
        'relative | hidden lg:flex flex-col | sticky top-[24px] | h-[calc(100dvh-48px)] | bg-white dark:bg-zinc-800 | rounded-l-2xl rounded-b-2xl | shadow-lg transition-[width]',
        isExpand ? 'w-[240px]' : 'w-[62px]',
      ])}>
      <button
        className='absolute right-0 top-0 translate-x-full | bg-white dark:bg-zinc-800 rounded-r-full | py-[12px]'
        type='button'
        onClick={toggleExpandAside}>
        <Icon name='expand' />
      </button>
      <Link
        href='/'
        className='px-[20px] py-[12px] | flex items-center gap-[6px]'>
        <Icon
          name='logo'
          className='text-[24px] my-[8px]'
        />
        {isExpand && <span className='text-[18px] font-[700]'>MEMOKU</span>}
      </Link>
      <nav className='flex flex-col gap-[4px]'>
        {menus.map((menu) => (
          <div
            key={menu.href}
            className={etcUtil.classNames([
              {
                'border-t border-gray-100 dark:border-zinc-600 | mt-[12px] pt-[12px]': menu.divided,
              },
            ])}>
            <Link
              href={menu.href}
              aria-current={pathname === menu.href ? 'page' : undefined}
              className={etcUtil.classNames([
                'relative | flex items-center gap-[6px] | py-[12px] px-[16px] mx-[4px] | rounded-full hover:bg-slate-50 hover:dark:bg-zinc-700/50',
                {
                  'text-white | bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-500 hover:dark:bg-indigo-600':
                    pathname === menu.href,
                },
              ])}>
              <Icon
                name={menu.icon}
                className='text-[20px]'
              />
              {isExpand && (
                <span className='text-[14px] align-top whitespace-nowrap'>{menu.name}</span>
              )}
              {menu.induce && (
                <div className='absolute w-[4px] top-[10px] left-[16px] | aspect-square rounded-full | bg-red-500'></div>
              )}
            </Link>
          </div>
        ))}
      </nav>
      <div className='mt-auto'>
        {authStore.memberInfo && (
          <div className='border border-gray-100 dark:border-zinc-700 rounded-xl shadow-sm | flex items-center gap-[8px] | py-[12px] px-[12px] mx-[4px]'>
            <img
              className='rounded-full | w-[32px] aspect-square'
              src={authStore.memberInfo.picture ?? ''}
              alt={authStore.memberInfo.email}
            />
            <div className='flex flex-col gap-[2px] | overflow-hidden | leading-[100%]'>
              <p className='text-[13px] truncate'>{authStore.memberInfo?.email}</p>
              <div className='flex'>
                <Icon name='logout' />
                <button
                  className='text-[12px]'
                  onClick={logout}>
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
        <div
          className={etcUtil.classNames([
            'flex items-center justify-between | px-[8px] py-[12px]',
            { 'flex-col': !isExpand },
          ])}>
          <div className='flex items-center gap-[6px]'>
            {!authStore.memberInfo && (
              <Link
                href='/api/auth/google'
                prefetch={false}
                className='w-[32px] aspect-square | flex items-center justify-center | rounded-full bg-white dark:bg-zinc-700 shadow-sm shadow-black/30 dark:shadow-black/60'>
                <Icon name='google' />
              </Link>
            )}
            <UIToggle
              id='다크모드'
              onIcon='moon'
              offIcon='sun'
              checked={themeStore.isDarkMode}
              toggle={toggleDarkMode}
            />
          </div>
          <span className='text-[13px]'>v{packageJson.version}</span>
        </div>
      </div>
    </aside>
  )
}
