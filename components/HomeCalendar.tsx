'use client'

import { useTagsStore } from '@/stores/tags.store'
import { useTodosStore } from '@/stores/todos.store'
import {
  DatesSetArg,
  EventClickArg,
  EventSourceInput,
  MoreLinkAction,
} from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function HomeCalendar() {
  const todoStore = useTodosStore()
  const tagsStore = useTagsStore()
  const router = useRouter()

  const calendarRef = useRef<FullCalendar>(null)

  const [events, setEvents] = useState<EventSourceInput>([])

  const handleMoreLinkClick: MoreLinkAction = (arg) => {
    arg.jsEvent.preventDefault()
    const start = dayjs(arg.date).startOf('month').format('YYYY-MM-DD')
    router.push(`/calendar?start=${start}`)
  }

  const handleEventClick = (arg: EventClickArg) => {
    router.push(`/todos/${arg.event.id}`)
  }

  const handleDatesSet = async (arg: DatesSetArg) => {
    const res = await todoStore.getTodosDateRange(arg.start, arg.end)
    const mapped = res.map((todo) => ({
      id: todo.id,
      title: todo.description?.slice(0, 20),
      date: dayjs(todo.created).format('YYYY-MM-DD'),
      backgroundColor: tagsStore.getTagsById(todo.tagId)?.color ?? '#000000',
    }))
    setEvents(mapped)
  }

  return (
    <div className='calendar | hidden sm:block | flex-1 min-w-[500px] min-h-[420px] h-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | py-[16px]'>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView='dayGridMonth'
        height='100%'
        customButtons={{
          myToday: {
            text: 'Today',
            click: () => calendarRef.current?.getApi().today(),
          },
          myMonth: {
            text: 'Month',
            click: () => calendarRef.current?.getApi().changeView('dayGridMonth'),
          },
          myWeek: {
            text: 'Week',
            click: () => calendarRef.current?.getApi().changeView('timeGridWeek'),
          },
          myDay: {
            text: 'Day',
            click: () => calendarRef.current?.getApi().changeView('timeGridDay'),
          },
        }}
        headerToolbar={{
          left: 'prev,next myToday',
          center: 'title',
          right: 'myMonth,myWeek,myDay',
        }}
        dayMaxEvents={1}
        events={events}
        moreLinkClick={handleMoreLinkClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
      />
    </div>
  )
}
