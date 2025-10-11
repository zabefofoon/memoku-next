import Link from 'next/link'
import { Icon } from './Icon'

interface Props {
  id: number
}

export default function TodosDeleteButton(props: Props) {
  return (
    <Link
      href={`?deleteModal=${props.id}`}
      className='w-fit | bg-red-100 dark:bg-transparent dark:border border-red-600 | mx-auto px-[8px] py-[4px] rounded-full | flex items-center justify-center | text-red-500 dark:text-red-600 | hover:underline'>
      <Icon
        name='delete'
        className='text-[16px] sm:text-[20px]'
      />
    </Link>
  )
}
