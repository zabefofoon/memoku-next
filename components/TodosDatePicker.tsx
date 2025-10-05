'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'

type Props = {
  value?: Date
  onChange?: (date?: Date) => void
}

export default function TodosDatePicker(props: Props) {
  const calendarRef = useRef<FullCalendar>(null)

  const [selected, setSelected] = useState<Date | undefined>(props.value)

  return (
    <div className='date-picker'>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        selectable={false}
        editable={false}
        navLinks={false}
        eventDisplay='none'
        height='auto'
        customButtons={{
          select: {
            text: '선택하기',
            click: () => props.onChange?.(selected),
          },
        }}
        headerToolbar={{
          left: 'title',
          right: 'prev,next,select',
        }}
        dateClick={(info) => {
          setSelected(info.date)
        }}
        dayCellClassNames={(arg) =>
          selected && dayjs(arg.date).isSame(selected) ? 'bg-slate-300 dark:bg-zinc-500' : ''
        }
      />
    </div>
  )
}
