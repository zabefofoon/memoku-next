'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'
import { useLocale } from 'next-intl'
import { useRef, useState } from 'react'

type Props = {
  initialDate?: Date
  value?: { start?: number; end?: number }
  validRange?: { start?: Date; end?: Date }
  select?: (date: Date) => void
}

export default function TodosDatePicker({ initialDate, validRange, select }: Props) {
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const locale = useLocale()
  return (
    <div className='date-picker'>
      <div className='flex items-center'>
        <FullCalendar
          viewClassNames='mb-[6px]'
          ref={calendarRef}
          locale={locale}
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
          validRange={validRange}
          dateClick={({ date }) => {
            setSelectedDate(date)
            select?.(date)
          }}
          dayCellClassNames={(arg) => {
            const day = dayjs(arg.date).startOf('day')
            return day.isSame(selectedDate) ? '!bg-indigo-500 text-white' : ''
          }}
        />
      </div>
    </div>
  )
}
