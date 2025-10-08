'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { TAG_COLORS } from '@/const'
import { useCookies } from 'react-cookie'
import { Tag } from '../models/Todo'

interface Props {
  id?: string
  click?: (tag?: Tag) => void
}

export default function TagBadge(props: Props) {
  const [cookies] = useCookies()
  const tagsStore = useTagsStore()

  const tag = tagsStore.getTagsById(props.id)

  return (
    <button
      className='dark:bg-zinc-700 | p-[4px] shadow-sm shadow-gray-400 dark:shadow-gray-800 rounded-full'
      onClick={() => props.click?.(tag)}>
      <span
        className='w-[32px] | flex items-center justify-center | rounded-full | text-[14px] font-[700] | aspect-square'
        style={{
          background:
            cookies['x-theme'] === 'dark'
              ? `${tag?.color ? (TAG_COLORS[tag.color]?.dark ?? '#000000') : '#000000'}`
              : `${tag?.color ? `${TAG_COLORS[tag.color]?.white ?? '#000000'}24` : '#00000024'}`,
          color:
            cookies['x-theme'] === 'dark'
              ? 'white'
              : tag?.color
                ? (TAG_COLORS[tag?.color]?.white ?? '#000000')
                : '#000000',
        }}>
        {tag?.label?.slice(0, 1) ?? 'M'}
      </span>
    </button>
  )
}
