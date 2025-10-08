'use client'

import etcUtil from '@/app/utils/etc.util'
import { AGE_1_YEAR, COOKIE_THEME } from '@/const'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  return (
    <header className='sticky top-0 sm:hidden'>
      <div className='bg-gray-100 dark:bg-zinc-900 | border-b border-gray-200 dark:border-zinc-700 | h-[52px] | flex items-center | px-[12px]'>
        <Link
          href='/'
          className='flex items-center gap-[6px]'>
          <Icon
            name='logo'
            className='text-[24px]'
          />
          <span className='text-[18px] font-[700]'>MEMOKU</span>
        </Link>
        <div className='h-full | flex items-center gap-[8px] | ml-auto'>
          <UIToggle
            id='다크모드'
            onIcon='moon'
            offIcon='sun'
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
        </div>
      </div>
    </header>
  )
}
