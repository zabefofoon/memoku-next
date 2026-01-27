'use client'

import { todosDB } from '@/app/lib/todos.db'
import { Todo } from '@/app/models/Todo'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Else, If, Then } from 'react-if'
import { TodoCard } from './TodosCard'

export default function HomeRecents() {
  const [recentTodos, setRecentTodos] = useState<Todo[]>([])
  const t = useTranslations()

  const loadRecentTodos = async (): Promise<void> => {
    const todos = await todosDB.getRecentTodos()
    setRecentTodos(todos)
  }

  useEffect(() => {
    loadRecentTodos()
  }, [])

  return (
    <div className='emboss-sheet | w-full | flex flex-col p-[16px]'>
      <h3 className='font-[700] text-[14px]'>{t('Home.HomeRecentLabel')}</h3>
      <If condition={recentTodos.length}>
        <Then>
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
        </Then>
        <Else>
          <p className='opacity-80 text-[13px] | h-full min-h-[180px] | flex items-center justify-center'>
            {t('General.EmptyData')}
          </p>
        </Else>
      </If>
    </div>
  )
}
