'use client'

import { AGE_1_YEAR, COOKIE_THEME } from '@/const'
import { useCookies } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'
import UIToggle from './UIToggle'

export function DarkModeButton() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode)
  const [_, setCookie, removeCookie] = useCookies([COOKIE_THEME])

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
    <UIToggle
      id='다크모드'
      onIcon='moon'
      offIcon='sun'
      checked={isDarkMode}
      toggle={toggleDarkMode}
    />
  )
}
