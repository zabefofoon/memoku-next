'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MemberInfo } from '../models/Member'
import { useAuthStore } from '../stores/auth.store'

interface Props {
  memberInfo: MemberInfo
}
export default function OauthHandler(props: Props) {
  const setMemberInfo = useAuthStore((s) => s.setMemberInfo)
  const router = useRouter()

  useEffect(() => {
    setMemberInfo(props.memberInfo)
    router.replace('/')
  }, [router, props.memberInfo, setMemberInfo])

  return null
}
