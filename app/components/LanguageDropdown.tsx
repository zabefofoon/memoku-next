'use client'

import { COOKIE_LANGUAGE } from '@/const'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { useCookies } from 'react-cookie'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIDropdown from './UIDropdown'

export default function LanguageDropdown() {
  const locale = useLocale()
  const router = useRouter()
  const [_, setCookies] = useCookies()
  const [isOpen, setOpen] = useState(false)
  const pathname = usePathname()

  const changeLanguage = (value: string) => {
    setCookies(COOKIE_LANGUAGE, value, { path: '/' })
    router.replace(pathname, { locale: value })
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
  )
}
