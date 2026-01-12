'use client'

import { useTranslations } from 'next-intl'
import UIModal from './UIModal'

interface Props {
  isShow: boolean
  done: () => void
  close: () => void
}

export function TodosDeleteModal({ isShow = false, done, close }: Props) {
  const t = useTranslations()
  return (
    <UIModal
      header={() => <span>{t('Delete.Title')}</span>}
      open={isShow ?? false}
      close={() => close()}
      content={() => <p className='text-[15px] whitespace-pre-line'>{t('Delete.Phrase')}</p>}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => done()}>
          <p className='text-white text-[15px] font-[700]'>{t('Delete.Do')}</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
          onClick={() => close()}>
          <p className='text-[15px]'>{t('Delete.Cancel')}</p>
        </button>
      )}
    />
  )
}
