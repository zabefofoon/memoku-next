'use client'

import HomeCalendar from '@/app/components/HomeCalendar'
import HomeSequel from '@/app/components/HomeSequel'
import HomeTags from '@/app/components/HomeTags'
import HomeTotal from '@/app/components/HomeTotal'
import { useSearchParams } from 'next/navigation'
import { CalendarTodos } from '../components/CalendarTodos'
import { DarkModeButton } from '../components/DarkModeButton'
import HomeNews from '../components/HomeNews'
import HomeRecents from '../components/HomeRecents'
import HomeToday from '../components/HomeToday'
import { useAuthStore } from '../stores/auth.store'

export default function Home() {
  const memberInfo = useAuthStore((s) => s.memberInfo)

  const searchParams = useSearchParams()

  return (
    <div className='flex-1 | flex flex-col | px-[16px] sm:px-0 mt-[16px] mb-[24px] sm:my-0'>
      <CalendarTodos isShow={!!searchParams.get('start')} />
      <div className='flex items-start justify-between | mb-[24px]'>
        <div>
          <h1 className='text-[20px] capitalize | opacity-80'>
            {memberInfo?.email ? `Hello! ${memberInfo.email.split('@')[0]}` : 'Welcome to MEMOKU!'}
          </h1>
          <p className='text-[16px] opacity-50'>Enjoy Memo and enforce your life!</p>
        </div>
        <div>
          <DarkModeButton />
        </div>
      </div>
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
