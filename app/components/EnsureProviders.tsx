'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { PropsWithChildren, useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'
import { googleApi } from '../lib/googleApi'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useThemeStore } from '../stores/theme.store'

interface Props extends PropsWithChildren {
  isDarkMode: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any
}

export function EnsureProviders(props: Props) {
  const tagsStore = useTagsStore()
  const themeStore = useThemeStore()
  const sheetStore = useSheetStore()
  const authStore = useAuthStore((s) => s)

  useEffect(() => {
    tagsStore.initTags()
    themeStore.setIsDarkMode(props.isDarkMode)
    checkHasMemokuFile()
  }, [])

  const checkHasMemokuFile = async (): Promise<void> => {
    if (!authStore.memberInfo?.ok) return

    const res = await googleApi.getSheetId(props.headers)
    if (res.fileId) sheetStore.setFileId(res.fileId)
    console.log(res)
  }

  return <CookiesProvider>{props.children}</CookiesProvider>
}
