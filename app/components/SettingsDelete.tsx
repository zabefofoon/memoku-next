'use client'

import { COOKIE_THEME, COOKIE_TUTORIAL } from '@/const'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCookies } from 'react-cookie'
import { imagesDB } from '../lib/images.db'
import { tagsDB } from '../lib/tags.db'
import { todosDB } from '../lib/todos.db'
import { TodosDeleteModal } from './TodosDeleteModal'

export default function SettingsDelete() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [_, removeCookie] = useCookies([COOKIE_THEME, COOKIE_TUTORIAL])

  const deleteAllData = async (): Promise<void> => {
    router.back()
    removeCookie(COOKIE_THEME, { path: '/' })
    removeCookie(COOKIE_TUTORIAL, { path: '/' })
    await Promise.all([
      todosDB.deleteAllTodos(),
      tagsDB.deleteAllTags(),
      imagesDB.deleteAllImages(),
    ])

    location.href = '/app'
  }

  return (
    <div className='emboss-sheet | p-[16px]'>
      <TodosDeleteModal
        isShow={!!searchParams.get('delete')}
        close={router.back}
        done={deleteAllData}
      />
      <div className='flex items-center justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='text-red-500 | truncate text-[14px] font-[700] | shrink-0 | lg:py-[8px] | sm:w-[100px]'>
          {t('Settings.Init')}
        </p>
        <div className='flex gap-[6px] | text-red-500 text-[13px] underline'>
          <button
            type='button'
            onClick={() => {
              const urlParams = new URLSearchParams(searchParams.toString())
              urlParams.append('delete', 'true')
              router.push(`?${decodeURIComponent(urlParams.toString())}`, {
                scroll: false,
              })
            }}>
            {t('Settings.InitAllDelete')}
          </button>
        </div>
      </div>
    </div>
  )
}
