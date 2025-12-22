'use client'

import { AGE_1_YEAR, COOKIE_EXPAND, COOKIE_THEME } from '@/const'
import { useCookies } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'
import UIToggle from './UIToggle'

export default function SettingsTags() {
  const [_, setCookie, removeCookie] = useCookies([COOKIE_THEME, COOKIE_EXPAND])
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode)

  const toggleDarkMode = (value: boolean): void => {
    setIsDarkMode(value)
    if (value) {
      document.documentElement.classList.add('dark')
      setCookie(COOKIE_THEME, 'dark', { maxAge: AGE_1_YEAR, path: '/', sameSite: 'lax' })
    } else {
      document.documentElement.classList.remove('dark')
      removeCookie(COOKIE_THEME, { path: '/' })
    }
  }

  return (
    <div className='emboss-sheet'>
      <div className='p-[8px] | flex items-start flex-col lg:flex-row gap-[12px] lg:gap-[24px]'>
        <p className='text-[15px] font-[700] | shrink-0 | lg:py-[8px] | w-[100px]'>다크모드</p>
        <div className='flex items-center gap-[6px] flex-wrap'>
          <UIToggle
            id='다크모드'
            onIcon='moon'
            offIcon='sun'
            checked={isDarkMode}
            toggle={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  )
}
