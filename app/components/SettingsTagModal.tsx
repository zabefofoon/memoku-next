'use client'

import { TAG_COLORS } from '@/const'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTagsStore } from '../stores/tags.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIModal from './UIModal'

interface Props {
  isShow?: boolean
  done: (tagInfo: { label: string; color: keyof typeof TAG_COLORS }) => void
  close: () => void
}

export function SettingsTagModal({ isShow = false, done, close }: Props) {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const getTagsById = useTagsStore((s) => s.getTagsById)

  const [tagName, setTagName] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<keyof typeof TAG_COLORS>()

  const tag = getTagsById(searchParams?.get('tag') ?? '')

  useEffect(() => {
    if (tag) {
      setTagName(tag.label || 'MEMO')
      setSelectedColor(tag.color)
    }
  }, [tag])

  return (
    <UIModal
      header={() => <span>{t('Settings.TagSetting')}</span>}
      open={isShow}
      close={() => close()}
      content={() => (
        <div className='flex flex-col | gap-[12px] | pb-[2px]'>
          <label className='flex items-center'>
            <span className='w-[100px] | text-[15px]'>{t('Settings.Name')}</span>
            <input
              className='border border-gray-300 dark:border-zinc-600 rounded-lg | py-[4px] px-[8px]'
              placeholder={t('Settings.Name')}
              value={tagName}
              onInput={(event) => setTagName(event.currentTarget.value)}
            />
          </label>
          <div className='flex items-start'>
            <span className='w-[100px] | text-[15px] | py-[8px]'>{t('Settings.TagColor')}</span>
            <div className='flex flex-wrap gap-[6px] max-w-[240px]'>
              {Object.entries(TAG_COLORS).map(([key, value]) => (
                <div
                  className='relative'
                  key={key}>
                  <button
                    key={key}
                    type='button'
                    className={etcUtil.classNames([
                      'neu-button',
                      { active: selectedColor === key },
                    ])}
                    onClick={() => setSelectedColor(key as keyof typeof TAG_COLORS)}>
                    <Icon
                      name='tag-active'
                      className='text-[11px] translate-y-[1px]'
                      style={{ color: value.white }}
                    />
                    {tagName || 'MEMO'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() =>
            tagName && selectedColor && done({ label: tagName, color: selectedColor })
          }>
          <p className='text-white text-[15px] font-[700]'>{t('Todo.PeriodModalDone')}</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
          onClick={() => close()}>
          <p className='text-[15px]'>{t('Todo.PeriodModalCancel')}</p>
        </button>
      )}
    />
  )
}
