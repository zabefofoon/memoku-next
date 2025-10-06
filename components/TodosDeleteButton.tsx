import { Icon } from './Icon'

export default function TodosDeleteButton() {
  return (
    <button className='w-fit | bg-red-100 dark:bg-transparent dark:border border-red-600 | mx-auto px-[8px] py-[4px] rounded-full | flex items-center justify-center | text-red-500 dark:text-red-600 | hover:underline'>
      <Icon
        name='delete'
        className='text-[20px]'
      />
      <span className='font-[700] text-[12px]'>DELETE</span>
    </button>
  )
}
