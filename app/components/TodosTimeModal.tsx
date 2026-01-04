'use client'

import { COOKIE_DEVICE_ID, WEEK_DAYS } from '@/const'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { If, Then } from 'react-if'
import { Todo, WeekDay } from '../models/Todo'
import etcUtil from '../utils/etc.util'
import DatePickerModal from './DatePickerModal'
import { Icon } from './Icon'
import TimePickerModal from './TimePickerModal'
import UIModal from './UIModal'

interface Props {
  isShow: boolean
  todo?: Todo
  updateTime: (
    todo: Todo,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] },
    device_id?: string
  ) => Promise<void>
  close: () => void
}

interface TimeState {
  date?: Date
  hour?: number
  minute?: number
}

export default function TodosTimeModal({ isShow = false, todo, updateTime, close }: Props) {
  const [cookies] = useCookies()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [start, setStart] = useState<TimeState>({
    date: dayjs().set('hour', 0).set('minute', 0).toDate(),
    hour: 0,
    minute: 0,
  })
  const [end, setEnd] = useState<TimeState>({
    date: dayjs().set('hour', 23).set('minute', 55).toDate(),
    hour: 23,
    minute: 55,
  })
  const [days, setDays] = useState<WeekDay[]>([])

  const initStates = useCallback((): void => {
    if (todo == null) return

    const start = dayjs(todo.start)
    const startDate = start.toDate()
    const startHour = todo.start ? start.get('hour').valueOf() : 0
    const startMinute = todo.start ? start.get('minute').valueOf() : 0

    const end = dayjs(todo.end)
    const endtDate = end.toDate()
    const endtHour = todo.end ? end.get('hour').valueOf() : 23
    const endinute = todo.end ? end.get('minute').valueOf() : 55

    setStart({ date: startDate, hour: startHour, minute: startMinute })
    setEnd({ date: endtDate, hour: endtHour, minute: endinute })
    setDays(todo.days ?? [])
  }, [todo])

  const setDate = (value: Date): void => {
    const mode = searchParams.get('date')
    if (mode === 'start') {
      const date = dayjs(value).startOf('day').toDate()
      setStart((prev) => ({ ...prev, date }))
      if (end.date && value > end.date) {
        const date = dayjs(value).endOf('day').toDate()
        setEnd((prev) => ({ ...prev, date }))
      }
    } else {
      const date = dayjs(value).startOf('day').toDate()
      setEnd((prev) => ({ ...prev, date }))
    }
    close()
  }

  const setTime = (hour: number, minute: number): void => {
    const mode = searchParams.get('hour')
    if (mode === 'start') setStart((prev) => ({ ...prev, hour, minute }))
    else setEnd((prev) => ({ ...prev, hour, minute }))
    close()
  }

  const handleSelect = (): void => {
    if (todo == null) return

    updateTime(
      todo,
      {
        start: dayjs(start.date)
          .hour(start.hour ?? 0)
          .minute(start.minute ?? 0)
          .second(0)
          .millisecond(0)
          .valueOf(),
        end: dayjs(end.date)
          .hour(end.hour ?? 0)
          .minute(end.minute ?? 0)
          .second(0)
          .millisecond(0)
          .valueOf(),
        days: days.length ? days : undefined,
      },
      cookies[COOKIE_DEVICE_ID]
    )
    close()
  }

  useEffect(() => {
    if (isShow) initStates()
  }, [initStates, isShow])

  return (
    <>
      <DatePickerModal
        isShow={!!searchParams.get('date')}
        selectedDate={searchParams.get('date') === 'start' ? start.date : end.date}
        close={close}
        validRange={{ start: searchParams.get('date') === 'start' ? undefined : start.date }}
        select={setDate}
      />
      <TimePickerModal
        isShow={!!searchParams.get('hour')}
        initialHour={searchParams.get('hour') === 'start' ? start.hour : end.hour}
        initialMinute={searchParams.get('hour') === 'start' ? start.minute : end.minute}
        close={close}
        select={setTime}
      />
      <UIModal
        open={isShow}
        close={() => close()}
        header={() => <span>시간 설정</span>}
        content={() => (
          <div className='select-none'>
            <div className='mt-[12px] | flex justify-center gap-[4px] | bg-slate-100 dark:bg-zinc-600 rounded-lg | py-[8px]'>
              <p className='flex items-center gap-[4px] | text-[12px] text-center font-[700] tracking-tight'>
                <If condition={!days.length}>
                  <Then>
                    <button
                      type='button'
                      className='underline'
                      onClick={() => {
                        const urlParams = new URLSearchParams(searchParams.toString())
                        router.push(`?${decodeURIComponent(urlParams.toString())}&date=start`, {
                          scroll: false,
                        })
                      }}>
                      {dayjs(start.date).format('YY.MM.DD')}
                    </button>
                  </Then>
                </If>
                <button
                  type='button'
                  className='underline'
                  onClick={() => {
                    const urlParams = new URLSearchParams(searchParams.toString())
                    router.push(`?${decodeURIComponent(urlParams.toString())}&hour=start`, {
                      scroll: false,
                    })
                  }}>
                  {(start?.hour ?? 0) < 11 ? 'AM' : 'PM'}&nbsp;
                  {`${start.hour}`.padStart(2, '0')}:{`${start.minute}`.padStart(2, '0')}
                </button>
              </p>
              <p> ~ </p>
              <p className='flex items-center gap-[4px] | text-[12px] text-center font-[700] tracking-tight'>
                <If condition={!days.length}>
                  <Then>
                    <button
                      type='button'
                      className='underline'
                      onClick={() => {
                        const urlParams = new URLSearchParams(searchParams.toString())
                        router.push(`?${decodeURIComponent(urlParams.toString())}&date=end`, {
                          scroll: false,
                        })
                      }}>
                      {dayjs(end.date).format('YY.MM.DD')}
                    </button>
                  </Then>
                </If>
                <button
                  type='button'
                  className='underline'
                  onClick={() => {
                    const urlParams = new URLSearchParams(searchParams.toString())
                    router.push(`?${decodeURIComponent(urlParams.toString())}&hour=end`, {
                      scroll: false,
                    })
                  }}>
                  {(end?.hour ?? 0) < 11 ? 'AM' : 'PM'}&nbsp;
                  {`${end.hour}`.padStart(2, '0')}:{`${end.minute}`.padStart(2, '0')}
                </button>
              </p>
            </div>

            <div className='flex items-center | mt-[18px] pt-[6px] | border-t border-dashed border-slate-200 dark:border-zinc-600'>
              {WEEK_DAYS.map((item) => (
                <button
                  className='w-full | text-[13px]'
                  key={item.value}
                  type='button'
                  onClick={() => {
                    setDays((prev) => {
                      if (prev.includes(item.value))
                        return prev.filter((child) => child != item.value)
                      else return [...prev, item.value]
                    })
                  }}>
                  <span
                    className={etcUtil.classNames([
                      'w-[30px] aspect-square | mx-auto | rounded-full | flex items-center justify-center',
                      {
                        'bg-indigo-500 text-white': days?.includes(item.value),
                      },
                    ])}>
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        ok={() => (
          <div className='flex gap-[4px]'>
            <button
              className='w-full | rounded-md bg-indigo-500 py-[12px]'
              onClick={handleSelect}>
              <p className='text-white text-[15px] font-[700]'>설정하기</p>
            </button>
            <button
              className='flex items-center justify-center | shrink-0 w-[50px] | border border-zinc-700 rounded-md'
              onClick={() => {
                if (todo)
                  updateTime(
                    todo,
                    { start: undefined, end: undefined, days: undefined },
                    cookies[COOKIE_DEVICE_ID]
                  )
                close()
              }}>
              <Icon name='delete' />
            </button>
          </div>
        )}
        cancel={() => (
          <button
            className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
            onClick={() => close()}>
            <p className='text-[15px]'>취소하기</p>
          </button>
        )}
      />
    </>
  )
}
