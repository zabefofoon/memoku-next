import { Icon } from './Icon'

export default function HomeBadge() {
  return (
    <div className='min-w-[300px] flex-1 | gap-[8px] flex flex-col items-center justify-center | shadow-md rounded-xl bg-blue-400 dark:bg-blue-500 | p-[16px]'>
      <div className='aspect-square p-[16px] | w-fit | flex flex-col items-center | bg-white/20 border-t border-white dark:border-white/50 rounded-2xl shadow-md'>
        <Icon
          name='badge'
          className='text-[20px] text-white'
        />
      </div>
      <p className='text-[15px] text-white'>당신은 프로 메모커</p>
    </div>
  )
}
