'use client'

import { TAG_COLORS } from '@/const'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'
import UIModal from './UIModal'

interface Props {
  isShow?: boolean
  done: (tagInfo: { label: string; color: keyof typeof TAG_COLORS }) => void
  close: () => void
}

export function SettingsTagModal(props: Props) {
  const searchParams = useSearchParams()
  const [cookies] = useCookies()
  const tagsStore = useTagsStore()

  const [tagName, setTagName] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<keyof typeof TAG_COLORS>()

  const tag = tagsStore.getTagsById(searchParams?.get('tag') ?? '')

  useEffect(() => {
    setTagName(tag?.label ?? '')
    setSelectedColor(tag?.color)
  }, [tag])

  return (
    <UIModal
      header={() => <span>태그 설정</span>}
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='flex flex-col | gap-[12px] | pb-[2px]'>
          <label className='flex items-center'>
            <span className='w-[100px] | text-[15px]'>이름</span>
            <input
              className='border border-gray-300 dark:border-zinc-600 rounded-lg | py-[4px] px-[8px]'
              placeholder='태그 이름'
              value={tagName}
              onInput={(event) => setTagName(event.currentTarget.value)}
            />
          </label>
          <div className='flex items-start'>
            <span className='w-[100px] | text-[15px] | py-[8px]'>색</span>
            <div className='flex flex-wrap gap-[6px] max-w-[240px]'>
              {Object.entries(TAG_COLORS).map(([key, value]) => (
                <button
                  key={key}
                  className='relative | flex flex-wrap gap-[6px] max-w-[240px]'
                  onClick={() => setSelectedColor(key as keyof typeof TAG_COLORS)}>
                  <span className='dark:bg-zinc-700 | p-[4px] shadow-sm shadow-gray-400 dark:shadow-gray-800 rounded-full'>
                    <span
                      className='w-[32px] | flex items-center justify-center | rounded-full | text-[14px] font-[700] | aspect-square'
                      style={{
                        background: cookies['x-theme'] === 'dark' ? value.dark : `${value.white}24`,
                        color: cookies['x-theme'] === 'dark' ? 'white' : value.white,
                      }}>
                      {tagName.slice(0, 1) || 'M'}
                    </span>
                  </span>
                  {selectedColor === key && (
                    <span className='flex items-center justify-center | absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 | w-full h-full bg-black/50 | rounded-full'>
                      <Icon
                        name='check'
                        className='text-white text-[24px]'
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-violet-500 py-[6px]'
          onClick={() =>
            tagName && selectedColor && props.done({ label: tagName, color: selectedColor })
          }>
          <p className='text-white text-[15px] font-[700]'>설정하기</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[6px]'
          onClick={() => props.close()}>
          <p className='text-[15px]'>취소하기</p>
        </button>
      )}
    />
  )
}
