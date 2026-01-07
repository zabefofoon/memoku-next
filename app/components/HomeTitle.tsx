'use client'

import { useAuthStore } from '../stores/auth.store'
import { DarkModeButton } from './DarkModeButton'

export default function HomeTitle() {
  const memberInfo = useAuthStore((s) => s.memberInfo)

  return (
    <div className='flex items-start justify-between | mb-[24px]'>
      <div>
        <h1 className='text-[20px] capitalize | opacity-80'>
          {memberInfo?.email ? `Hello! ${memberInfo.email.split('@')[0]}` : 'Welcome to MEMOKU!'}
        </h1>
        <p className='text-[16px] opacity-50'>Enjoy Memo and enforce your life!</p>
      </div>
      <div>
        <DarkModeButton />
      </div>
    </div>
  )
}
