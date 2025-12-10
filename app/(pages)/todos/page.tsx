'use client'

import { Icon } from '@/app/components/Icon'
import TodosCards from '@/app/components/TodosCards'
import TodosCardsNextWeek from '@/app/components/TodosCardsNextWeek'
import TodosCardsThisWeek from '@/app/components/TodosCardsThisWeek'
import TodosCardsToday from '@/app/components/TodosCardsToday'
import { TodosChildren } from '@/app/components/TodosChildren'
import { TodosFilters } from '@/app/components/TodosFilters'
import TodosSearch from '@/app/components/TodosSearch'
import TodosSelectedFilters from '@/app/components/TodosSelectedFilters'
import { TodosStatusModal } from '@/app/components/TodosStatusModal'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import { GetTodosParams, Tag, Todo } from '@/app/models/Todo'
import { useThemeStore } from '@/app/stores/theme.store'
import { useTodosPageStore } from '@/app/stores/todosPage.store'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function Todos() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const screenSize = useThemeStore((state) => state.screenSize)
  const todos = useTodosPageStore((state) => state.todos)
  const todayTodos = useTodosPageStore((state) => state.todayTodos)
  const thisWeekTodos = useTodosPageStore((state) => state.thisWeekTodos)
  const nextWeekTodos = useTodosPageStore((state) => state.nextWeekTodos)
  const setTodos = useTodosPageStore((state) => state.setTodos)
  const children = useTodosPageStore((state) => state.children)
  const loadTodosInStore = useTodosPageStore((state) => state.loadTodos)
  const loadTodayTodosInStore = useTodosPageStore((state) => state.loadTodayTodos)
  const loadThisWeekTodosInStore = useTodosPageStore((state) => state.loadThisWeekTodos)
  const loadNextWeekTodosInStore = useTodosPageStore((state) => state.loadNextWeekTodos)
  const createTodoInStore = useTodosPageStore((state) => state.createTodo)
  const changeTagInStore = useTodosPageStore((state) => state.changeTag)
  const updateStatusInStore = useTodosPageStore((state) => state.updateStatus)
  const setPage = useTodosPageStore((state) => state.setPage)
  const updateTime = useTodosPageStore((state) => state.updateTime)

  const [isShow, setIsShow] = useState(true)

  const searchQuery = searchParams.get('searchText')
  const statusQuery = searchParams.get('status')
  const tagsQuery = searchParams.get('tags')
  const sortQuery = searchParams.get('sort')
  const parentQuery = searchParams.get('parent')
  const timeQuery = searchParams.get('time')
  const todoTagQuery = searchParams.get('todoTag')
  const todoStatusQuery = searchParams.get('todoStatus')
  const filterQuery = searchParams.get('filter')
  const childrenQuery = searchParams.get('children')

  const timeTargetTodo = useMemo(
    () =>
      parentQuery
        ? todos?.find(({ id }) => id === parentQuery)?.children?.find(({ id }) => id === timeQuery)
        : todos?.find(({ id }) => id === timeQuery),
    [parentQuery, timeQuery, todos]
  )

  const createTodo = async (): Promise<void> => {
    const todo = await createTodoInStore()
    router.push(`/todos/${todo.id}`)
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const tagTargetTodo =
      children?.find(({ id }) => id === todoTagQuery) ||
      todayTodos?.find(({ id }) => id === todoTagQuery) ||
      thisWeekTodos?.find(({ id }) => id === todoTagQuery) ||
      nextWeekTodos?.find(({ id }) => id === todoTagQuery) ||
      todos?.find(({ id }) => id === todoTagQuery)

    if (tagTargetTodo) changeTagInStore(tagTargetTodo, tag)
    router.back()
  }

  const changeStatus = async (status: Todo['status']): Promise<void> => {
    const tagTargetTodo =
      children?.find(({ id }) => id === todoStatusQuery) ||
      todayTodos?.find(({ id }) => id === todoStatusQuery) ||
      thisWeekTodos?.find(({ id }) => id === todoStatusQuery) ||
      nextWeekTodos?.find(({ id }) => id === todoStatusQuery) ||
      todos?.find(({ id }) => id === todoStatusQuery)

    if (tagTargetTodo) updateStatusInStore(tagTargetTodo, status)
    router.back()
  }

  const loadTodos = useCallback(
    (page = 0): void => {
      loadTodayTodosInStore({
        tags: tagsQuery?.split(','),
        status: statusQuery ? (statusQuery?.split(',') as Todo['status'][]) : undefined,
        searchText: searchQuery ?? '',
        sort: (sortQuery ?? 'created') as GetTodosParams['sort'],
        page,
      })
      loadThisWeekTodosInStore({
        tags: tagsQuery?.split(','),
        status: statusQuery ? (statusQuery?.split(',') as Todo['status'][]) : undefined,
        searchText: searchQuery ?? '',
        sort: (sortQuery ?? 'created') as GetTodosParams['sort'],
        page,
      })
      loadNextWeekTodosInStore({
        tags: tagsQuery?.split(','),
        status: statusQuery ? (statusQuery?.split(',') as Todo['status'][]) : undefined,
        searchText: searchQuery ?? '',
        sort: (sortQuery ?? 'created') as GetTodosParams['sort'],
        page,
      })
      loadTodosInStore({
        tags: tagsQuery?.split(','),
        status: statusQuery ? (statusQuery?.split(',') as Todo['status'][]) : undefined,
        searchText: searchQuery ?? '',
        sort: (sortQuery ?? 'created') as GetTodosParams['sort'],
        page,
      })
    },
    [
      loadNextWeekTodosInStore,
      loadThisWeekTodosInStore,
      loadTodayTodosInStore,
      loadTodosInStore,
      searchQuery,
      sortQuery,
      statusQuery,
      tagsQuery,
    ]
  )

  useEffect(() => {
    let prevScrollTop = 0

    const handleScroll = (): void => {
      if (screenSize === 'desktop') return

      const scrollEl = document.getElementById('scroll-el')
      const current = scrollEl?.scrollTop ?? 0

      if (current < 132) setIsShow(true)
      else if (Math.abs(current - prevScrollTop) >= 10) setIsShow(current < prevScrollTop)
      prevScrollTop = current
    }

    const el = document.getElementById('scroll-el')
    el?.addEventListener('scroll', handleScroll)

    return () => {
      el?.removeEventListener('scroll', handleScroll)
      setTodos(() => undefined)
    }
  }, [setTodos, screenSize])

  useEffect(() => {
    setPage(0, loadTodos)
  }, [searchQuery, statusQuery, tagsQuery, sortQuery, setPage, loadTodos])

  return (
    <div className='flex flex-col'>
      <TodosStatusModal
        isShow={!!todoStatusQuery}
        select={changeStatus}
        close={router.back}
      />
      <TodosChildren
        isShow={!!childrenQuery}
        close={router.back}
      />
      <TodosFilters
        isShow={!!filterQuery}
        close={router.back}
      />
      <TodosTimeModal
        isShow={!!timeQuery}
        todo={timeTargetTodo}
        updateTime={(todo, values) => updateTime(todo, values, parentQuery || undefined)}
        close={router.back}
      />
      <TodosTagModal
        isShow={!!todoTagQuery}
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
            href={{ query: { ...Object.fromEntries(searchParams), filter: 'true' } }}
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
      <div className='flex flex-col gap-[32px] mb-[88px]'>
        <TodosCardsToday />
        <TodosCardsThisWeek />
        <TodosCardsNextWeek />
        <TodosCards loadTodos={loadTodos} />
      </div>
    </div>
  )
}
