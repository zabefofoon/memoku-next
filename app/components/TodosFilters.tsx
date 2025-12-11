'use client'

import { FILTER_STATUS, TAG_COLORS } from '@/const'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { If, Then } from 'react-if'
import { Tag, Todo } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  close: () => void
}

export function TodosFilters(props: Props) {
  const [cookies] = useCookies()

  const router = useRouter()

  const tags = useTagsStore((s) => s.tags)
  const searchParams = useSearchParams()

  const [selectedStatus, setSelectedStatus] = useState<Todo['status'][]>([])
  const [selectedTags, setSelectedTags] = useState<Tag['id'][]>([])

  const status = searchParams.get('status')
  const tagsQuery = searchParams.get('tags')

  const statusMap = {
    done: {
      label: '완료됨',
      icon: 'check',
      color: 'var(--color-green-500)',
    },
    inprogress: {
      label: '진행중',
      icon: 'run',
      color: 'var(--color-indigo-500)',
    },
    hold: {
      label: '중지됨',
      icon: 'pause',
      color: 'var(--color-orange-600)',
    },
    created: {
      label: '생성됨',
      icon: 'plus',
      color: 'var(--color-slate-600)',
    },
  }

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
            <div className='flex items-center gap-[8px] flex-wrap | text-[14px]'>
              {FILTER_STATUS.map((item) => (
                <div
                  key={item.value}
                  className='neu-button | relative | rounded-full '>
                  <button
                    type='button'
                    className='button'
                    style={{
                      color: statusMap[item.value].color,
                    }}
                    onClick={() =>
                      setSelectedStatus((prev) =>
                        prev.includes(item.value)
                          ? prev.filter((child) => child !== item.value)
                          : [...prev, item.value]
                      )
                    }>
                    <div
                      className={etcUtil.classNames([
                        'button-inner | flex items-center gap-[4px]',
                        { 'bg-indigo-600/10': selectedStatus.includes(item.value) },
                      ])}>
                      <Icon name={item.icon} />
                      <p className='text-[11px] leading-[100%] whitespace-nowrap'>{item.label}</p>
                    </div>
                  </button>
                  <If condition={selectedStatus.includes(item.value)}>
                    <Then>
                      <div className='pointer-events-none | flex items-center justify-center | absolute top-0 left-0 z-[1] | w-full h-full rounded-full'>
                        <Icon
                          name='check'
                          className='text-white text-[24px]'
                          style={{
                            filter: 'drop-shadow(1px 1px 1px var(--color-gray-400))',
                          }}
                        />
                      </div>
                    </Then>
                  </If>
                </div>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-[4px]'>
            <p className='flex items-center gap-[2px] | text-gray-500 text-[13px]'>
              <Icon name='tag' />
              <span>태그</span>
            </p>
            <div className='flex flex-wrap gap-[6px]'>
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className='neu-button | relative | rounded-full '>
                  <button
                    type='button'
                    className='button'
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag.id)
                          ? prev.filter((child) => child !== tag.id)
                          : [...prev, tag.id]
                      )
                    }>
                    <div
                      className={etcUtil.classNames([
                        'button-inner | flex items-center gap-[4px]',
                        { 'bg-indigo-600/10': selectedTags.includes(tag.id) },
                      ])}>
                      <span
                        className='w-[8px] aspect-square | rounded-full | bg-red-500'
                        style={{
                          background: tag
                            ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-800)'
                            : 'var(--color-slate-800)',
                        }}></span>
                      <p className='text-[13px] text-gray-600 leading-[100%]'>
                        {tag?.label ?? 'MEMO'}
                      </p>
                    </div>
                  </button>
                  <If condition={selectedTags.includes(tag.id)}>
                    <Then>
                      <div className='pointer-events-none | flex items-center justify-center | absolute top-0 left-0 z-[1] | w-full h-full rounded-full'>
                        <Icon
                          name='check'
                          className='text-white text-[24px]'
                          style={{
                            filter: 'drop-shadow(1px 1px 1px var(--color-gray-400))',
                          }}
                        />
                      </div>
                    </Then>
                  </If>
                </div>
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
