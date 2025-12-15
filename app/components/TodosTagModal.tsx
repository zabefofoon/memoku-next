'use client'

import { TAG_COLORS } from '@/const'
import { useEffect, useState } from 'react'
import { Tag } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
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
        <div className='flex gap-[6px] flex-wrap | max-w-[320px] | py-[6px] px-[4px]'>
          {tags.map((tag) => (
            <div
              key={tag.id}
              className='neu-button | relative | rounded-full '>
              <button
                type='button'
                className='button'
                onClick={() => setSelectedTag(tag)}>
                <div
                  className={etcUtil.classNames([
                    'button-inner | flex items-center gap-[4px]',
                    { 'bg-indigo-600/10': tag.id === selectedTag?.id },
                  ])}>
                  <span
                    className='w-[8px] aspect-square | rounded-full | bg-red-500'
                    style={{
                      background: tag
                        ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-800)'
                        : 'var(--color-slate-800)',
                    }}></span>
                  <p className='text-[13px] text-gray-600 leading-[100%]'>{tag?.label ?? 'MEMO'}</p>
                </div>
              </button>
              {selectedTag?.id === tag.id && (
                <div className='flex items-center justify-center  | absolute top-0 left-0 z-[1] | w-full h-full rounded-full'>
                  <Icon
                    name='check'
                    className='text-white text-[24px]'
                    style={{
                      filter: 'drop-shadow(1px 1px 1px var(--color-gray-400))',
                    }}
                  />
                </div>
              )}
            </div>
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
