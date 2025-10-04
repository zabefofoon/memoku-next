import { Icon } from './Icon'

export default function HomePraise() {
  return (
    <div className='min-w-[300px] flex-1 | gap-[8px] flex flex-col items-center justify-center | shadow-md rounded-xl bg-violet-500 | p-[16px]'>
      <div className='aspect-square p-[16px] | w-fit | flex flex-col items-center | bg-white/20 border-t border-white dark:border-white/50 rounded-2xl shadow-md'>
        <Icon
          name='thumb'
          className='text-[20px] text-white'
        />
      </div>
      <p className='text-[15px] text-white'>지난주 보다 부지런하시군요.</p>
    </div>
  )
}
