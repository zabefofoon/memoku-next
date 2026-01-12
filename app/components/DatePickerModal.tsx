'use client'

import { useTranslations } from 'next-intl'
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

export default function DatePickerModal({
  isShow,
  selectedDate,
  validRange,
  select,
  close,
}: Props) {
  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const t = useTranslations()
  return (
    <UIModal
      open={isShow}
      header={() => <span>{t('Todo.DatePickerTitle')}</span>}
      content={() => (
        <div className='max-w-[360px]'>
          <TodosDatePicker
            initialDate={selectedDate}
            select={setDate}
            validRange={validRange}
          />
        </div>
      )}
      close={() => close()}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => date && select(date)}>
          <p className='text-white text-[15px] font-[700]'>{t('Todo.PeriodModalDone')}</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
          onClick={() => close()}>
          <p className='text-[15px]'>{t('Todo.PeriodModalCancel')}</p>
        </button>
      )}
    />
  )
}
