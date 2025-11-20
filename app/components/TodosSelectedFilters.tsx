'use client'

import { FILTER_STATUS, STATUS_COLORS, TAG_COLORS } from '@/const'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCookies } from 'react-cookie'
import { Todo } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'

export default function TodosTagsFilter() {
  const [cookies] = useCookies()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const tagsStore = useTagsStore()

  const sorts = [
    { value: undefined, label: '등록순' },
    { value: 'recent', label: '최근 수정 순' },
  ]

  const excludeStatus = (item: Todo['status']): void => {
    const urlParams = new URLSearchParams(searchParams.toString())

    const current = (urlParams.get('status') ?? '').split(',').filter(Boolean)

    const next = current.filter((value) => value !== item)

    if (next.length === 0) urlParams.delete('status')
    else urlParams.set('status', next.join(','))

    const queryString = urlParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const excludeTag = (item: string): void => {
    const urlParams = new URLSearchParams(searchParams.toString())

    const current = (urlParams.get('tags') ?? '').split(',').filter(Boolean)

    const next = current.filter((value) => value !== item)

    if (next.length === 0) urlParams.delete('tags')
    else urlParams.set('tags', next.join(','))

    const queryString = urlParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  return (
    <div className='px-[12px] sm:p-0 | w-full overflow-auto scroll-hidden'>
      <div className='text-[12px] font-[700] | px-[2px] | flex items-center flex-nowrap sm:flex-wrap gap-[6px] sm:gap-[6px] | mb-[8px] sm:mb-[24px]'>
        {sorts
          .filter((sort) => (sort.value ?? '') === (searchParams.get('sort') ?? ''))
          .map((sort) => (
            <Link
              key={sort.label}
              href={`?${decodeURIComponent(searchParams.toString())}&filter=true`}
              className='rounded-full | bg-white | shadow-md'
              scroll={false}>
              <span
                className='px-[12px] | h-[32px] aspect-square | flex items-center justify-center gap-[4px] | rounded-full |  whitespace-nowrap'
                style={{
                  background:
                    cookies['x-theme'] === 'dark'
                      ? STATUS_COLORS['created']?.dark
                      : `${STATUS_COLORS['created'].white}24`,
                  color:
                    cookies['x-theme'] === 'dark' ? 'white' : `${STATUS_COLORS['created'].white}`,
                }}>
                <Icon
                  name='sort'
                  className='text-[16px]'
                />
                {sort.label}
              </span>
            </Link>
          ))}

        {FILTER_STATUS.filter((status) =>
          searchParams.get('status')?.split(',').includes(status.value)
        ).map((status) => (
          <button
            key={status.value}
            className='rounded-full | bg-white | shadow-md'
            onClick={() => excludeStatus(status.value)}>
            <span
              className='px-[12px] | h-[32px] aspect-square | flex items-center justify-center gap-[4px] | rounded-full | whitespace-nowrap'
              style={{
                background:
                  cookies['x-theme'] === 'dark'
                    ? STATUS_COLORS[status.value]?.dark
                    : `${STATUS_COLORS[status.value].white}24`,
                color:
                  cookies['x-theme'] === 'dark' ? 'white' : `${STATUS_COLORS[status.value].white}`,
              }}>
              <Icon
                name={status.icon}
                className='text-[16px]'
              />
              {status.label}
              <Icon
                name='close'
                className='text-[16px]'
              />
            </span>
          </button>
        ))}

        {tagsStore.tags
          .filter((tag) => searchParams.get('tags')?.includes(tag.id))
          .map((tag) => (
            <button
              key={tag.id}
              className='rounded-full | bg-white | shadow-md'
              onClick={() => excludeTag(tag.id)}>
              <span
                className='px-[12px] | h-[32px] aspect-square | flex items-center justify-center gap-[4px] | rounded-full | whitespace-nowrap'
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
                <Icon
                  name='tag'
                  className='text-[16px]'
                />
                {tag?.label ?? 'Memo'}
                <Icon
                  name='close'
                  className='text-[16px]'
                />
              </span>
            </button>
          ))}
      </div>
    </div>
  )
}
