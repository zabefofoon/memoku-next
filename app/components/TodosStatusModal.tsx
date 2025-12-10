'use client'

import { FILTER_STATUS } from '@/const'
import { useEffect, useState } from 'react'
import { Todo } from '../models/Todo'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  select?: (status: Todo['status']) => void
  close: () => void
}

export function TodosStatusModal({ isShow, select, close }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<Todo['status']>()

  const statusMap = {
    done: {
      color: 'var(--color-green-500)',
    },
    inprogress: {
      color: 'var(--color-indigo-500)',
    },
    hold: {
      color: 'var(--color-orange-600)',
    },
    created: {
      color: 'var(--color-slate-600)',
    },
  }

  useEffect(() => {
    setSelectedStatus(undefined)
  }, [isShow])

  return (
    <UIBottomSheet
      header={() => <span>상태변경</span>}
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <div className='flex gap-[8px] flex-wrap | max-w-[320px] | pb-[2px] px-[2px]'>
          {FILTER_STATUS.map((status) => (
            <div
              key={status.value}
              className='neu-button | relative | rounded-full '>
              <button
                type='button'
                className='button'
                style={{
                  color: statusMap[status.value].color,
                }}
                onClick={() => setSelectedStatus(status.value)}>
                <div
                  className={etcUtil.classNames([
                    'button-inner | flex items-center gap-[4px]',
                    { 'bg-indigo-600/10': status.value === selectedStatus },
                  ])}>
                  <Icon name={status.icon} />
                  <p className='text-[13px] leading-[100%]'>{status.label}</p>
                </div>
              </button>
              {selectedStatus === status.value && (
                <div className='flex items-center justify-center  | absolute top-0 left-0 z-[1] | w-full h-full rounded-full'>
                  <Icon
                    name='check'
                    className='text-white text-[24px]'
                    style={{
                      filter: 'drop-shadow(1px 1px 1px var(--color-gray-400))',
                    }}
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
          onClick={() => selectedStatus && select?.(selectedStatus)}>
          <p className='text-white text-[15px] font-[700]'>선택하기</p>
        </button>
      )}
    />
  )
}
