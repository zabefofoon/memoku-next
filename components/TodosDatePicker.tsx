'use client'

import { useDateUtil } from '@/hooks/useDateUtil'
import etcUtil from '@/utils/etc.util'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'

type Props = {
  value?: { start?: number; end?: number }
  onChange?: (range?: { start?: number; end?: number }) => void
  onCancel?: () => void
}

export default function TodosDatePicker(props: Props) {
  const dateUtil = useDateUtil()

  const calendarRef = useRef<FullCalendar>(null)

  const [step, setStep] = useState<'start' | 'end'>('start')
  const [rangeDate, setRangeDate] = useState<{ start?: number; end?: number }>(
    props.value ?? {
      start: undefined,
      end: undefined,
    }
  )

  const setHour = (h: number) => {
    setRangeDate((prev) => {
      const base = prev[step] ?? dayjs().startOf('day').toDate()
      const next = dayjs(base).hour(h).second(0).millisecond(0).toDate()
      return { ...prev, [step]: next }
    })
  }

  const setMinute = (m: number) => {
    setRangeDate((prev) => {
      const base = prev[step] ?? dayjs().startOf('day').toDate()
      const next = dayjs(base).minute(m).second(0).millisecond(0).toDate()
      return { ...prev, [step]: next }
    })
  }

  return (
    <div className='date-picker'>
      <div className='flex items-center'>
        <FullCalendar
          viewClassNames='mb-[6px]'
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView='dayGridMonth'
          selectable={false}
          editable={false}
          navLinks={false}
          eventDisplay='none'
          height='auto'
          headerToolbar={{
            left: 'title',
            right: 'prev,next',
          }}
          dateClick={({ date }) => {
            setRangeDate((prev) => {
              const clicked = dayjs(date).startOf('day')

              const next =
                step === 'start'
                  ? { ...prev, start: clicked.startOf('day').toDate().getTime() }
                  : { ...prev, end: clicked.endOf('day').toDate().getTime() }

              const s = next.start ? dayjs(next.start).startOf('day') : undefined
              const e = next.end ? dayjs(next.end).startOf('day') : undefined

              if (s && e && s.isAfter(e))
                return {
                  ...next,
                  start: e.toDate().getTime(),
                  end: s.endOf('day').toDate().getTime(),
                }

              return next
            })
          }}
          dayCellClassNames={(arg) => {
            const day = dayjs(arg.date).startOf('day')

            const s = rangeDate.start ? dayjs(rangeDate.start).startOf('day') : undefined
            const e = rangeDate.end ? dayjs(rangeDate.end).startOf('day') : undefined

            if (s && !e) return day.isSame(s, 'day') ? '!bg-violet-500 text-white' : ''
            if (!s && e) return day.isSame(e, 'day') ? '!bg-violet-500 text-white' : ''

            if (s && e) {
              const start = s.isBefore(e) ? s : e
              const end = s.isBefore(e) ? e : s
              if (day.isSame(start, 'day') || day.isSame(end, 'day'))
                return '!bg-violet-500 text-white'
              if (day.isAfter(start, 'day') && day.isBefore(end, 'day')) return '!bg-violet-500/50'
            }

            return ''
          }}
        />
        <div className='flex | text-[13px]'>
          <div className='time | overflow-y-scroll | max-h-[230px] | flex flex-col gap-[4px] | border-x border-gray-100 dark:border-zinc-600'>
            {Array.from({ length: 24 }, (_, index) => {
              const cur = rangeDate[step]
              const selected = cur && dayjs(cur).hour() === index
              return (
                <button
                  key={index}
                  className={etcUtil.classNames([
                    'px-[8px]',
                    {
                      'bg-violet-500 text-white': selected,
                    },
                  ])}
                  onClick={() => setHour(index)}>
                  {`${index}`.padStart(2, '0')}
                </button>
              )
            })}
          </div>
          <div className='time | overflow-y-scroll | max-h-[230px] | flex flex-col gap-[4px] | border-r border-gray-100 dark:border-zinc-600'>
            {Array.from({ length: 60 }, (_, index) => {
              const cur = rangeDate[step]
              const selected = cur && dayjs(cur).minute() === index
              return (
                <button
                  key={index}
                  className={etcUtil.classNames([
                    'px-[8px]',
                    {
                      'bg-violet-500 text-white': selected,
                    },
                  ])}
                  onClick={() => setMinute(index)}>
                  {`${index}`.padStart(2, '0')}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <p className='text-center | my-[12px] | text-[13px]'>
        {rangeDate.start && (
          <>
            <button
              type='button'
              className={etcUtil.classNames({
                'bg-slate-200 dark:bg-zinc-500': step === 'start',
              })}
              onClick={() => setStep('start')}>
              {dateUtil.parseDate(rangeDate.start)}
            </button>{' '}
            ~
          </>
        )}
        {rangeDate.end && (
          <button
            className={etcUtil.classNames({
              'bg-slate-200 dark:bg-zinc-500': step === 'end',
            })}
            onClick={() => setStep('end')}>
            {dateUtil.parseDate(rangeDate.end)}
          </button>
        )}
      </p>

      <div className='flex justify-center gap-[12px] | w-full | border-t border-gray-100 dark:border-zinc-600'>
        {step === 'start' ? (
          <button
            type='button'
            className='px-[20px] py-[3px] mt-[12px] | rounded-md | bg-gray-100 dark:bg-zinc-500'
            onClick={props.onCancel}>
            <p className='text-[14px]'>취소</p>
          </button>
        ) : (
          <button
            type='button'
            className='px-[20px] py-[3px] mt-[12px] | rounded-md | bg-gray-100 dark:bg-zinc-500'
            onClick={() => setStep('start')}>
            <p className='text-[14px]'>이전</p>
          </button>
        )}
        {step === 'start' ? (
          <button
            type='button'
            className='px-[20px] py-[3px] mt-[12px] | rounded-md | bg-violet-500 text-white'
            onClick={() =>
              setStep(() => {
                if (!rangeDate.end && rangeDate.start)
                  setRangeDate((rd) => ({
                    ...rd,
                    end: dayjs(rd.start).endOf('day').toDate().getTime(),
                  }))
                return 'end'
              })
            }>
            <p className='text-[14px]'>다음</p>
          </button>
        ) : (
          <button
            type='button'
            className='px-[20px] py-[3px] mt-[12px] | rounded-md | bg-violet-500 text-white'
            onClick={() => props.onChange?.(rangeDate)}>
            <p className='text-[14px]'>완료</p>
          </button>
        )}
      </div>
    </div>
  )
}
