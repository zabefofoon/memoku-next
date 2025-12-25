'use client'

import { TAG_COLORS } from '@/const'
import { useEffect, useState } from 'react'
import { Tag } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useThemeStore } from '../stores/theme.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow: boolean
  select: (tag: Tag) => void
  close: () => void
}

export function TodosTagModal({ isShow = false, select, close }: Props) {
  const tags = useTagsStore((s) => s.tags)
  const isDarkMode = useThemeStore((s) => s.isDarkMode)

  const [selectedTag, setSelectedTag] = useState<Tag>()

  useEffect(() => {
    setSelectedTag(undefined)
  }, [isShow])

  return (
    <UIBottomSheet
      header={() => <span>태그변경</span>}
      open={isShow}
      close={() => close()}
      content={() => (
        <div className='flex gap-[6px] flex-wrap | max-w-[320px] | py-[12px] px-[4px]'>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type='button'
              className={etcUtil.classNames(['neu-button', { active: tag.id === selectedTag?.id }])}
              onClick={() => setSelectedTag(tag)}>
              <Icon
                name='tag-active'
                className='text-[11px] translate-y-[1px]'
                style={{
                  color: tag
                    ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-500)'
                    : 'var(--color-slate-500)',
                }}
              />
              <p className='text-[13px] text-gray-600 dark:text-zinc-200 leading-[100%]'>
                {tag?.label ?? 'MEMO'}
              </p>
            </button>
          ))}
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => selectedTag && select(selectedTag)}>
          <p className='text-white text-[15px] font-[700]'>선택하기</p>
        </button>
      )}
    />
  )
}
