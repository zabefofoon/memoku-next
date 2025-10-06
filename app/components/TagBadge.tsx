'use client'

import { Todo } from '@/app/models/Todo'
import { useTagsStore } from '@/app/stores/tags.store'
import { useCookies } from 'react-cookie'

interface Props {
  todo?: Todo
}

export default function TagBadge(props: Props) {
  const [cookies] = useCookies()
  const tagsStore = useTagsStore()

  const tag = tagsStore.getTagsById(props.todo?.tagId)

  if (props.todo == null) return null

  return (
    <div className='dark:bg-zinc-700 | p-[4px] shadow-sm shadow-gray-400 dark:shadow-gray-800 rounded-full'>
      <span
        className='w-[32px] | flex items-center justify-center | rounded-full | text-[14px] font-[700] | aspect-square'
        style={{
          background:
            cookies['x-theme'] === 'dark'
              ? `${tag?.color ?? '#000000'}`
              : `${tag?.color ?? '#000000'}24`,
          color: cookies['x-theme'] === 'dark' ? 'white' : (tag?.color ?? '#000000'),
        }}>
        {tag?.label?.slice(0, 1) ?? 'M'}
      </span>
    </div>
  )
}
