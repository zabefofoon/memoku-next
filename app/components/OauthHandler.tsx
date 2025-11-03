'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MemberInfo } from '../models/Member'
import { useAuthStore } from '../stores/auth.store'

interface Props {
  memberInfo: MemberInfo
}
export default function OauthHandler(props: Props) {
  const authStore = useAuthStore((s) => s)
  const router = useRouter()

  useEffect(() => {
    authStore.setMemberInfo(props.memberInfo)
    router.replace('/')
  }, [router, props.memberInfo])

  return null
}
