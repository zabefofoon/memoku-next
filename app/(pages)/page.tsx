'use client'

import HomeCalendar from '@/app/components/HomeCalendar'
import HomeSequel from '@/app/components/HomeSequel'
import HomeTags from '@/app/components/HomeTags'
import HomeTotal from '@/app/components/HomeTotal'
import HomeRecents from '../components/HomeRecents'
import HomeToday from '../components/HomeToday'
import { Icon } from '../components/Icon'
import { useAuthStore } from '../stores/auth.store'

export default function Home() {
  const memberInfo = useAuthStore((s) => s.memberInfo)

  return (
    <div className='flex-1 | flex flex-col | px-[16px] sm:px-0'>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] capitalize | opacity-80'>
          {memberInfo?.email ? `Hello! ${memberInfo.email.split('@')[0]}` : 'Welcome to MEMOKU!'}
        </h1>
        <p className='text-[16px] opacity-50'>Enjoy Memo and enforce your life!</p>
      </div>
      <div className='flex-1 | flex-wrap flex items-stretch flex-col sm:flex-row gap-[12px]'>
        <div className='flex-2 flex flex-col gap-[12px] | w-full'>
          <HomeToday />
          <div className='w-full | flex flex-wrap gap-[12px]'>
            <div className='flex-1 min-w-[300px] shrink-0 | flex flex-col gap-[12px]'>
              <div className='emboss-sheet'>
                <div className='relative rounded-lg overflow-hidden'>
                  <img
                    className=''
                    src='https://hopxvfhalrmkomnxznpf.supabase.co/storage/v1/object/public/memoku-bucket/public/RMZofdzDyN.jpg'
                    alt=''
                  />
                  <div className='w-full | absolute bottom-0 text-white bg-black/30 | p-[12px]'>
                    <p className='text-[14px]'>홈 화면에 MEMOKU를 추가하세요.</p>
                    <p className='text-[12px] opacity-80 | mt-[4px]'>
                      브라우저 상단에서 홈화면에 설치하기를 누르면, iOS/Android 모두 앱처럼 사용할
                      수 있습니다.
                    </p>
                    <p className='text-[12px] opacity-80 | mt-[4px] | flex items-center'>
                      <span className='underline'>더 보기</span>
                      <Icon
                        name='chevron-right'
                        className='text-[16px]'
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
