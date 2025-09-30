'use client'

import { useDateUtil } from '@/hooks/useDateUtil'
import { Todo } from '@/models/Todo'
import { useTagsStore } from '@/stores/tags.store'
import { useTodosStore } from '@/stores/todos.store'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

export function HomeRecents() {
  const todoStore = useTodosStore()
  const tagsStore = useTagsStore()

  const dateUtil = useDateUtil()
  const [cookies] = useCookies()

  const [recentTodos, setRecentTodos] = useState<Todo[]>([])

  const loadRecentTodos = async (): Promise<void> => {
    const todos = await todoStore.getRecentTodos()
    setRecentTodos(todos)
  }

  useEffect(() => {
    loadRecentTodos()
  }, [])

  return (
    <div className='w-full | bg-white dark:bg-zinc-700 shadow-md rounded-xl | py-[16px]'>
      <h3 className='cursor-pointer | rounded-full | font-[700] text-[16px] | px-[16px]'>
        최근 할 일
      </h3>
      <div className='mt-[12px] | flex flex-col gap-[4px] | lg:h-[300px] overflow-auto'>
        {recentTodos.map((todo) => (
          <Link
            key={todo.id}
            href={`/todos/${todo.id}`}
            className='flex items-center | border-t border-slate-100 dark:border-zinc-600 last:border-b | py-[4px] px-[8px]'>
            <div className='dark:bg-zinc-600 | p-[4px] shadow-sm shadow-gray-400 dark:shadow-gray-800 rounded-full'>
              <span
                className='w-[32px] | flex items-center justify-center | rounded-full | text-[14px] font-[700] | aspect-square'
                style={{
                  background:
                    cookies['x-theme'] === 'dark'
                      ? `${tagsStore.getTagsById(todo.tagId)?.color ?? '#000000'}ae`
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
              <p className='truncate text-[14px] lg:text-[15px]'>
                [{tagsStore.getTagsById(todo.tagId)?.label ?? 'Memo'}] {todo.description}
              </p>
              <p className='text-[11px] opacity-70 whitespace-nowrap'>
                {dateUtil.parseDate(todo.created)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
