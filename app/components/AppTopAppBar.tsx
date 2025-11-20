'use client'

import etcUtil from '@/app/utils/etc.util'
import { AGE_1_YEAR, COOKIE_THEME } from '@/const'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'
import { Icon } from './Icon'
import UIToggle from './UIToggle'

export function AppTopAppBar() {
  const [_, setCookie, removeCookie] = useCookies([COOKIE_THEME])
  const pathname = usePathname()

  const themeStore = useThemeStore()

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

  if (pathname.match(/\/todos\//gi)) return <TodosDetailHeader />
  return (
    <header className='sticky top-0 sm:hidden'>
      <div className='bg-gray-50 dark:bg-zinc-900 | border-b border-gray-200 dark:border-zinc-700 | h-[52px] | flex items-center | px-[12px]'>
        <Link
          href='/'
          className='flex items-center gap-[6px]'>
          <Icon
            name='logo'
            className='text-[24px]'
          />
          <span className='text-[18px] font-[700]'>MEMOKU</span>
        </Link>
        <div className='h-full | flex items-center gap-[4px] | ml-auto'>
          <UIToggle
            id='다크모드'
            onIcon='moon'
            offIcon='sun'
            trackClass='dark:!bg-zinc-700'
            checked={themeStore.isDarkMode}
            toggle={toggleDarkMode}
          />
          <Link
            type='button'
            href='/notifications'
            className={etcUtil.classNames([
              'rounded-full | p-[4px]',
              {
                'bg-gray-200 dark:bg-zinc-800': pathname === '/notifications',
              },
            ])}>
            <Icon
              name='notification'
              className='text-[24px]'
            />
          </Link>
          <Link
            href='/api/auth/google'
            prefetch={false}
            className='w-[24px] aspect-square | flex items-center justify-center | rounded-full'>
            <Icon
              name='google'
              className='text-[20px]'
            />
          </Link>
        </div>
      </div>
    </header>
  )
}

export function TodosDetailHeader() {
  const [textValue, setTextValue] = useState<string>('')

  useEffect(() => {
    const handleUpdateText = (event: Event): void => {
      const res = (event as CustomEvent<string>).detail
      setTextValue(res)
    }

    window.addEventListener('updateText', handleUpdateText)
    return () => {
      window.removeEventListener('updateText', handleUpdateText)
    }
  }, [])

  return (
    <header className='sticky top-0 sm:hidden'>
      <div className='bg-gray-50 dark:bg-zinc-900 | border-b border-gray-200 dark:border-zinc-700 | h-[52px] | flex items-center | px-[12px]'>
        <button
          type='button'
          className='opacity-80 | flex items-center | max-w-[300px]'
          onClick={() => history.back()}>
          <Icon
            name='chevron-left'
            className='text-[24px]'
          />
          <p className='text-[16px] truncate'>{textValue.split(/\n/)[0] || ''}</p>
        </button>
      </div>
    </header>
  )
}
