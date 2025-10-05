'use client'

import { useDateUtil } from '@/hooks/useDateUtil'
import { Todo } from '@/models/Todo'
import { useTagsStore } from '@/stores/tags.store'
import { useTodosStore } from '@/stores/todos.store'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

export default function HomeTody() {
  const todoStore = useTodosStore()
  const tagsStore = useTagsStore()

  const dateUtil = useDateUtil()
  const [cookies] = useCookies()

  const [todayTodos, setTodayTodos] = useState<Todo[]>([])

  const loadTodayTodos = async (): Promise<void> => {
    const todos = await todoStore.getTodayTodos()
    setTodayTodos(todos)
  }

  useEffect(() => {
    loadTodayTodos()
  }, [])

  const todos = todayTodos.map((todo) => (
    <Link
      key={todo.id}
      href={`/todos/${todo.id}`}
      className='flex items-center | border-t border-slate-100 dark:border-zinc-600 last:border-b | py-[4px] px-[8px]'>
      <div className='p-[4px] dark:bg-zinc-700 shadow-sm shadow-gray-400 dark:shadow-gray-800 rounded-full'>
        <span
          className='w-[32px] | flex items-center justify-center | rounded-full | text-[14px] font-[700] | aspect-square'
          style={{
            background:
              cookies['x-theme'] === 'dark'
                ? `${tagsStore.getTagsById(todo.tagId)?.color ?? '#000000'}`
                : `${tagsStore.getTagsById(todo.tagId)?.color ?? '#000000'}24`,
            color:
              cookies['x-theme'] === 'dark'
                ? 'white'
                : (tagsStore.getTagsById(todo.tagId)?.color ?? '#000000'),
          }}>
          {tagsStore.getTagsById(todo.tagId)?.label?.slice(0, 1) ?? 'M'}
        </span>
      </div>

      <div className='w-full overflow-hidden | hover:bg-slate-50 dark:hover:bg-zinc-600 | rounded-full | px-[8px] py-[4px]'>
        <p className='truncate text-[14px] sm:text-[15px]'>
          [{tagsStore.getTagsById(todo.tagId)?.label ?? 'Memo'}] {todo.description}
        </p>
        <p className='text-[11px] opacity-70 whitespace-nowrap'>
          {dateUtil.parseDate(todo.created)}
        </p>
      </div>
    </Link>
  ))

  return (
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | py-[16px]'>
      <h3 className='rounded-full | font-[700] text-[16px] | px-[16px]'>오늘 할 일</h3>
      <div className='mt-[12px] | flex flex-col gap-[4px]'>
        {todos.length ? (
          todos
        ) : (
          <p className='px-[16px] sm:text-[14px] | opacity-60'>오늘 할 일을 추가해 보세요.</p>
        )}
      </div>
    </div>
  )
}
