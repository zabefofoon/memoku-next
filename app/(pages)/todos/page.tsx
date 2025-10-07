'use client'

import { Icon } from '@/app/components/Icon'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosStatusDropdown from '@/app/components/TodosStatusDropdown'
import TodosTable from '@/app/components/TodosTable'
import TodosTagsDropdown from '@/app/components/TodosTagsDropdown'
import { Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Todos(props: PageProps<'/todos'>) {
  const todosStore = useTodosStore()

  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>()

  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)

  const loadTodos = async () => {
    const res = await todosStore.getTodos()
    setTodos(res)
  }

  const handleSearchParams = async (): Promise<void> => {
    const searchParams = await props.searchParams
    setIsShowDeleteModal(!!searchParams.deleteModal)
  }

  const deleteTodo = async (): Promise<void> => {
    const searchParams = await props.searchParams
    if (searchParams.deleteModal && !isNaN(+searchParams.deleteModal)) {
      await todosStore.deleteTodo(+searchParams.deleteModal)
      loadTodos()
    }

    router.back()
  }

  useEffect(() => {
    loadTodos()
  }, [])

  useEffect(() => {
    handleSearchParams()
  }, [props.searchParams])

  return (
    <div>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={() => router.back()}
        delete={deleteTodo}
      />
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
