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
import UISpinner from '@/app/components/UISpinner'
import { GetTodosParams, Todo } from '@/app/models/Todo'
import { useScrollStore } from '@/app/stores/scroll.store'
import { useThemeStore } from '@/app/stores/theme.store'
import { useTodosPageStore } from '@/app/stores/todosPage.store'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { If, Then } from 'react-if'

export default function Todos() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const screenSize = useThemeStore((state) => state.screenSize)
  const todos = useTodosPageStore((state) => state.todos)

  const loadTodosInStore = useTodosPageStore((state) => state.loadTodos)
  const loadTodayTodosInStore = useTodosPageStore((state) => state.loadTodayTodos)
  const loadThisWeekTodosInStore = useTodosPageStore((state) => state.loadThisWeekTodos)
  const loadNextWeekTodosInStore = useTodosPageStore((state) => state.loadNextWeekTodos)
  const createTodo = useTodosPageStore((state) => state.createTodo)
  const changeTag = useTodosPageStore((state) => state.changeTag)
  const updateStatus = useTodosPageStore((state) => state.updateStatus)
  const setPage = useTodosPageStore((state) => state.setPage)
  const updateTime = useTodosPageStore((state) => state.updateTime)
  const isTodosLoading = useTodosPageStore((state) => state.isTodosLoading)
  const total = useTodosPageStore((state) => state.total)
  const isTodosNextLoading = useTodosPageStore((state) => state.isTodosNextLoading)
  const page = useTodosPageStore((state) => state.page)

  const [isShow, setIsShow] = useState(true)

  const searchQuery = searchParams.get('searchText')
  const statusQuery = searchParams.get('status')
  const tagsQuery = searchParams.get('tags')
  const sortQuery = searchParams.get('sort')
  const timeQuery = searchParams.get('time')
  const todoTagQuery = searchParams.get('todoTag')
  const todoStatusQuery = searchParams.get('todoStatus')
  const filterQuery = searchParams.get('filter')
  const childrenQuery = searchParams.get('children')

  const nextLoaderEl = useRef<HTMLDivElement>(null)

  const baseParams = useMemo<Omit<GetTodosParams, 'page'>>(() => {
    return {
      tags: tagsQuery?.split(','),
      status: statusQuery ? (statusQuery?.split(',') as Todo['status'][]) : undefined,
      searchText: searchQuery ?? '',
      sort: (sortQuery ?? 'created') as GetTodosParams['sort'],
    }
  }, [searchQuery, sortQuery, statusQuery, tagsQuery])

  const loadTodos = useCallback(
    (page = 0): void => {
      const params = { ...baseParams, page }
      if (page === 0) loadTodayTodosInStore(params)
      if (page === 0) loadThisWeekTodosInStore(params)
      if (page === 0) loadNextWeekTodosInStore(params)
      loadTodosInStore(params)
    },
    [
      baseParams,
      loadNextWeekTodosInStore,
      loadThisWeekTodosInStore,
      loadTodayTodosInStore,
      loadTodosInStore,
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
    }
  }, [screenSize])

  useEffect(() => {
    const { prevPathname } = useScrollStore.getState()

    const shouldRestore = /^\/todos\/[^/]+$/.test(prevPathname)
    if (shouldRestore) {
      const { todos, todayTodos, thisWeekTodos, nextWeekTodos } = useTodosPageStore.getState()
      if (!todos || !todayTodos || !thisWeekTodos || !nextWeekTodos) setPage(0, loadTodos)
    } else setPage(0, loadTodos)
  }, [loadTodos, setPage])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isLoadable = entry.isIntersecting && !isTodosNextLoading && !isTodosLoading
      if (isLoadable) setPage(page + 1, loadTodos)
    })
    if (nextLoaderEl.current) observer.observe(nextLoaderEl.current)

    return () => {
      observer.disconnect()
    }
  }, [isTodosLoading, isTodosNextLoading, loadTodos, page, setPage])

  return (
    <div className='flex flex-col'>
      <TodosStatusModal
        isShow={!!todoStatusQuery}
        select={(status) => {
          if (todoStatusQuery) updateStatus(todoStatusQuery, status, () => router.back())
        }}
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
        todo={todos?.find(({ id }) => id === timeQuery)}
        updateTime={(todo, values) => updateTime(todo, values)}
        close={router.back}
      />
      <TodosTagModal
        isShow={!!todoTagQuery}
        close={router.back}
        select={(tag) => {
          if (todoTagQuery) changeTag(todoTagQuery, tag, () => router.back())
        }}
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
            onClick={() => createTodo().then((todo) => router.push(`/todos/${todo.id}`))}>
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
        <TodosCards />
        <If condition={!isTodosLoading && todos && (total ?? 0) > todos.length}>
          <Then>
            <div
              ref={nextLoaderEl}
              className='text-center | py-[6px]'>
              <UISpinner />
            </div>
          </Then>
        </If>
      </div>
    </div>
  )
}
