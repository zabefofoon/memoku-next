'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { PropsWithChildren, useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'

interface Props extends PropsWithChildren {
  isDarkMode: boolean
}

export function EnsureProviders(props: Props) {
  const tagsStore = useTagsStore()
  const themeStore = useThemeStore()

  useEffect(() => {
    tagsStore.initTags()
    themeStore.setIsDarkMode(props.isDarkMode)
  }, [])

  return <CookiesProvider>{props.children}</CookiesProvider>
}
