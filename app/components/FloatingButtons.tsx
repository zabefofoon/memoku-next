'use client'

import { usePathname } from 'next/navigation'
import { useTransitionRouter } from '../hooks/useTransitionRouter'
import { todosDB } from '../lib/todos.db'
import { Icon } from './Icon'

export default function FloatingButtons() {
  const pathname = usePathname()
  const router = useTransitionRouter()
  if (pathname.match(/\/todos\//gi)) return null

  const createTodo = async (): Promise<void> => {
    const res = await todosDB.postDescription('')
    router.push(`/app/todos/${res.id}`, { scroll: true })
  }

  return (
    <div className='sm:hidden | fixed right-[0] bottom-[92px] z-[50]'>
      <button
        className='w-[48px] aspect-square | flex items-center justify-center | bg-indigo-500 rounded-full | text-white'
        onClick={createTodo}>
        <Icon
          name='plus'
          className='text-[24px]'
        />
      </button>
    </div>
  )
}
