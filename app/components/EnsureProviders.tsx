'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { PropsWithChildren, useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'

interface Props extends PropsWithChildren {
  isDarkMode: boolean
}

export function EnsureProviders(props: Props) {
  const initTags = useTagsStore((state) => state.initTags)
  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode)
  const setScreenSize = useThemeStore((state) => state.setScreenSize)

  useEffect(() => {
    initTags()
    setIsDarkMode(props.isDarkMode)

    setScreenSize(window.innerWidth < 640 ? 'mobile' : 'desktop')
    const handleResize = () => setScreenSize(window.innerWidth < 640 ? 'mobile' : 'desktop')

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initTags, props.isDarkMode, setIsDarkMode, setScreenSize])

  return <CookiesProvider>{props.children}</CookiesProvider>
}
