import { CalendarTodos } from '@/app/components/CalendarTodos'
import PageCalendar from '@/app/components/PageCalendar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '달력',
}

export default async function Calendar({ searchParams }: PageProps<'/app/calendar'>) {
  const search = await searchParams

  return (
    <div className='flex-1 | flex flex-col h-full'>
      <CalendarTodos isShow={!!search['start']} />
      <PageCalendar />
    </div>
  )
}
