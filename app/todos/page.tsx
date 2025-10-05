'use client'

import { Icon } from '@/components/Icon'
import TodosStatusDropdown from '@/components/TodosStatusDropdown'
import TodosTable from '@/components/TodosTable'
import TodosTagsDropdown from '@/components/TodosTagsDropdown'
import { Todo } from '@/models/Todo'
import { useTodosStore } from '@/stores/todos.store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Todos() {
  const todoStore = useTodosStore()

  const [todos, setTodos] = useState<Todo[]>()

  const loadTodos = async () => {
    const res = await todoStore.getTodos()
    setTodos(res)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] opacity-80'>Todos</h1>
        <p className='text-[16px] opacity-50'>할 일을 정리해보세요.</p>
      </div>
      <div className='flex items-center gap-[12px] | mb-[20px]'>
        <label className='search | w-fit flex items-center | border border-gray-300 dark:border-zinc-600 rounded-lg has-focus:border-violet-500 | pr-[8px]'>
          <span className='sr-only'>검색</span>
          <button
            type='button'
            className='pl-[8px]'>
            <Icon
              name='search'
              className='text-[20px]'
            />
          </button>
          <input
            type='text'
            placeholder='검색'
            className='w-[200px] py-[4px] pl-[4px] outline-0'
            required
          />
          <button
            type='button'
            className='close'>
            <Icon
              name='close'
              className='text-[20px]'
            />
          </button>
        </label>
        <div className='flex items-center gap-[12px]'>
          <TodosTagsDropdown />
          <TodosStatusDropdown />
        </div>
        <Link
          href='/todos/new'
          className='ml-auto | flex items-center | bg-violet-500 rounded-lg | px-[8px] py-[6px] | text-white'>
          <Icon
            name='plus'
            className='text-[20px]'
          />
          <p className='text-[14px]'>추가하기</p>
        </Link>
      </div>
      <TodosTable todos={todos} />
    </div>
  )
}
