'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'

type Props = {
  value?: { start?: number; end?: number }
  validRange?: { start?: Date; end?: Date }
  select?: (date: Date) => void
}

export default function TodosDatePicker(props: Props) {
  const calendarRef = useRef<FullCalendar>(null)

  const [selectedDate, setSelectedDate] = useState<Date>()

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
          validRange={props.validRange}
          dateClick={({ date }) => {
            setSelectedDate(date)
            props.select?.(date)
          }}
          dayCellClassNames={(arg) => {
            const day = dayjs(arg.date).startOf('day')
            return day.isSame(selectedDate) ? '!bg-violet-500 text-white' : ''
          }}
        />
      </div>
    </div>
  )
}
