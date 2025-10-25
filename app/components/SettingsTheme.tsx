'use client'

import { AGE_1_YEAR, COOKIE_EXPAND, COOKIE_THEME } from '@/const'
import { useCookies } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'
import UIToggle from './UIToggle'

export default function SettingsTags() {
  const [_, setCookie, removeCookie] = useCookies([COOKIE_THEME, COOKIE_EXPAND])
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
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[16px]'>
      <div className='flex items-start flex-col lg:flex-row gap-[12px] lg:gap-[24px]'>
        <p className='text-[15px] font-[700] | shrink-0 | lg:py-[8px] | w-[100px]'>다크모드</p>
        <div className='flex items-center gap-[6px] flex-wrap'>
          <UIToggle
            id='다크모드'
            onIcon='moon'
            offIcon='sun'
            checked={themeStore.isDarkMode}
            toggle={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  )
}
