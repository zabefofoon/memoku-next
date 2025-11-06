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
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function Todos(props: PageProps<'/todos'>) {
  const todosStore = useTodosStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>()
  const [isTodosLoading, setIsTodosLoading] = useState<boolean>(true)

  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)
  const [isShowTimeModal, setIsShowTimeModal] = useState<boolean>(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)

  const [childrenMap, setChildrenMap] = useState<Record<number, Todo[]>>({})
  const [isExpandMap, setIsExpandMap] = useState<Record<number, boolean>>({})

  const timeTargetTodo = todos?.find((todo) => {
    return todo.id === searchParams.get('time')
  })

  const searchText = searchParams.get('searchText') ?? ''
  const status = searchParams.get('status') ?? ''
  const tags = searchParams.get('tags') ?? '' // e.g. "1,2,3"

  const filterKey = useMemo(() => `${searchText}|${status}|${tags}`, [searchText, status, tags])

  const loadTodos = useCallback(async (): Promise<void> => {
    setIsTodosLoading(true)
    const searchParams = await props.searchParams
    const tags = (searchParams.tags as string)?.split(',')
    const status = searchParams.status as string
    const searchText = searchParams.searchText as string
    const res = await todosStore.getTodos({ tags, status, searchText })
    setTodos(res)
    setIsTodosLoading(false)
  }, [todosStore, tags, status, searchText])

  const createTodo = async (): Promise<void> => {
    const res = await todosStore.postDescription('')
    router.push(`/todos/${res}`)
  }

  const deleteTodo = async (): Promise<void> => {
    const todoId = searchParams.get('deleteModal') ?? ''

    await todosStore.deleteTodo(todoId)
    const todoIndex = todos?.findIndex(({ id }) => id === todoId) ?? -1
    if (todoIndex !== -1) {
      const todo = todos?.[todoIndex]
      if (!todo) return

      let child: Todo

      if (todo.childId) child = await todosStore.getTodo(todo.childId)
      setTodos((prev) => {
        const sliced = prev?.slice() ?? []
        if (child) sliced?.splice(todoIndex, 1, child)
        else sliced?.splice(todoIndex, 1)
        return sliced
      })
    } else {
      const todo = Object.values(childrenMap)
        .flat()
        .find(({ id }) => id === todoId)
      if (!todo) return

      const bucketKey = Object.keys(childrenMap)
        .map((k) => Number(k))
        .find((k) => childrenMap[k]?.some((c) => c.id === todoId))

      if (bucketKey == null) return

      setChildrenMap((prev) => {
        const arr = prev[bucketKey] ?? []
        const nextArr = arr.filter(({ id }) => id !== todoId)
        return { ...prev, [bucketKey]: nextArr }
      })

      const parentId = todo.parentId
      if (parentId != null) {
        setTodos((prev) => {
          if (!prev) return prev
          return prev.map((t) => (t.id === parentId ? { ...t, childId: todo.childId } : t))
        })
      }
    }
    router.back()
  }

  const updateStatus = async (status: Todo['status'], todoId?: string): Promise<void> => {
    if (todoId == null) return
    if (todos == null) return

    todosStore.updateStatus(todoId, status)
    if (todos.find((todo) => todo.id === todoId))
      setTodos(
        (prev) => prev?.map((todo) => (todo.id === todoId ? { ...todo, status } : todo)) ?? prev
      )
  }

  const updateTime = async (
    id: string,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ): Promise<void> => {
    const todoId = searchParams.get('time') ?? ''

    await todosStore.updateTimes(id, values)

    const found = todos?.findIndex((todo) => todo.id === id) ?? -1
    if (found >= 0)
      setTodos(
        (prev) => prev?.map((todo) => (todo.id === todoId ? { ...todo, ...values } : todo)) ?? prev
      )
    else {
      const todo = Object.values(childrenMap)
        .flat()
        .find(({ id }) => id === todoId)
      if (!todo) return

      const bucketKey = Object.keys(childrenMap)
        .map((k) => Number(k))
        .find((k) => childrenMap[k]?.some((c) => c.id === todoId))

      if (bucketKey == null) return

      setChildrenMap((prev) => {
        const arr = prev[bucketKey] ?? []
        const nextArr = arr.map((c) => (c.id === id ? { ...c, ...values } : c))
        return { ...prev, [bucketKey]: nextArr }
      })
    }
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const tagTargetTodo = todos?.find((todo) => {
      const todoId = searchParams.get('todoTag')

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
  }, [filterKey, loadTodos])

  useEffect(() => {
    setIsShowDeleteModal(!!searchParams.get('deleteModal'))
    setIsShowTimeModal(!!searchParams.get('time'))
    setIsShowTagModal(!!searchParams.get('todoTag'))
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
        todos={todos}
        isLoading={isTodosLoading}
        updateStatus={updateStatus}
        childrenMap={childrenMap}
        setChildrenMap={setChildrenMap}
        isExpandMap={isExpandMap}
        setIsExpandMap={setIsExpandMap}
      />
      <TodosCards
        todos={todos}
        isLoading={isTodosLoading}
        updateStatus={updateStatus}
        childrenMap={childrenMap}
        setChildrenMap={setChildrenMap}
        isExpandMap={isExpandMap}
        setIsExpandMap={setIsExpandMap}
      />
    </div>
  )
}
