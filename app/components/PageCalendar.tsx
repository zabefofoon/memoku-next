'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { useTodosStore } from '@/app/stores/todos.store'
import { TAG_COLORS } from '@/const'
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
import { useCookies } from 'react-cookie'
import { useThemeStore } from '../stores/theme.store'

export default function PageCalendar() {
  const [cookies] = useCookies()

  const themeStore = useThemeStore()
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
    const mapped = res.map((todo) => {
      const tagColor = tagsStore.getTagsById(todo.tagId)?.color

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
      }
    }) as EventSourceInput
    setEvents(mapped)
  }

  return (
    <div className='page calendar | flex-1 h-full flex | bg-white dark:bg-zinc-800 shadow-md rounded-xl | py-[16px]'>
      <FullCalendar
        key={`${themeStore.isDarkMode}`}
        contentHeight='100%'
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView='dayGridMonth'
        events={events}
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
        moreLinkClick={handleMoreLinkClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
      />
    </div>
  )
}
