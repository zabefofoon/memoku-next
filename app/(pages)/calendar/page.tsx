'use client'

import { CalendarTodos } from '@/app/components/CalendarTodos'
import PageCalendar from '@/app/components/PageCalendar'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Calendar() {
  const searchParams = useSearchParams()

  const router = useRouter()
  return (
    <div className='flex-1 | flex flex-col h-full'>
      <CalendarTodos
        isShow={!!searchParams.get('start')}
        close={router.back}
      />
      <PageCalendar />
    </div>
  )
}
