import { Icon } from './Icon'

export default function HomeNews() {
  return (
    <div className='order-2 sm:order-0 flex-1 min-w-[260px] shrink-0 | flex flex-col gap-[12px]'>
      <div className='emboss-sheet | w-full h-full'>
        <div className='relative rounded-lg overflow-hidden | w-full h-full'>
          <img
            className='w-full aspect-square object-cover'
            src='https://hopxvfhalrmkomnxznpf.supabase.co/storage/v1/object/public/memoku-bucket/public/RMZofdzDyN.jpg'
            alt=''
          />
          <div className='w-full | absolute bottom-0 text-white bg-black/30 | p-[12px]'>
            <p className='text-[14px]'>홈 화면에 MEMOKU를 추가하세요.</p>
            <p className='text-[12px] opacity-80 | mt-[4px]'>
              브라우저 상단에서 홈화면에 설치하기를 누르면, Pc와 Mobile 모두 앱처럼 사용할 수
              있습니다.
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
  )
}
