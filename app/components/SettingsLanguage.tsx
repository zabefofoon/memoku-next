'use client'

import { COOKIE_LANGUAGE } from '@/const'
import { useRouter } from 'next/navigation'
import { ChangeEvent } from 'react'
import { useCookies } from 'react-cookie'
import { If, Then } from 'react-if'
import { useAuthStore } from '../stores/auth.store'

export default function SettingsLanguage() {
  const memberInfo = useAuthStore((s) => s.memberInfo)
  const router = useRouter()
  const [cookie, setCookies] = useCookies()

  const changeLanguage = (event: ChangeEvent<HTMLSelectElement>) => {
    setCookies(COOKIE_LANGUAGE, event.target.value, { path: '/' })
    if (event.target.value === 'en') router.replace('/app/settings')
    else router.replace(`/${event.target.value}/app/settings`)
  }

  return (
    <div className='emboss-sheet | p-[16px]'>
      <div className='flex items-center justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='truncate text-[14px] font-[700] | shrink-0 | lg:py-[8px] | sm:w-[100px]'>
          언어
          <If condition={memberInfo?.email}>
            <Then>
              <span className='sm:hidden ml-[4px] | text-[12px] tracking-tight !font-[400] opacity-60'>
                ({memberInfo?.email.split('@')[0]})
              </span>
            </Then>
          </If>
        </p>
        <select
          value={cookie[COOKIE_LANGUAGE] ?? 'en'}
          onChange={changeLanguage}
          className='text-[14px]'>
          <option value='ko'>한국어</option>
          <option value='en'>English</option>
        </select>
      </div>
    </div>
  )
}
