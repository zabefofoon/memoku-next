'use client'

import { useTagsStore } from '@/stores/tags.store'
import { PropsWithChildren, useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'

export function EnsureProviders(props: PropsWithChildren) {
  const tagsStore = useTagsStore()

  useEffect(() => {
    tagsStore.initTags()
  }, [])

  return <CookiesProvider>{props.children}</CookiesProvider>
}
