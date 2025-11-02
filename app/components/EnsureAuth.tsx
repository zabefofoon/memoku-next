'use client'

import { PropsWithChildren, useRef } from 'react'
import { MemberInfo } from '../models/Member'
import { AuthStoreContext, createAuthStore } from '../stores/auth.store'

interface Props {
  memberInfo: MemberInfo
}

export default function EnsureAuth(props: PropsWithChildren<Props>) {
  const storeRef = useRef<ReturnType<typeof createAuthStore>>(null)
  if (!storeRef.current) {
    storeRef.current = createAuthStore(props.memberInfo?.ok ? props.memberInfo : undefined)
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>{props.children}</AuthStoreContext.Provider>
  )
}
