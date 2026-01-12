'use client'

import { useTranslations } from 'next-intl'
import { useAuthStore } from '../stores/auth.store'
import { DarkModeButton } from './DarkModeButton'

export default function HomeTitle() {
  const memberInfo = useAuthStore((s) => s.memberInfo)
  const t = useTranslations('Home')
  return (
    <div className='flex items-start justify-between | mb-[24px]'>
      <div>
        <h1 className='text-[20px] | opacity-80'>
          {memberInfo?.email ? `Hello! ${memberInfo.email.split('@')[0]}` : t('PageTitle')}
        </h1>
        <p className='text-[16px] opacity-50'>{t('PageDesc')}</p>
      </div>
      <div>
        <DarkModeButton />
      </div>
    </div>
  )
}
