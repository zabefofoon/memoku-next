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
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import debounce from 'lodash.debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { PointerEvent, TouchEvent, useEffect, useRef, useState } from 'react'
import { useThemeStore } from '../stores/theme.store'

export default function PageCalendar() {
  const searchParams = useSearchParams()

  const screenSize = useThemeStore((state) => state.screenSize)
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const getTagsById = useTagsStore((state) => state.getTagsById)
  const router = useRouter()

  const calendarRef = useRef<FullCalendar>(null)

  const [events, setEvents] = useState<EventSourceInput>([])
  const touchedX = useRef<number>(0)

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
    arg.jsEvent.preventDefault()

    const dayCell = arg.el.closest('.fc-daygrid-day') as HTMLElement
    const hasMore = !!dayCell?.querySelector('.fc-daygrid-more-link')
    if (hasMore) {
      const start = dayjs(arg.event.start).startOf('day').valueOf()
      const end = dayjs(arg.event.start).endOf('day').valueOf()
      const urlParams = new URLSearchParams(location.search)
      urlParams.append('start', `${start}`)
      urlParams.append('end', `${end}`)
      router.push(`?${decodeURIComponent(urlParams.toString())}`, {
        scroll: false,
      })
    } else {
      router.push(`/todos/${arg.event.id}`)
    }
  }

  const handleDatesSet = debounce(async (arg: DatesSetArg) => {
    const res = await todosDB.getTodosDateRange(arg.start, arg.end)
    const mapped = res.map((todo) => {
      const tagColor = getTagsById(todo.tagId)?.color

      return {
        id: todo.id,
        title: todo.description?.slice(0, 20),
        date: dayjs(todo.created).format('YYYY-MM-DD'),
        backgroundColor: tagColor
          ? (TAG_COLORS[tagColor]?.white ?? 'var(--color-slate-800)')
          : 'var(--color-slate-800)',
        start: todo.start ? dayjs(todo.start).toDate() : undefined,
        end: todo.end ? dayjs(todo.end).toDate() : undefined,
        daysOfWeek: todo.days?.map((day) => CALENDAR_REPEAT[day]),
      }
    }) as EventSourceInput
    setEvents(mapped)
    const searchParams = new URLSearchParams(location.search)
    searchParams.set('period-start', `${arg.view.currentStart.getTime()}`)
    searchParams.set('period-end', `${arg.view.currentEnd.getTime()}`)
    router.replace(`?${searchParams.toString()}`, { scroll: false })
  }, 50)

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>): void => {
    touchedX.current = event.changedTouches[0].clientX
  }

  const handleMouseStart = (event: PointerEvent<HTMLDivElement>): void => {
    if ('ontouchstart' in window) return
    touchedX.current = event.clientX
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>): void => {
    if (searchParams.get('start')) return
    const delta = event.changedTouches[0].clientX - touchedX.current

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const periodStart = searchParams.get('period-start')
    if (periodStart) calendarRef.current?.getApi().gotoDate(dayjs(+periodStart).toDate())
  }, [])

  return (
    <div className='page calendar | flex-1 h-full flex flex-col sm:flex-row gap-[12px] | p-[16px] mb-[80px] sm:mb-0 sm:p-0'>
      <div
        className='select-none | flex | w-full h-full'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleMouseStart}
        onPointerUp={handleMouseEnd}>
        <FullCalendar
          eventClassNames='cursor-pointer'
          key={`${isDarkMode}`}
          contentHeight='100%'
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView='dayGridMonth'
          events={events}
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'myToday,prev,next',
          }}
          eventClick={handleEventClick}
          moreLinkClick={handleMoreLinkClick}
          datesSet={handleDatesSet}
          dayMaxEvents={screenSize === 'desktop' ? 3 : 1}
        />
      </div>
    </div>
  )
}
