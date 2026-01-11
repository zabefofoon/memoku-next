import { Icon } from '@/app/components/Icon'
import { Link } from '@/app/components/Link'
import { Metadata } from 'next'
import { DarkModeButton } from '../../components/DarkModeButton'

export const metadata: Metadata = {
  title: 'Memoku | 심플한 할 일 관리',
}

export default function Intro() {
  return (
    <div className='h-full flex flex-col'>
      <header className='p-[16px] sm:p-[24px] mx-auto | w-full max-w-[1920px] h-[52px] | flex items-center'>
        <Link
          href='/'
          className='flex items-center gap-[6px]'>
          <Icon
            name='logo'
            className='text-[24px] my-[8px]'
          />
          <span className='text-[18px] font-[700]'>MEMOKU</span>
        </Link>
        <div className='ml-auto | flex items-center gap-[16px] sm:gap-[12px] | text-[14px]'>
          <Link
            className='hidden sm:block'
            href='/app'>
            시작하기
          </Link>
          <Link href='/app/guides'>가이드</Link>
          <DarkModeButton />
        </div>
      </header>
      <main className='flex-1 | mx-auto w-full max-w-[1920px]'>main</main>
      <footer className='h-[300px] | bg-zinc-950 | text-[15px] text-white/95 | p-[16px] sm:p-[40px]'>
        <div className='w-full max-w-[1920px] h-full | flex flex-col | mx-auto'>
          <div className=''>
            <p className='text-[18px] sm:text-[20px]'>MEMOKU</p>
            <p className='mt-[4px] | text-[13px]'>심플한 할 일 관리</p>
          </div>
          <div className='w-full | mt-[24px] flex flex-col sm:flex-row sm:gap-[48px] sm:justify-between'>
            <div>
              <p className='text-[18px] text-[20px]'>Menus</p>
              <div className='flex flex-wrap gap-[12px] mt-[4px] | text-[13px] underline'>
                <Link href='/app'>홈</Link>
                <Link href='/app/todos'>할일</Link>
                <Link href='/app/calendar'>달력</Link>
                <Link href='/app/guides'>가이드</Link>
                <Link href='/app/settings'>설정</Link>
              </div>
            </div>
            <div className='mt-[24px] sm:mt-0'>
              <p className='text-[18px] text-[20px]'>Socials</p>
              <div className='flex gap-[12px] mt-[4px] | text-[13px] underline'>
                <Link
                  href='https://x.com/zabefofoon'
                  target='_blank'>
                  <Icon
                    className='text-[20px]'
                    name='x'
                  />
                </Link>
                <Link
                  href='https://www.threads.com/@sangwwooo'
                  target='_blank'>
                  <Icon
                    className='text-[20px]'
                    name='thread'
                  />
                </Link>
              </div>
            </div>
          </div>
          <p className='mt-auto | text-[14px] text-center'> © 2025 poorkimchiking</p>
        </div>
      </footer>
    </div>
  )
}
