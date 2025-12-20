'use client'

export default function HomeTody() {
  return (
    <div className='emboss-sheet'>
      <div className='py-[16px]'>
        <h3 className='rounded-full | font-[700] text-[16px] | px-[16px]'>오늘 할 일</h3>
        <div className='mt-[12px] | flex flex-col gap-[4px]'>
          <p className='px-[16px] sm:text-[14px] | opacity-60'>오늘 할 일을 추가해 보세요.</p>
        </div>
      </div>
    </div>
  )
}
