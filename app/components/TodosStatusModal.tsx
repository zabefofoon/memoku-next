'use client'

import { FILTER_STATUS, STATUS_MAP } from '@/const'
import { useEffect, useState } from 'react'
import { Todo } from '../models/Todo'
import { useThemeStore } from '../stores/theme.store'
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
  const isDarkMode = useThemeStore((s) => s.isDarkMode)

  useEffect(() => {
    setSelectedStatus(undefined)
  }, [isShow])

  return (
    <UIBottomSheet
      header={() => <span>상태변경</span>}
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <div className='flex gap-[8px] flex-wrap | max-w-[320px] | py-[12px] px-[2px]'>
          {FILTER_STATUS.map((status) => (
            <button
              key={status.value}
              type='button'
              className={etcUtil.classNames([
                'neu-button',
                { active: status.value === selectedStatus },
              ])}
              style={{
                color: isDarkMode
                  ? STATUS_MAP[status.value]?.darkColor
                  : STATUS_MAP[status.value]?.color,
              }}
              onClick={() => setSelectedStatus(status.value)}>
              <Icon name={status.icon} />
              <p>{status.label}</p>
            </button>
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
