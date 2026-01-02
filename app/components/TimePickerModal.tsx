'use client'

import { useEffect, useRef, useState } from 'react'
import TimePicker from './TimePicker'
import UIModal from './UIModal'

interface Props {
  isShow: boolean
  initialHour?: number
  initialMinute?: number
  select: (hour: number, minute: number) => void
  close: () => void
}

export default function TimePickerModal({
  isShow,
  initialHour,
  initialMinute,
  select,
  close,
}: Props) {
  const [initialTime, setInitialTime] = useState({ hour: 0, minute: 0 })
  const selectedHour = useRef<number>(0)
  const selectedMinute = useRef<number>(0)

  useEffect(() => {
    if (isShow) {
      const hour = initialHour ?? 0
      const minute = initialMinute ?? 0
      selectedHour.current = hour
      selectedMinute.current = minute
      setInitialTime({ hour, minute })
    }
  }, [isShow, initialHour, initialMinute])

  return (
    <UIModal
      open={isShow}
      header={() => <span>시간 설정</span>}
      content={() => (
        <div className='max-w-[360px]'>
          <TimePicker
            initialHour={initialTime.hour}
            initialMinute={initialTime.minute}
            changeHour={(hour) => {
              selectedHour.current = hour
            }}
            changeMinute={(minute) => {
              selectedMinute.current = minute * 5
            }}
          />
        </div>
      )}
      close={() => close()}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => select(selectedHour.current, selectedMinute.current)}>
          <p className='text-white text-[15px] font-[700]'>선택하기</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
          onClick={() => close()}>
          <p className='text-[15px]'>취소하기</p>
        </button>
      )}
    />
  )
}
