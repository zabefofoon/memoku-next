'use client'

import { COOKIE_THEME, FILTER_STATUS, STATUS_COLORS } from '@/const'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Tag } from '../models/Todo'
import { Icon } from './Icon'
import UIModal from './UIModal'

interface Props {
  isShow?: boolean
  select?: (tag: Tag) => void
  close: () => void
}

export function TodosStatusModal(props: Props) {
  const [cookies] = useCookies([COOKIE_THEME])
  const [selectedTag, setSelectedTag] = useState<Tag>()

  useEffect(() => {
    setSelectedTag(undefined)
  }, [props.isShow])

  return (
    <UIModal
      header={() => <span>상태변경</span>}
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='flex gap-[8px] flex-wrap | max-w-[320px] | pb-[2px] px-[2px]'>
          {FILTER_STATUS.map((status) => (
            <button
              key={status.value}
              className='rounded-full | bg-white | shadow-md'>
              <span
                className='text-[14px] | px-[12px] | h-[28px] aspect-square | flex items-center justify-center gap-[4px] | rounded-full | whitespace-nowrap'
                style={{
                  background:
                    cookies['x-theme'] === 'dark'
                      ? STATUS_COLORS[status.value]?.dark
                      : `${STATUS_COLORS[status.value].white}24`,
                  color:
                    cookies['x-theme'] === 'dark'
                      ? 'white'
                      : `${STATUS_COLORS[status.value].white}`,
                }}>
                <Icon
                  name={status.icon}
                  className='text-[15px]'
                />
                {status.label}
              </span>
            </button>
          ))}
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => selectedTag && props.select?.(selectedTag)}>
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
