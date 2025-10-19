'use client'

import { useState } from 'react'
import TodosDatePicker from './TodosDatePicker'
import UIModal from './UIModal'

interface Props {
  isShow: boolean
  selectedDate?: Date
  validRange?: { start?: Date; end?: Date }
  select: (date: Date) => void
  close: () => void
}

export default function DatePickerModal(props: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(props.selectedDate)

  return (
    <UIModal
      open={props.isShow}
      header={() => <span>날짜 설정</span>}
      content={() => (
        <div className='max-w-[360px]'>
          <TodosDatePicker
            select={setSelectedDate}
            validRange={props.validRange}
          />
        </div>
      )}
      close={() => props.close()}
      ok={() => (
        <button
          className='rounded-md bg-violet-500 py-[12px]'
          onClick={() => selectedDate && props.select(selectedDate)}>
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
