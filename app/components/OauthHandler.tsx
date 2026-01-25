'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MemberInfo } from '../models/Member'
import { useAuthStore } from '../stores/auth.store'

interface Props {
  memberInfo: MemberInfo
}
export default function OauthHandler({ memberInfo }: Props) {
  const router = useRouter()

  useEffect(() => {
    const { setMemberInfo } = useAuthStore.getState()

    setMemberInfo(memberInfo)
    router.replace('/app')
  }, [memberInfo, router])

  return null
}
