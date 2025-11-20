'use client'

import { Icon } from '@/app/components/Icon'
import TodosCards from '@/app/components/TodosCards'
import { TodosFilters } from '@/app/components/TodosFilters'
import TodosSearch from '@/app/components/TodosSearch'
import TodosSelectedFilters from '@/app/components/TodosSelectedFilters'
import TodosTable from '@/app/components/TodosTable'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import { Tag, Todo, TodoWithChildren } from '@/app/models/Todo'
import { useSheetStore } from '@/app/stores/sheet.store'
import { useTodosStore } from '@/app/stores/todos.store'
import Link from 'next/link'
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
  const [isShowFilters, setIsShowFilters] = useState(false)

  const [isShow, setIsShow] = useState(true)

  const timeTargetTodo = searchParams.get('parent')
    ? todos
        ?.find(({ id }) => id === searchParams.get('parent'))
        ?.children?.find(({ id }) => id === searchParams.get('time'))
    : todos?.find(({ id }) => id === searchParams.get('time'))

  const searchText = searchParams.get('searchText') ?? ''
  const status = searchParams.get('status') ?? ''
  const tags = searchParams.get('tags') ?? ''
  const sort = searchParams.get('sort') ?? ''

  const filterKey = useMemo(
    () => `${searchText}|${status}|${tags}|${sort}`,
    [sort, searchText, status, tags]
  )
  const loadingRef = useRef(false)

  const applySort = (
    sort: 'recent' | undefined,
    status: Todo['status'][],
    tags: Tag['id'][]
  ): void => {
    router.replace(
      `?searchText=${searchText}&sort=${sort ?? ''}&status=${status.join(',')}&tags=${tags.join(',')}`,
      { scroll: false }
    )
  }

  const loadTodos = useCallback(
    async (page = 0): Promise<void> => {
      if (loadingRef.current) return
      loadingRef.current = true

      if (page === 0) setIsTodosLoading(true)
      else setIsTodosNextLoading(true)

      const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined
      const status = searchParams.get('status')
        ? (searchParams.get('status')!.split(',') as Todo['status'][])
        : undefined
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
    let prevScrollTop = 0

    const handleScroll = (): void => {
      const scrollEl = document.getElementById('scroll-el')
      if (!scrollEl) return
      if (scrollEl.scrollTop < 132) setIsShow(true)

      const current = scrollEl.scrollTop
      const diff = Math.abs(current - prevScrollTop)

      if (diff < 10) return

      setIsShow(current < prevScrollTop)
      prevScrollTop = current
    }

    const el = document.getElementById('scroll-el')
    el?.addEventListener('scroll', handleScroll)

    return () => {
      el?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (page) loadTodos(page)
  }, [page])

  useEffect(() => {
    setPage(0)
    loadTodos()
  }, [filterKey])

  useEffect(() => {
    setIsShowTimeModal(!!searchParams.get('time'))
    setIsShowTagModal(!!searchParams.get('todoTag'))
    setIsShowFilters(!!searchParams.get('filter'))
  }, [searchParams])

  return (
    <div className='flex flex-col | sm:max-h-full'>
      <TodosFilters
        isShow={isShowFilters}
        close={router.back}
        apply={applySort}
      />
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
      <div className='px-[16px] sm:px-0 mt-[24px] sm:mt-0 '>
        <h1 className='text-[20px] opacity-80'>Todos</h1>
        <p className='text-[16px] opacity-50'>할 일을 정리해보세요.</p>
      </div>

      <div
        className='sticky top-0 left-0 z-[50] | pt-[16px] pb-[6px] | bg-gray-100/50 | transition-transform'
        style={{
          backdropFilter: 'blur(4px)',
          transform: isShow ? 'translate(0, 0)' : 'translate(0, -100%)',
        }}>
        <div className='flex items-center gap-[12px] | px-[16px] mb-[8px] sm:mb-[20px]'>
          <TodosSearch />
          <Link
            href={`?${decodeURIComponent(searchParams.toString())}&filter=true`}
            className='shrink-0 flex items-center gap-[12px] ml-auto sm:ml-0'
            scroll={false}>
            <Icon
              name='filter'
              className='text-[20px]'
            />
            <Icon
              name='chevron-down'
              className='ml-[-16px] | text-[16px]'
            />
          </Link>
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
        <TodosSelectedFilters />
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
