'use client'

import { Icon } from '@/app/components/Icon'
import TodosCards from '@/app/components/TodosCards'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosSearch from '@/app/components/TodosSearch'
import TodosStatusDropdown from '@/app/components/TodosStatusDropdown'
import TodosTable from '@/app/components/TodosTable'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTagsFilter from '@/app/components/TodosTagsFilter'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import { Tag, Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Todos(props: PageProps<'/todos'>) {
  const todosStore = useTodosStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>()
  const [isTodosLoading, setIsTodosLoading] = useState<boolean>(true)

  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)
  const [isShowTimeModal, setIsShowTimeModal] = useState<boolean>(false)
  const [loadKey, setLoadKey] = useState<number>(0)
  const [isShowTagModal, setIsShowTagModal] = useState(false)

  const timeTargetTodo = todos?.find((todo) => {
    const timeQuery = searchParams.get('time')
    const todoId = timeQuery ? +timeQuery : undefined

    return todo.id === todoId
  })

  const loadTodos = async (): Promise<void> => {
    setIsTodosLoading(true)
    const searchParams = await props.searchParams
    const tags = (searchParams.tags as string)?.split(',')
    const status = searchParams.status as string
    const searchText = searchParams.searchText as string
    const res = await todosStore.getTodos({ tags, status, searchText })
    setTodos(res)
    setIsTodosLoading(false)
  }

  const createTodo = async (): Promise<void> => {
    const res = await todosStore.postDescription('')
    router.push(`/todos/${res}`)
  }

  const handleSearchParams = async (): Promise<void> => {
    const searchParams = await props.searchParams
    setIsShowDeleteModal(!!searchParams.deleteModal)
    setIsShowTimeModal(!!searchParams.time)
    setIsShowTagModal(!!searchParams.todoTag)
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

  const updateTime = async (
    id: number,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ): Promise<void> => {
    const timeQuery = searchParams.get('time')
    const todoId = timeQuery ? +timeQuery : undefined

    await todosStore.updateTimes(id, values)

    if (id === timeTargetTodo?.id)
      setTodos(
        (prev) => prev?.map((todo) => (todo.id === todoId ? { ...todo, ...values } : todo)) ?? prev
      )
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const tagTargetTodo = todos?.find((todo) => {
      const timeQuery = searchParams.get('todoTag')
      const todoId = timeQuery ? +timeQuery : undefined

      return todo.id === todoId
    })

    if (tagTargetTodo?.id) {
      await todosStore.updateTag(tagTargetTodo.id, tag.id)
      setTodos(
        (prev) =>
          prev?.map((todo) => (todo.id === tagTargetTodo.id ? { ...todo, tagId: tag.id } : todo)) ??
          prev
      )
      router.back()
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  useEffect(() => {
    handleSearchParams()
    loadTodos()
  }, [props.searchParams])

  return (
    <div className='flex flex-col | sm:max-h-full'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={() => router.back()}
        delete={deleteTodo}
      />
      <TodosTimeModal
        isShow={isShowTimeModal}
        todos={[timeTargetTodo].filter((todo) => !!todo)}
        updateTime={updateTime}
        close={router.back}
      />
      <TodosTagModal
        isShow={isShowTagModal}
        close={router.back}
        select={changeTag}
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
          <button
            type='button'
            className='ml-auto | hidden sm:flex items-center | bg-indigo-500 dark:bg-indigo-600 rounded-lg | px-[8px] py-[6px] | text-white'
            onClick={createTodo}>
            <Icon
              name='plus'
              className='text-[20px]'
            />
            <p className='text-[14px]'>추가하기</p>
          </button>
        </div>
        <TodosTagsFilter />
      </div>
      <TodosTable
        key={`table_${loadKey}`}
        todos={todos}
        isLoading={isTodosLoading}
        updateStatus={updateStatus}
      />
      <TodosCards
        key={`cards${loadKey}`}
        todos={todos}
        isLoading={isTodosLoading}
        updateStatus={updateStatus}
      />
    </div>
  )
}
