'use client'

import { WEEK_DAYS, WEEK_DAYS_NAME } from '@/const'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { useDateUtil } from '../hooks/useDateUtil'
import { Todo, WeekDay } from '../models/Todo'
import etcUtil from '../utils/etc.util'
import DatePickerModal from './DatePickerModal'
import { Icon } from './Icon'
import TimePicker from './TimePicker'
import UIModal from './UIModal'

interface Props {
  isShow: boolean
  todos: Todo[]
  updateTime: (
    id: string,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ) => Promise<void>
  close: () => void
}

interface TimeState {
  date?: Date
  hour?: number
  minute?: number
}

interface StepCard {
  title: string
  desc: string
  caption: string
  value: 'plan' | 'iterate' | 'reset'
}

export default function TodosTimeModal(props: Props): ReactNode {
  const searchParams = useSearchParams()

  const [isShowDateModal, setIsShowDateModal] = useState<boolean>(false)

  const [step, setStep] = useState<'select' | 'plan' | 'iterate'>('select')
  const [selectedMode, setSelectedMode] = useState<'plan' | 'iterate' | 'reset'>('plan')

  const [mode, setMode] = useState<'start' | 'end'>('start')

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

  const initStates = (): void => {
    const todo = getCurrentTodo()
    if (todo == null) return

    let step: 'select' | 'plan' | 'iterate' = 'select'
    if (todo.start && todo.days) step = 'iterate'
    else if (todo.start) step = 'plan'

    const startDate = dayjs(todo.start).toDate()
    const startHour = todo.start ? dayjs(todo.start).get('hour').valueOf() : 0
    const startMinute = todo.start ? dayjs(todo.start).get('minute').valueOf() : 0

    const endtDate = dayjs(todo.end).toDate()
    const endtHour = todo.end ? dayjs(todo.end).get('hour').valueOf() : 23
    const endinute = todo.end ? dayjs(todo.end).get('minute').valueOf() : 55

    setStep(step)
    setMode('start')
    setSelectedMode(todo.days ? 'iterate' : 'plan')
    setStart({ date: startDate, hour: startHour, minute: startMinute })
    setEnd({ date: endtDate, hour: endtHour, minute: endinute })
    setDays(todo.days ?? [])
  }

  const getCurrentTodo = (): Todo | undefined => {
    const todoId = searchParams.get('time')

    return props.todos.find((todo) => todo.id === todoId)
  }

  const setDate = (value: Date): void => {
    if (mode === 'start') {
      const date = dayjs(value).startOf('day').toDate()
      setStart((prev) => ({ ...prev, date }))

      if (end.date && value > end.date) setEnd((prev) => ({ ...prev, date: undefined }))
    } else {
      const date = dayjs(value).endOf('day').toDate()
      setEnd((prev) => ({ ...prev, date }))
    }

    props.close()
  }

  const toggleWeekDays = (value: WeekDay) => {
    setDays((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item != value)
      else return [...prev, value]
    })
  }

  const handleSelect = (): void => {
    if (selectedMode === 'reset') {
      const todoId = searchParams.get('time')

      if (!todoId) return

      props.updateTime(todoId, { start: undefined, end: undefined, days: undefined })
      props.close()
    } else if (step === 'select') setStep(selectedMode)
    else {
      const startValue = dayjs(start.date)
        .hour(start.hour ?? 0)
        .minute(start.minute ?? 0)
        .second(0)
        .millisecond(0)
        .valueOf()
      const endValue = dayjs(end.date)
        .hour(end.hour ?? 0)
        .minute(end.minute ?? 0)
        .second(0)
        .millisecond(0)
        .valueOf()
      const daysValue = selectedMode === 'iterate' && days.length ? days : undefined

      const todoId = searchParams.get('time')

      if (!todoId) return

      props.updateTime(todoId, { start: startValue, end: endValue, days: daysValue })
      props.close()
    }
  }

  useEffect(() => {
    setIsShowDateModal(!!searchParams.get('date'))
  }, [searchParams])

  useEffect(() => {
    if (props.isShow) initStates()
  }, [props.isShow])

  return (
    <>
      <UIModal
        open={props.isShow ?? false}
        close={() => props.close()}
        header={() => <span>시간 설정</span>}
        content={() => (
          <div className='select-none'>
            {/* Breadcrumb */}
            <div className='flex items-center gap-[6px] | text-[13px] | mb-[24px]'>
              <button
                className={etcUtil.classNames(['opacity-100', { 'opacity-50': step !== 'select' }])}
                onClick={() => setStep('select')}>
                1. 모드선택
              </button>
              {step !== 'select' && (
                <div className='w-[16px] border-t-[3px] border-dotted border-slate-200 dark:border-zinc-600'></div>
              )}
              {step === 'plan' && <p>2. 기간설정</p>}
              {step === 'iterate' && <p>2. 반복설정</p>}
            </div>
            {/* Breadcrumb */}

            {step === 'select' ? (
              <SelectContent
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
              />
            ) : (
              <>
                <Tabs
                  mode={mode}
                  setMode={setMode}
                />
                <TimePicker
                  key={`time-picker-${mode}`}
                  initialHour={mode === 'start' ? start.hour : end.hour}
                  initialMinute={mode === 'start' ? start.minute : end.minute}
                  changeHour={(index) => {
                    if (mode === 'start') setStart((prev) => ({ ...prev, hour: index }))
                    else setEnd((prev) => ({ ...prev, hour: index }))
                  }}
                  changeMinute={(index) => {
                    if (mode === 'start') setStart((prev) => ({ ...prev, minute: index * 5 }))
                    else setEnd((prev) => ({ ...prev, minute: index * 5 }))
                  }}
                />

                <div className='flex flex-col gap-[8px] | text-[13px] | mb-[24px] pb-[24px] | border-b border-slate-200 dark:border-zinc-600'>
                  {step === 'plan' ? (
                    <PlanContent date={mode === 'start' ? start.date : end.date} />
                  ) : (
                    <IterateContent
                      mode={mode}
                      start={start}
                      end={end}
                      days={days}
                      toggleWeekDays={toggleWeekDays}
                    />
                  )}
                </div>
                {selectedMode !== 'reset' && (
                  <ResultTexts
                    selectedMode={selectedMode}
                    start={start}
                    end={end}
                    days={days}
                  />
                )}
              </>
            )}
          </div>
        )}
        ok={() => (
          <button
            className='rounded-md bg-indigo-500 py-[12px]'
            onClick={handleSelect}>
            <p className='text-white text-[15px] font-[700]'>선택하기</p>
          </button>
        )}
        cancel={() => (
          <button
            className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
            onClick={() => {
              if (step === 'select') props.close()
              else setStep('select')
            }}>
            <p className='text-[15px]'>취소하기</p>
          </button>
        )}
      />
      <DatePickerModal
        key={`date-${mode}`}
        isShow={isShowDateModal}
        selectedDate={mode === 'start' ? start.date : end.date}
        close={props.close}
        validRange={{ start: mode === 'start' ? undefined : start.date }}
        select={setDate}
      />
    </>
  )
}

function Tabs(props: {
  mode?: 'start' | 'end'
  setMode: (value: 'start' | 'end') => void
}): ReactNode {
  const tabs: { name: string; value: 'start' | 'end' }[] = [
    { name: '시작시간', value: 'start' },
    { name: '종료시간', value: 'end' },
  ]

  return (
    <div className='w-fit | flex gap-[4px] | text-[14px] | mx-auto mb-[12px] p-[4px] | rounded-lg bg-slate-100 dark:bg-zinc-700'>
      {tabs.map((item) => (
        <button
          key={item.value}
          type='button'
          className={etcUtil.classNames('font-[700] | py-[3px] px-[12px] | rounded-lg', {
            'bg-indigo-500 shadow-lg | text-white': props.mode === item.value,
          })}
          onClick={() => props.setMode(item.value)}>
          {item.name}
        </button>
      ))}
    </div>
  )
}

function SelectContent(props: {
  selectedMode: 'plan' | 'iterate' | 'reset'
  setSelectedMode: (value: 'plan' | 'iterate' | 'reset') => void
}): ReactNode {
  const stepCards: StepCard[] = [
    {
      title: '기간 설정',
      desc: '시작과 종료의 날짜 및 시간을 정합니다.',
      caption: 'N일 N시 N분 ~ N일 N시 N분',
      value: 'plan',
    },
    {
      title: '반복 설정',
      desc: '매 주 선택한 요일의 시간을 정합니다.',
      caption: '매주 N요일, N요일 N시 N분 ~ N시 N분',
      value: 'iterate',
    },
    {
      title: '초기화',
      desc: '설정을 초기화 합니다.',
      caption: '주의! 초기화된 설정은 복구할 수 없습니다.',
      value: 'reset',
    },
  ]

  return (
    <>
      <div className='flex flex-col | gap-[12px]'>
        {stepCards.map((card) => (
          <button
            key={card.value}
            className={etcUtil.classNames([
              'leading-[140%] | border border-slate-200 dark:border-zinc-600 rounded-lg | py-[8px]',
              { 'bg-slate-100 dark:bg-zinc-700': props.selectedMode === card.value },
            ])}
            onClick={() => props.setSelectedMode(card.value)}>
            <p className='text-[16px] font-[700]'>{card.title}</p>
            <p className='text-[13px]'>{card.desc}</p>
            <p className='text-[12px] opacity-50'>{card.caption}</p>
          </button>
        ))}
      </div>
    </>
  )
}

function PlanContent(props: { date?: Date }): ReactNode {
  const dateUtil = useDateUtil()
  return (
    <div className='flex items-center justify-between'>
      <p>날짜</p>
      <div className='flex items-center gap-[8px]'>
        {props.date && <p>{dateUtil.parseOnlyDate(props.date?.getTime())}</p>}
        <Link
          href='?time=true&date=true'
          type='button'>
          <Icon
            name='calendar'
            className='text-[20px]'
          />
        </Link>
      </div>
    </div>
  )
}

function IterateContent(props: {
  mode: 'start' | 'end'
  start: TimeState
  end: TimeState
  days: WeekDay[]
  toggleWeekDays: (value: WeekDay) => void
}): ReactNode {
  return (
    <div className='flex items-center'>
      {WEEK_DAYS.map((item) => (
        <button
          className='w-full | text-[15px]'
          key={item.value}
          type='button'
          onClick={() => props.toggleWeekDays(item.value)}>
          <span
            className={etcUtil.classNames([
              'w-[30px] aspect-square | mx-auto | rounded-full | flex items-center justify-center',
              {
                'bg-indigo-500 text-white':
                  props.mode === 'start'
                    ? props.days?.includes(item.value)
                    : props.days?.includes(item.value),
              },
            ])}>
            {item.name}
          </span>
        </button>
      ))}
    </div>
  )
}

function ResultTexts(props: {
  selectedMode: 'plan' | 'iterate'
  start: TimeState
  end: TimeState
  days: WeekDay[]
}): ReactNode {
  const dateUtil = useDateUtil()

  const startHour = `${props.start.hour}`.padStart(2, '0')
  const startMinute = `${props.start.minute}`.padStart(2, '0')
  const endHour = `${props.end.hour}`.padStart(2, '0')
  const endMinute = `${props.end.minute}`.padStart(2, '0')

  const days =
    props.days.length === 7 ? '매일' : props.days.map((day) => WEEK_DAYS_NAME[day]).join(',')

  const startDate = dateUtil.parseDate(
    dayjs(props.start.date)
      .hour(props.start.hour ?? 0)
      .minute(props.start.minute ?? 0)
      .second(0)
      .millisecond(0)
      .valueOf()
  )
  const endDate = dateUtil.parseDate(
    dayjs(props.end.date)
      .hour(props.end.hour ?? 0)
      .minute(props.end.minute ?? 0)
      .second(0)
      .millisecond(0)
      .valueOf()
  )

  return (
    <div className='bg-slate-100 dark:bg-zinc-600 rounded-lg | py-[8px]'>
      {props.selectedMode === 'plan' ? (
        <p className='text-[12px] text-center font-[700]'>
          {props.end.date ? `${startDate} ~ ${endDate}` : '종료일을 선택하세요.'}
        </p>
      ) : (
        <p className='text-[12px] text-center font-[700]'>
          {props.days.length ? (
            <span>
              {props.days.length < 7 && '매주'} {days} / {startHour}:{startMinute}~{endHour}:
              {endMinute}
            </span>
          ) : (
            '요일을 선택하세요.'
          )}
        </p>
      )}
    </div>
  )
}
