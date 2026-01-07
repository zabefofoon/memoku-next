import HomeCalendar from '@/app/components/HomeCalendar'
import HomeSequel from '@/app/components/HomeSequel'
import HomeTags from '@/app/components/HomeTags'
import HomeTotal from '@/app/components/HomeTotal'
import { CalendarTodos } from '../components/CalendarTodos'
import HomeNews from '../components/HomeNews'
import HomeRecents from '../components/HomeRecents'
import HomeTitle from '../components/HomeTitle'
import HomeToday from '../components/HomeToday'

export default async function Home({ searchParams }: PageProps<'/'>) {
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
