'use client'

import { useDateUtil } from '@/app/hooks/useDateUtil'
import { todosDB } from '@/app/lib/todos.db'
import { Todo } from '@/app/models/Todo'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import TagBadge from './TagBadge'

export default function HomeRecents() {
  const dateUtil = useDateUtil()

  const [recentTodos, setRecentTodos] = useState<Todo[]>([])

  const loadRecentTodos = async (): Promise<void> => {
    const todos = await todosDB.getRecentTodos()
    setRecentTodos(todos)
  }

  useEffect(() => {
    loadRecentTodos()
  }, [])

  return (
    <div className='emboss-sheet | flex-1 w-full'>
      <div className='p-[16px]'>
        <h3 className='font-[700] text-[16px] | px-[16px]'>최근 수정</h3>
        <div className='mt-[12px] | flex flex-col gap-[4px]'>
          {recentTodos.map((todo) => (
            <Link
              key={todo.id}
              href={`/todos/${todo.id}`}
              className='flex items-center | border-t border-slate-100 dark:border-zinc-600 last:border-b | py-[4px] px-[8px]'>
              <TagBadge id={todo.tagId} />

              <div className='w-full overflow-hidden | hover:bg-slate-50 dark:hover:bg-zinc-600 | rounded-full | px-[8px] py-[4px]'>
                <p className='truncate text-[14px] sm:text-[15px]'>
                  {todo.description?.split(/\n/)[0].slice(0, 50)}
                </p>
                <p className='text-[11px] opacity-70 whitespace-nowrap'>
                  {dateUtil.parseDate(todo.created)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
