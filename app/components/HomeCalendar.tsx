'use client'

import { todosDB } from '@/app/lib/todos.db'
import { useTagsStore } from '@/app/stores/tags.store'
import { CALENDAR_REPEAT, TAG_COLORS } from '@/const'
import {
  DatesSetArg,
  EventClickArg,
  EventSourceInput,
  MoreLinkAction,
} from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'

import type FullCalendarComponent from '@fullcalendar/react'
import dynamic from 'next/dynamic'

const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

export default function HomeCalendar() {
  const [cookies] = useCookies()

  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const router = useRouter()

  const calendarRef = useRef<FullCalendarComponent>(null)

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
    const res = await todosDB.getTodosDateRange(arg.start, arg.end)
    const mapped = res.map((todo) => {
      const tagColor = getTagsById(todo.tagId)?.color

      return {
        id: todo.id,
        title: todo.description?.slice(0, 20),
        date: dayjs(todo.created).format('YYYY-MM-DD'),
        backgroundColor:
          cookies['x-theme'] === 'dark'
            ? tagColor
              ? (TAG_COLORS[tagColor]?.dark ?? '#000000')
              : '#000000'
            : tagColor
              ? (TAG_COLORS[tagColor]?.white ?? '#000000')
              : '#000000',
        start: todo.start ? dayjs(todo.start).toDate() : undefined,
        end: todo.end ? dayjs(todo.end).toDate() : undefined,
        daysOfWeek: todo.days?.map((day) => CALENDAR_REPEAT[day]),
      }
    }) as EventSourceInput

    setEvents(mapped)
  }

  return (
    <div className='calendar | hidden sm:block | flex-1 min-w-[500px] min-h-[420px] h-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | py-[16px]'>
      <FullCalendar
        key={`${isDarkMode}`}
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
