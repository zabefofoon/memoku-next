import { CalendarTodos } from '@/app/components/CalendarTodos'
import PageCalendar from '@/app/components/PageCalendar'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/app/guides'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('Menu.Calendar'),
  }
}

export default async function Calendar({ searchParams }: PageProps<'/[locale]/app/calendar'>) {
  const search = await searchParams

  return (
    <div className='flex-1 | flex flex-col h-full'>
      <CalendarTodos isShow={!!search['start']} />
      <PageCalendar />
    </div>
  )
}
