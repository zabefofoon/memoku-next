'use client'

import { FILTER_STATUS, STATUS_MAP, TAG_COLORS } from '@/const'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tag, Todo } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useThemeStore } from '../stores/theme.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  close: () => void
}

export function TodosFilters(props: Props) {
  const router = useRouter()

  const isDarkMode = useThemeStore((s) => s.isDarkMode)
  const tags = useTagsStore((s) => s.tags)
  const searchParams = useSearchParams()

  const [selectedStatus, setSelectedStatus] = useState<Todo['status'][]>([])
  const [selectedTags, setSelectedTags] = useState<Tag['id'][]>([])

  const status = searchParams.get('status')
  const tagsQuery = searchParams.get('tags')

  const apply = (): void => {
    const base: Record<string, string> = {}
    if (searchParams.get('searchText')) base.searchText = searchParams.get('searchText') as string
    if (selectedStatus.length) base.status = selectedStatus.join(',')
    if (selectedTags.length) base.tags = selectedTags.join(',')
    const params = new URLSearchParams(base)

    router.replace(`?${decodeURIComponent(params.toString())}`, { scroll: false })
  }

  useEffect(() => {
    setSelectedStatus((status?.split(',') ?? []) as Todo['status'][])
    setSelectedTags(tagsQuery?.split(',') ?? [])
  }, [status, tagsQuery])

  return (
    <UIBottomSheet
      header={() => <span>필터</span>}
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='flex flex-col gap-[24px] | py-[12px]'>
          <div className='flex flex-col gap-[4px]'>
            <p className='flex items-center gap-[2px] | text-gray-500 text-[13px]'>
              <Icon name='run' />
              <span>상태</span>
            </p>
            <div className='flex items-center gap-[8px] flex-wrap | text-[14px] | px-[8px]'>
              {FILTER_STATUS.map((item) => (
                <button
                  key={item.value}
                  type='button'
                  className={etcUtil.classNames('neu-button', [
                    { active: selectedStatus.includes(item.value) },
                  ])}
                  style={{
                    color: isDarkMode
                      ? STATUS_MAP[item.value].darkColor
                      : STATUS_MAP[item.value].color,
                  }}
                  onClick={() =>
                    setSelectedStatus((prev) =>
                      prev.includes(item.value)
                        ? prev.filter((child) => child !== item.value)
                        : [...prev, item.value]
                    )
                  }>
                  <Icon name={item.icon} />
                  <p>{item.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-[4px]'>
            <p className='flex items-center gap-[2px] | text-gray-500 text-[13px]'>
              <Icon name='tag' />
              <span>태그</span>
            </p>
            <div className='flex flex-wrap gap-[6px] | px-[8px]'>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type='button'
                  className={etcUtil.classNames('neu-button', [
                    { active: selectedTags.includes(tag.id) },
                  ])}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((child) => child !== tag.id)
                        : [...prev, tag.id]
                    )
                  }>
                  <Icon
                    name='tag-active'
                    className='text-[11px] translate-y-[1px]'
                    style={{
                      color: tag
                        ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-500)'
                        : 'var(--color-slate-500)',
                    }}
                  />
                  <p>{tag?.label ?? 'MEMO'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={apply}>
          <p className='text-white text-[15px] font-[700]'>적용하기</p>
        </button>
      )}
    />
  )
}
