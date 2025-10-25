'use client'

import { useEffect, useState } from 'react'
import { Tag } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import UIModal from './UIModal'

interface Props {
  isShow?: boolean
  select: (tag: Tag) => void
  close: () => void
}

export function TodosTagModal(props: Props) {
  const tagsStore = useTagsStore()
  const [selectedTag, setSelectedTag] = useState<Tag>()

  useEffect(() => {
    setSelectedTag(undefined)
  }, [props.isShow])

  return (
    <UIModal
      header={() => <span>태그선택</span>}
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='flex gap-[6px] flex-wrap | max-w-[320px] | pb-[2px]'>
          {tagsStore.tags.map((tag) => (
            <div
              key={tag.id}
              className='relative | rounded-full'>
              <TagBadge
                id={tag.id}
                click={() => setSelectedTag(tag)}
              />
              {selectedTag?.color === tag.color && (
                <div className='flex items-center justify-center  | absolute top-0 left-0 | w-full h-full rounded-full | bg-black/50'>
                  <Icon
                    name='check'
                    className='text-white text-[24px]'
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
          onClick={() => selectedTag && props.select(selectedTag)}>
          <p className='text-white text-[15px] font-[700]'>선택하기</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
          onClick={() => props.close()}>
          <p className='text-[15px]'>취소하기</p>
        </button>
      )}
    />
  )
}
