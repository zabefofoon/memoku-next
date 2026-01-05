'use client'

import { CalendarTodos } from '@/app/components/CalendarTodos'
import PageCalendar from '@/app/components/PageCalendar'
import { useSearchParams } from 'next/navigation'

export default function Calendar() {
  const searchParams = useSearchParams()

  return (
    <div className='flex-1 | flex flex-col h-full'>
      <CalendarTodos isShow={!!searchParams.get('start')} />
      <PageCalendar />
    </div>
  )
}
