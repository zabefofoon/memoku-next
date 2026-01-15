'use client'

import { todosDB } from '@/app/lib/todos.db'
import { Todo } from '@/app/models/Todo'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { TodoCard } from './TodosCard'

export default function HomeRecents() {
  const [recentTodos, setRecentTodos] = useState<Todo[]>([])
  const t = useTranslations('Home')

  const loadRecentTodos = async (): Promise<void> => {
    const todos = await todosDB.getRecentTodos()
    setRecentTodos(todos)
  }

  useEffect(() => {
    loadRecentTodos()
  }, [])

  return (
    <div className='emboss-sheet | w-full | flex flex-col p-[16px]'>
      <h3 className='font-[700] text-[14px]'>{t('HomeRecentLabel')}</h3>
      <div className='mt-[8px] | grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[6px]'>
        {recentTodos.map((todo) => (
          <TodoCard
            key={todo.id}
            className='w-full'
            todo={todo}
            display='grid'
            hideChildren
          />
        ))}
      </div>
    </div>
  )
}
