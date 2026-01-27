'use client'

import { DarkModeButton } from '@/app/components/DarkModeButton'
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
import { AGE_1_YEAR, COOKIE_DISPLAY } from '@/const'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Else, If, Then } from 'react-if'
import { useTutorialStore } from '../stores/tutorial.store'
import etcUtil from '../utils/etc.util'
import UITooltip from './UITooltip'

export function TodosClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cookieDisplay, setCookie] = useCookies([COOKIE_DISPLAY])
  const t = useTranslations()

  const screenSize = useThemeStore((state) => state.screenSize)
  const todos = useTodosPageStore((state) => state.todos)
  const todayTodos = useTodosPageStore((state) => state.todayTodos)
  const thisWeekTodos = useTodosPageStore((state) => state.thisWeekTodos)
  const nextWeekTodos = useTodosPageStore((state) => state.nextWeekTodos)

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
  const saveTodosQuries = useThemeStore((state) => state.saveTodosQuries)
  const [isShow, setIsShow] = useState(true)
  const tutorialStep = useTutorialStore((s) => s.tutorialStep)

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
    const { prevPathname, setPrevPathname } = useScrollStore.getState()
    const shouldRestore = /\/app\/todos\/[^/]+$/.test(prevPathname)

    if (!shouldRestore) setPage(0, loadTodos)
    else {
      const { todos, todayTodos, thisWeekTodos, nextWeekTodos } = useTodosPageStore.getState()
      if (!todos || !todayTodos || !thisWeekTodos || !nextWeekTodos) setPage(0, loadTodos)
      else setPrevPathname(location.pathname)
    }
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

  useEffect(() => {
    saveTodosQuries(`?sort=${sortQuery ?? ''}&status=${statusQuery ?? ''}&tags=${tagsQuery ?? ''}`)
  }, [saveTodosQuries, sortQuery, statusQuery, tagsQuery])

  return (
    <div className='h-full | flex flex-col'>
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
        todo={[
          ...(todos ?? []),
          ...(todayTodos ?? []),
          ...(thisWeekTodos ?? []),
          ...(nextWeekTodos ?? []),
        ]?.find(({ id }) => id === timeQuery)}
        updateTime={updateTime}
        close={router.back}
      />
      <TodosTagModal
        isShow={!!todoTagQuery}
        close={router.back}
        select={(tag) => {
          if (todoTagQuery) changeTag(todoTagQuery, tag, () => router.back())
        }}
      />
      <div className='flex justify-between items-start | px-[16px] sm:px-0 mt-[16px] sm:mt-0'>
        <div>
          <h1 className='text-[20px] opacity-80'>{t('Todo.PageTitle')}</h1>
          <p className='text-[16px] opacity-50'>{t('Todo.PageDesc')}</p>
        </div>
        <div>
          <DarkModeButton />
        </div>
      </div>
      <div
        className={etcUtil.classNames([
          'w-full h-full | flex flex-col | sm:overflow-hidden',
          { 'sm:overflow-visible': [5, 6].includes(tutorialStep ?? -1) },
        ])}>
        <div
          className='sticky top-0 left-0 z-[50] | pt-[16px] pb-[6px] | bg-gray-100/50 dark:bg-transparent | transition-transform'
          style={{
            backdropFilter: 'blur(4px)',
            transform: isShow ? 'translate(0, 0)' : 'translate(0, -100%)',
          }}>
          <div className='flex items-center gap-[6px] | px-[16px] sm:p-0 mb-[8px] sm:mb-[20px]'>
            <TodosSearch />
            <button
              type='button'
              className='hidden sm:block'
              onClick={() =>
                setCookie(
                  COOKIE_DISPLAY,
                  cookieDisplay[COOKIE_DISPLAY] === 'grid' ? 'row' : 'grid',
                  { maxAge: AGE_1_YEAR, path: '/' }
                )
              }>
              <If condition={cookieDisplay[COOKIE_DISPLAY] === 'grid'}>
                <Then>
                  <Icon
                    name='grid'
                    className='text-[20px]'
                  />
                </Then>
                <Else>
                  <Icon
                    name='row'
                    className='text-[20px]'
                  />
                </Else>
              </If>
            </button>
            <button
              className='shrink-0 flex items-center gap-[12px] ml-auto sm:ml-0'
              onClick={() => {
                const urlParams = new URLSearchParams(location.search)
                urlParams.append('filter', 'true')
                router.push(`?${decodeURIComponent(urlParams.toString())}`, {
                  scroll: false,
                })
              }}>
              <Icon
                name='filter'
                className='text-[20px]'
              />
              <Icon
                name='chevron-down'
                className='ml-[-16px] | text-[16px]'
              />
            </button>
            <button
              type='button'
              className='ml-auto | hidden sm:flex items-center | bg-indigo-500 dark:bg-indigo-600 rounded-lg | px-[8px] py-[6px] | text-white'
              onClick={() => createTodo().then((todo) => router.push(`/app/todos/${todo.id}`))}>
              <Icon
                name='plus'
                className='text-[20px]'
              />
              <p className='text-[14px]'>{t('Todo.AddTodo')}</p>
            </button>
          </div>
          <TodosSelectedFilters />
        </div>
        <div
          className={etcUtil.classNames([
            'overflow-auto | flex-1 flex flex-col gap-[32px] mb-[88px] sm:mb-0',
            { 'overflow-visible': [5, 6].includes(tutorialStep ?? -1) },
          ])}>
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
      <If condition={tutorialStep === 5}>
        <Then>
          <UITooltip
            direction='BOTTOM_LEFT'
            className='absolute translate-y-[-32px] z-[51]'
            style={{
              positionAnchor: '--todo-card',
              top: 'anchor(--todo-card top)',
              left: 'anchor(--todo-card left)',
            }}>
            <p className='whitespace-nowrap text-[13px] tracking-tight'>{t('Tutorial.Step5')}</p>
          </UITooltip>
        </Then>
      </If>
    </div>
  )
}
