'use client'

import { Icon } from '@/app/components/Icon'
import TodosCards from '@/app/components/TodosCards'
import TodosSearch from '@/app/components/TodosSearch'
import TodosStatusDropdown from '@/app/components/TodosStatusDropdown'
import TodosTable from '@/app/components/TodosTable'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTagsFilter from '@/app/components/TodosTagsFilter'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import { Tag, TodoWithChildren } from '@/app/models/Todo'
import { useSheetStore } from '@/app/stores/sheet.store'
import { useTodosStore } from '@/app/stores/todos.store'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export default function Todos() {
  const sheetStore = useSheetStore()
  const todosStore = useTodosStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [page, setPage] = useState<number>(0)
  const [todos, setTodos] = useState<TodoWithChildren[]>()
  const [isTodosLoading, setIsTodosLoading] = useState<boolean>(false)
  const [isTodosNextLoading, setIsTodosNextLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number>()

  const [isShowTimeModal, setIsShowTimeModal] = useState<boolean>(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)

  const timeTargetTodo = searchParams.get('parent')
    ? todos
        ?.find(({ id }) => id === searchParams.get('parent'))
        ?.children?.find(({ id }) => id === searchParams.get('time'))
    : todos?.find(({ id }) => id === searchParams.get('time'))

  const searchText = searchParams.get('searchText') ?? ''
  const status = searchParams.get('status') ?? ''
  const tags = searchParams.get('tags') ?? ''

  const filterKey = useMemo(() => `${searchText}|${status}|${tags}`, [searchText, status, tags])
  const loadingRef = useRef(false)

  const loadTodos = useCallback(
    async (page = 0): Promise<void> => {
      if (loadingRef.current) return
      loadingRef.current = true

      if (page === 0) setIsTodosLoading(true)
      else setIsTodosNextLoading(true)

      const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined
      const status = searchParams.get('status') ?? ''
      const searchText = searchParams.get('searchText') ?? ''

      const res = await todosStore.getTodos({ tags, status, searchText, page })
      setTotal(res.total)

      if (page === 0) setTodos(res.todos)
      else setTodos((prev) => [...prev!, ...res.todos])

      setIsTodosLoading(false)
      setIsTodosNextLoading(false)
      loadingRef.current = false
    },
    [searchParams, todosStore]
  )

  const createTodo = async (): Promise<void> => {
    const todo = await todosStore.postDescription('')
    todosStore.updateDirties([todo.id], true)
    if (sheetStore.fileId) {
      fetch(
        `/api/sheet/google/todo?fileId=${sheetStore.fileId}&id=${todo.id}&created=${todo.created}&modified=${todo.modified}`,
        { method: 'POST' }
      ).then((res) => {
        if (res.ok) {
          todosStore.updateDirties([todo.id], false)
          res.json().then((result) => {
            todosStore.updateIndex(todo.id, result.index)
          })
        }
      })
    }

    router.push(`/todos/${todo.id}`)
  }

  const updateStatus = async (
    todo: TodoWithChildren,
    status: TodoWithChildren['status'],
    parentId?: string
  ): Promise<void> => {
    if (todos == null) return

    const modified = await todosStore.updateStatus(todo.id, status)
    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${todo?.index}&status=${status}&modified=${modified}`,
      { method: 'PATCH' }
    ).then((res) => {
      if (res.ok) todosStore.updateDirties([todo.id], false)
    })

    setTodos((prev) => {
      if (!prev) return prev

      return prev.map((item) => {
        if (!parentId) return item.id === todo.id ? { ...item, status } : item
        else {
          return {
            ...item,
            children: (item.children ?? []).map((child) =>
              child.id === todo.id ? { ...child, status } : child
            ),
          }
        }
      })
    })
  }

  const updateTime = async (
    todo: TodoWithChildren,
    values: {
      start: TodoWithChildren['start']
      end: TodoWithChildren['end']
      days?: TodoWithChildren['days']
    }
  ): Promise<void> => {
    const modified = await todosStore.updateTimes(todo.id, values)
    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${todo?.index}&modified=${modified}&start=${values.start}&end=${values.end}&days=${values.days ? values.days.join(',') : ''}`,
      { method: 'PATCH' }
    ).then((res) => {
      if (res.ok) todosStore.updateDirties([todo.id], false)
    })

    setTodos((prev) => {
      if (!prev) return prev
      return prev.map((item) => {
        if (!searchParams.get('parent')) return item.id === todo.id ? { ...item, ...values } : item
        else {
          return {
            ...item,
            children: (item.children ?? []).map((child) =>
              child.id === todo.id ? { ...child, ...values } : child
            ),
          }
        }
      })
    })
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const tagTargetTodo = todos?.find(({ id }) => id === searchParams.get('todoTag'))

    if (!tagTargetTodo?.id) return router.back()

    const modified = await todosStore.updateTag(tagTargetTodo.id, tag.id)

    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${tagTargetTodo?.index}&tag=${tag.id}&modified=${modified}`,
      { method: 'PATCH' }
    ).then((res) => {
      if (res.ok) todosStore.updateDirties([tagTargetTodo.id], false)
    })

    setTodos((prev) => {
      if (!prev) return prev
      return prev.map((todo) => (todo.id === tagTargetTodo.id ? { ...todo, tagId: tag.id } : todo))
    })

    router.back()
  }

  useLayoutEffect(() => {
    setIsTodosLoading(true)
  }, [])

  useEffect(() => {
    if (page) loadTodos(page)
  }, [page])

  useEffect(() => {
    loadTodos()
  }, [filterKey])

  useEffect(() => {
    setIsShowTimeModal(!!searchParams.get('time'))
    setIsShowTagModal(!!searchParams.get('todoTag'))
  }, [searchParams])

  return (
    <div className='flex flex-col | sm:max-h-full'>
      <TodosTimeModal
        isShow={isShowTimeModal}
        todo={timeTargetTodo}
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
        total={total}
        todos={todos}
        setTodos={setTodos}
        isLoading={isTodosLoading}
        updateStatus={updateStatus}
        setPage={setPage}
        isTodosNextLoading={isTodosNextLoading}
      />
      <TodosCards
        total={total}
        todos={todos}
        setTodos={setTodos}
        isLoading={isTodosLoading}
        updateStatus={updateStatus}
        setPage={setPage}
        isTodosNextLoading={isTodosNextLoading}
      />
    </div>
  )
}
