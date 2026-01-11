'use client'

import { todosDB } from '@/app/lib/todos.db'
import { useTagsStore } from '@/app/stores/tags.store'
import { CALENDAR_REPEAT, TAG_COLORS } from '@/const'
import {
  DatesSetArg,
  EventApi,
  EventClickArg,
  EventSourceInput,
  MoreLinkAction,
} from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { PointerEvent, TouchEvent, useRef, useState } from 'react'
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
  const searchParams = useSearchParams()

  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const router = useRouter()

  const calendarRef = useRef<FullCalendarComponent>(null)
  const touchedX = useRef<number>(0)

  const [events, setEvents] = useState<EventSourceInput>([])

  const handleMoreLinkClick: MoreLinkAction = (arg) => {
    arg.jsEvent.preventDefault()
    const start = dayjs(arg.date).startOf('day').valueOf()
    const end = dayjs(arg.date).endOf('day').valueOf()

    const urlParams = new URLSearchParams(location.search)
    urlParams.append('start', `${start}`)
    urlParams.append('end', `${end}`)
    router.push(`?${decodeURIComponent(urlParams.toString())}`, {
      scroll: false,
    })
  }
  const handleEventClick = (arg: EventClickArg) => {
    router.push(`/app/todos/${arg.event.id}`)
  }

  const handleDatesSet = async (arg: DatesSetArg) => {
    const res = await todosDB.getTodosDateRange(arg.start, arg.end)
    const mapped = res.map((todo) => {
      const tagColor = getTagsById(todo.tagId)?.color

      return {
        id: todo.id,
        title: todo.description?.slice(0, 40)?.split(/\n/)[0],
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

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>): void => {
    touchedX.current = event.changedTouches[0].clientX
  }

  const handleMouseStart = (event: PointerEvent<HTMLDivElement>): void => {
    if ('ontouchstart' in window) return
    touchedX.current = event.clientX
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>): void => {
    const delta = event.changedTouches[0].clientX - touchedX.current
    if (searchParams.get('start')) return

    const calendarApi = calendarRef.current?.getApi()
    if (delta > 20) calendarApi?.prev()
    else if (delta < -20) calendarApi?.next()

    touchedX.current = 0
  }

  const handleMouseEnd = (event: PointerEvent<HTMLDivElement>): void => {
    if ('ontouchstart' in window) return
    if (searchParams.get('start')) return

    const delta = event.clientX - touchedX.current

    const calendarApi = calendarRef.current?.getApi()
    if (delta > 20) calendarApi?.prev()
    else if (delta < -20) calendarApi?.next()

    touchedX.current = 0
  }

  return (
    <div className='emboss-sheet calendar | hidden sm:block | flex-1 min-w-[360px] min-h-[360px] h-full | p-[8px]'>
      <div
        className='w-full h-full p-[6px]'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleMouseStart}
        onPointerUp={handleMouseEnd}>
        <FullCalendar
          key={`${isDarkMode}`}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView='dayGridMonth'
          height='100%'
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'myToday,prev,next',
          }}
          dayMaxEvents={1}
          events={events}
          eventOrder={(a: unknown, b: unknown) => {
            const ea = a as unknown as EventApi
            const eb = b as unknown as EventApi

            const aHasDays =
              Array.isArray(ea.extendedProps?.days) && ea.extendedProps.days.length > 0 ? 1 : 0
            const bHasDays =
              Array.isArray(eb.extendedProps?.days) && eb.extendedProps.days.length > 0 ? 1 : 0

            if (aHasDays !== bHasDays) return aHasDays - bHasDays
            return 0
          }}
          moreLinkClick={handleMoreLinkClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
        />
      </div>
    </div>
  )
}
