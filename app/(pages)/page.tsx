'use client'

import HomeBadge from '@/app/components/HomeBadge'
import HomeCalendar from '@/app/components/HomeCalendar'
import HomePraise from '@/app/components/HomePraise'
import HomeSequel from '@/app/components/HomeSequel'
import HomeTags from '@/app/components/HomeTags'
import HomeTotal from '@/app/components/HomeTotal'
import HomeRecents from '../components/HomeRecents'
import HomeToday from '../components/HomeToday'

export default function Home() {
  return (
    <div className='flex-1 | flex flex-col'>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] opacity-80'>Welcome to MEMOKU!</h1>
        <p className='text-[16px] opacity-50'>Enjoy Memo and enforce your life!</p>
      </div>
      <div className='flex-1 | flex-wrap flex items-stretch flex-col sm:flex-row gap-[24px]'>
        <div className='flex-2 flex flex-col gap-[24px] | w-full'>
          <HomeToday />
          <div className='w-full | flex flex-wrap gap-[24px]'>
            <div className='flex-1 | flex flex-col gap-[24px]'>
              <HomeBadge />
              <HomePraise />
            </div>
            <HomeTotal />
            <HomeTags />
          </div>
          <div className='flex-1 flex flex-wrap gap-[24px]'>
            <HomeRecents />
          </div>
        </div>
        <div className='flex-1 flex flex-col gap-[24px]'>
          <HomeSequel />
          <HomeCalendar />
        </div>
      </div>
    </div>
  )
}
