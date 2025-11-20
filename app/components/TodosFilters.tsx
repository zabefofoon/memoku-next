'use client'

import { FILTER_STATUS, STATUS_COLORS, TAG_COLORS } from '@/const'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Tag, Todo } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  close: () => void
  apply: (sort: 'recent' | undefined, status: Todo['status'][], tags: Tag['id'][]) => void
}

export function TodosFilters(props: Props) {
  const [cookies] = useCookies()
  const tagsStore = useTagsStore()
  const searchParams = useSearchParams()

  const [selectedSort, setSelectedSort] = useState<'recent'>()
  const [selectedStatus, setSelectedStatus] = useState<Todo['status'][]>([])
  const [selectedTags, setSelectedTags] = useState<Tag['id'][]>([])

  const sorts = [
    { label: '등록 순', value: undefined },
    { label: '최근 수정 순', value: 'recent' },
  ] as const

  useEffect(() => {
    setSelectedSort((searchParams.get('sort') || undefined) as 'recent' | undefined)
    setSelectedStatus((searchParams.get('status')?.split(',') ?? []) as Todo['status'][])
    setSelectedTags(searchParams.get('tags')?.split(',') ?? [])
  }, [searchParams])

  return (
    <UIBottomSheet
      header={() => <span>필터</span>}
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='flex flex-col gap-[24px] | py-[12px]'>
          <div className='flex flex-col gap-[4px]'>
            <p className='flex items-center gap-[2px] | text-gray-500 text-[13px]'>
              <Icon name='sort' />
              <span>정렬</span>
            </p>
            <div className='flex items-center gap-[8px] | text-[13px]'>
              {sorts.map((sort) => (
                <label
                  key={sort.value ?? ''}
                  className={etcUtil.classNames([
                    'cursor-pointer | flex items-center gap-[8px] | py-[4px] px-[12px] | rounded-full | whitespace-nowrap',
                    selectedSort === sort.value ? 'bg-indigo-500 | inset-shadow-sm' : 'shadow-md',
                  ])}>
                  <input
                    type='radio'
                    className={etcUtil.classNames([
                      'checked:border-[2px] checked:border-white checked:bg-indigo-600 | w-[10px] h-[10px] | border border-gray-300 | cursor-pointer appearance-none rounded-full',
                    ])}
                    checked={sort.value === selectedSort}
                    onChange={() => setSelectedSort(sort.value)}
                  />
                  <p
                    className={etcUtil.classNames([
                      selectedSort === sort.value ? 'text-white' : 'text-gray-400',
                    ])}>
                    {sort.label}
                  </p>
                </label>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-[4px]'>
            <p className='flex items-center gap-[2px] | text-gray-500 text-[13px]'>
              <Icon name='run' />
              <span>상태</span>
            </p>
            <div className='flex items-center gap-[8px] flex-wrap | text-[14px]'>
              {FILTER_STATUS.map((item) => (
                <div
                  key={item.value}
                  className='relative'>
                  <button
                    type='button'
                    className='rounded-full | bg-white | shadow-md'
                    onClick={() =>
                      setSelectedStatus((prev) =>
                        prev.includes(item.value)
                          ? prev.filter((child) => child !== item.value)
                          : [...prev, item.value]
                      )
                    }>
                    <span
                      className='text-[13px] | py-[4px] px-[12px] | flex items-center justify-center gap-[4px] | rounded-full | whitespace-nowrap'
                      style={{
                        background:
                          cookies['x-theme'] === 'dark'
                            ? STATUS_COLORS[item.value]?.dark
                            : `${STATUS_COLORS[item.value].white}24`,
                        color:
                          cookies['x-theme'] === 'dark'
                            ? 'white'
                            : `${STATUS_COLORS[item.value].white}`,
                      }}>
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </span>
                  </button>
                  {selectedStatus.includes(item.value) && (
                    <div className='inset-shadow-sm | pointer-events-none | flex items-center justify-center | absolute top-0 left-0 | w-full h-full | bg-black/20 | rounded-full'>
                      <Icon
                        name='check'
                        className='text-white'
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-[4px]'>
            <p className='flex items-center gap-[2px] | text-gray-500 text-[13px]'>
              <Icon name='tag' />
              <span>상태</span>
            </p>
            <div className='flex flex-wrap gap-[6px]'>
              {tagsStore.tags.map((tag) => (
                <div
                  key={tag.id}
                  className='relative'>
                  <button
                    className={etcUtil.classNames([
                      'rounded-full | bg-white',
                      selectedTags.includes(tag.id) ? '' : 'shadow-md',
                    ])}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag.id)
                          ? prev.filter((child) => child !== tag.id)
                          : [...prev, tag.id]
                      )
                    }>
                    <span
                      className='text-[13px] | py-[4px] px-[12px] | flex items-center justify-center gap-[4px] | rounded-full | whitespace-nowrap'
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
                  {selectedTags.includes(tag.id) && (
                    <div className='inset-shadow-sm pointer-events-none | flex items-center justify-center | absolute top-0 left-0 | w-full h-full | bg-black/20 | rounded-full'>
                      <Icon
                        name='check'
                        className='text-white'
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => props.apply(selectedSort, selectedStatus, selectedTags)}>
          <p className='text-white text-[15px] font-[700]'>적용하기</p>
        </button>
      )}
    />
  )
}
