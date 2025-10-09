'use client'

import { TAG_COLORS } from '@/const'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCookies } from 'react-cookie'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'

export default function TodosTagsFilter() {
  const [cookies] = useCookies()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const tagsStore = useTagsStore()

  const urlParams = new URLSearchParams(searchParams.toString())
  const list = urlParams.get('tags')?.split(',').filter(Boolean) ?? []
  const set = new Set(list)

  const moveTo = (tagId: string): void => {
    if (set.has(tagId)) set.delete(tagId)
    else set.add(tagId)

    if (set.size === 0) urlParams.delete('tags')
    else urlParams.set('tags', [...set].join(','))

    const queryString = urlParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  return (
    <div className='px-[2px] | flex flex-wrap gap-[6px] | mb-[24px]'>
      {tagsStore.tags.map((tag) => (
        <div
          key={tag.id}
          className='relative'>
          <button
            className='bg-white dark:bg-zinc-700 | p-[4px] shadow-sm shadow-gray-400 dark:shadow-gray-800 rounded-full'
            onClick={() => moveTo(tag.id)}>
            <span
              className='px-[8px] | flex items-center justify-center | rounded-full | text-[13px] font-[700]'
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
              {tag?.label ?? 'Memo'}
            </span>
          </button>
          {set.has(tag.id) && (
            <div className='absolute top-0 left-0 | pointer-events-none | flex items-center justify-center | w-full h-full | bg-black/50 rounded-full'>
              <Icon
                name='check'
                className='text-white'
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
