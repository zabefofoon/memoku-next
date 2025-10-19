'use client'

import { Icon } from '@/app/components/Icon'
import TodosCards from '@/app/components/TodosCards'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosSearch from '@/app/components/TodosSearch'
import TodosStatusDropdown from '@/app/components/TodosStatusDropdown'
import TodosTable from '@/app/components/TodosTable'
import TodosTagsFilter from '@/app/components/TodosTagsFilter'
import { Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Todos(props: PageProps<'/todos'>) {
  const todosStore = useTodosStore()

  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>()

  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)
  const [loadKey, setLoadKey] = useState<number>(0)

  const loadTodos = async () => {
    const searchParams = await props.searchParams
    const tags = (searchParams.tags as string)?.split(',')
    const status = searchParams.status as string
    const searchText = searchParams.searchText as string
    const res = await todosStore.getTodos({ tags, status, searchText })
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
      setLoadKey((prev) => ++prev)
    }

    router.back()
  }

  const updateStatus = async (status: Todo['status'], todoId?: number): Promise<void> => {
    if (todoId == null) return
    if (todos == null) return

    await todosStore.updateStatus(todoId, status)
    setTodos(
      (prev) => prev?.map((todo) => (todo.id === todoId ? { ...todo, status } : todo)) ?? prev
    )
    setLoadKey((prev) => ++prev)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  useEffect(() => {
    handleSearchParams()
    loadTodos()
  }, [props.searchParams])

  return (
    <div className='flex flex-col | max-h-full'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={() => router.back()}
        delete={deleteTodo}
      />
      <div className='mb-[24px] | hidden sm:block'>
        <h1 className='text-[20px] opacity-80'>Todos</h1>
        <p className='text-[16px] opacity-50'>할 일을 정리해보세요.</p>
      </div>
      <div className='sticky top-0 left-0 z-[50] bg-gray-100 dark:bg-zinc-900'>
        <div className='flex items-center gap-[12px] | mb-[8px] sm:mb-[20px]'>
          <TodosSearch />
          <div className='shrink-0 flex items-center gap-[12px]'>
            <TodosStatusDropdown />
          </div>
          <Link
            href='/todos/new'
            className='ml-auto | hidden sm:flex items-center | bg-violet-500 rounded-lg | px-[8px] py-[6px] | text-white'>
            <Icon
              name='plus'
              className='text-[20px]'
            />
            <p className='text-[14px]'>추가하기</p>
          </Link>
        </div>
        <TodosTagsFilter />
      </div>
      <TodosTable
        key={`table_${loadKey}`}
        todos={todos}
        updateStatus={updateStatus}
      />
      <TodosCards
        key={`cards${loadKey}`}
        todos={todos}
        updateStatus={updateStatus}
      />
    </div>
  )
}
