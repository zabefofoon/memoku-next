'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { If, Then } from 'react-if'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import UIToggle from './UIToggle'

export default function SettingSync() {
  const router = useRouter()

  const t = useTranslations()
  const fileId = useSheetStore((s) => s.fileId)
  const setFileId = useSheetStore((s) => s.setFileId)
  const memberInfo = useAuthStore((s) => s.memberInfo)
  const setMemberInfo = useAuthStore((s) => s.setMemberInfo)

  const toggleGoogleSync = async (value: boolean): Promise<void> => {
    if (value) router.push('/api/auth/google')
    else {
      await api.postAuthGoogleLogout()
      setMemberInfo()
      setFileId('')
    }
  }

  return (
    <div className='emboss-sheet | p-[16px]'>
      <div className='flex items-center sm:items-start justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='truncate text-[14px] font-[700] | shrink-0 | lg:py-[8px] | sm:w-[100px]'>
          {t('Settings.Notification')}
          <If condition={memberInfo?.email}>
            <Then>
              <span className='sm:hidden ml-[4px] | text-[12px] tracking-tight !font-[400] opacity-60'>
                ({memberInfo?.email.split('@')[0]})
              </span>
            </Then>
          </If>
        </p>
        <div className='flex items-center gap-[6px] flex-wrap'>
          <UIToggle
            id='구글연동'
            onIcon='google'
            offIcon='google'
            checked={!!fileId}
            toggle={toggleGoogleSync}
            trackClass='dark:!bg-zinc-950'
          />
        </div>
      </div>
    </div>
  )
}
