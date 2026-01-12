'use client'

import { COOKIE_LANGUAGE } from '@/const'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCookies } from 'react-cookie'
import { If, Then } from 'react-if'
import { useAuthStore } from '../stores/auth.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIDropdown from './UIDropdown'

export default function SettingsLanguage() {
  const locale = useLocale()
  const memberInfo = useAuthStore((s) => s.memberInfo)
  const router = useRouter()
  const [_, setCookies] = useCookies()
  const [isOpen, setOpen] = useState(false)
  const t = useTranslations()

  const changeLanguage = (value: string) => {
    setCookies(COOKIE_LANGUAGE, value, { path: '/' })
    if (value === 'en') router.replace('/app/settings')
    else router.replace(`/${value}/app/settings`)
  }

  const langMap: Record<string, string> = {
    en: 'English',
    'pt-BR': 'Português',
    ko: '한국어',
    ja: '日本語',
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
  }

  const selectableLanguages = Object.entries(langMap).map(([key, value]) => ({ key, value }))

  return (
    <div className='emboss-sheet | p-[16px]'>
      <div className='flex items-center justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='truncate text-[14px] font-[700] | shrink-0 | lg:py-[8px] | sm:w-[100px]'>
          {t('Settings.Language')}
          <If condition={memberInfo?.email}>
            <Then>
              <span className='sm:hidden ml-[4px] | text-[12px] tracking-tight !font-[400] opacity-60'>
                ({memberInfo?.email.split('@')[0]})
              </span>
            </Then>
          </If>
        </p>
        <UIDropdown
          isOpen={isOpen}
          fitOptionsParent={false}
          onOpenChange={setOpen}
          renderButton={({ toggle }) => (
            <button
              className='flex items-center'
              type='button'
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                toggle()
              }}>
              <p className='text-[13px]'>{langMap[locale]}</p>
              <Icon
                name='chevron-down'
                className='ml-[4px] | text-[16px]'
              />
            </button>
          )}
          renderOptions={({ toggle }) => (
            <div className='py-[3px] | flex flex-col'>
              {selectableLanguages.map((lang) => (
                <button
                  key={lang.key}
                  type='button'
                  className={etcUtil.classNames([
                    'px-[20px] py-[3px] | flex justify-center hover:bg-slate-50 hover:dark:bg-zinc-600 | text-[13px]',
                    { 'bg-slate-50 dark:bg-zinc-600': locale === lang.key },
                  ])}
                  onClick={() => toggle(false, () => changeLanguage(lang.key))}>
                  {lang.value}
                </button>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  )
}
