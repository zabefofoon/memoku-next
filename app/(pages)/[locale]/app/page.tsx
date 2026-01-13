import { CalendarTodos } from '@/app/components/CalendarTodos'
import HomeCalendar from '@/app/components/HomeCalendar'
import HomeNews from '@/app/components/HomeNews'
import HomeRecents from '@/app/components/HomeRecents'
import HomeSequel from '@/app/components/HomeSequel'
import HomeTags from '@/app/components/HomeTags'
import HomeTitle from '@/app/components/HomeTitle'
import HomeToday from '@/app/components/HomeToday'
import HomeTotal from '@/app/components/HomeTotal'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: PageProps<'/[locale]/app'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('Menu.Home'),
  }
}

export default async function Home({ searchParams }: PageProps<'/[locale]/app'>) {
  const search = await searchParams

  return (
    <div className='flex-1 | flex flex-col | px-[16px] sm:px-0 mt-[16px] mb-[24px] sm:my-0'>
      <CalendarTodos isShow={!!search['start']} />
      <HomeTitle />
      <div className='flex-1 | flex-wrap flex items-stretch flex-col sm:flex-row gap-[12px]'>
        <div className='flex-2 flex flex-col gap-[12px] | w-full'>
          <HomeToday />
          <div className='w-full | flex flex-wrap gap-[12px]'>
            <HomeNews />
            <HomeTotal />
            <HomeTags />
          </div>
          <div className='flex-1 flex flex-wrap gap-[12px]'>
            <HomeRecents />
          </div>
        </div>
        <div className='flex-1 flex flex-col gap-[12px]'>
          <HomeSequel />
          <HomeCalendar />
        </div>
      </div>
    </div>
  )
}
