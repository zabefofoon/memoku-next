'use client'

import { useEffect, useState } from 'react'
import { Tag } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'
import TagBadge from './TagBadge'

export default function SettingsTags() {
  const tagsStore = useTagsStore()

  const [tags, setTags] = useState<Tag[]>()

  useEffect(() => {
    setTags(tagsStore.tags)
  }, [tagsStore.tags])

  return (
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[16px]'>
      <div className='flex items-start flex-col lg:flex-row gap-[12px] lg:gap-[24px]'>
        <p className='text-[15px] font-[700] | shrink-0 | lg:py-[8px] | w-[100px]'>태그</p>
        <div className='flex items-center gap-[6px] flex-wrap'>
          {tags && (
            <>
              {tags?.map((tag) => (
                <div
                  key={tag.id}
                  className='relative'>
                  <TagBadge id={tag.id} />
                  <button className='absolute top-0 right-0 translate-x-[4px] -translate-y-[4px] | bg-gray-100 dark:bg-zinc-700 rounded-full p-[2px]'>
                    <Icon
                      name='delete'
                      className='text-[16px]'
                    />
                  </button>
                </div>
              ))}
              <TagBadge />
            </>
          )}
          <button className='w-[36px] aspect-square | border border-dashed rounded-full border-slate-400 dark:border-zinc-500 | flex items-center justify-center'>
            <Icon name='plus' />
          </button>
        </div>
      </div>
    </div>
  )
}
