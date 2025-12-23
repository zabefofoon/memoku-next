'use client'

import { todosDB } from '@/app/lib/todos.db'
import { Todo } from '@/app/models/Todo'
import { useEffect, useState } from 'react'
import { TodoCard } from './TodosCard'

export default function HomeRecents() {
  const [recentTodos, setRecentTodos] = useState<Todo[]>([])

  const loadRecentTodos = async (): Promise<void> => {
    const todos = await todosDB.getRecentTodos()
    setRecentTodos(todos)
  }

  useEffect(() => {
    loadRecentTodos()
  }, [])

  return (
    <div className='emboss-sheet | w-full | flex flex-col p-[16px]'>
      <h3 className='font-[700] text-[14px]'>최근 수정</h3>
      <div className='mt-[8px] | grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[6px]'>
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
