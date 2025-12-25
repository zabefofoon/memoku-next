'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { PropsWithChildren, useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'

interface Props extends PropsWithChildren {
  isDarkMode: boolean
}

export function EnsureProviders({ isDarkMode, children }: Props) {
  const initTags = useTagsStore((state) => state.initTags)
  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode)
  const isDarkModeInStore = useThemeStore((state) => state.isDarkMode)
  const setScreenSize = useThemeStore((state) => state.setScreenSize)

  useEffect(() => {
    initTags()
    setIsDarkMode(isDarkMode)

    setScreenSize(window.innerWidth < 640 ? 'mobile' : 'desktop')
    const handleResize = () => setScreenSize(window.innerWidth < 640 ? 'mobile' : 'desktop')

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initTags, isDarkMode, setIsDarkMode, setScreenSize])

  useEffect(() => {
    console.log(isDarkModeInStore)
    document
      .querySelector('meta[name=theme-color]')
      ?.setAttribute('content', isDarkModeInStore ? '#18181b' : 'white')
  }, [isDarkModeInStore])

  return <CookiesProvider>{children}</CookiesProvider>
}
