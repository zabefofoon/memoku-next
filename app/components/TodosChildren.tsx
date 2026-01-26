'use client'

import { AGE_1_YEAR, COOKIE_CHILDREN_STATUS, FILTER_STATUS, STATUS_COLORS } from '@/const'
import { produce } from 'immer'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { If, Then } from 'react-if'
import { todosDB } from '../lib/todos.db'
import { Todo } from '../models/Todo'
import { useThemeStore } from '../stores/theme.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import { TodoCard } from './TodosCard'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  close: () => void
}

export function TodosChildren({ isShow, close }: Props) {
  const [cookies, setCookie] = useCookies()
  const t = useTranslations()
  const router = useRouter()
  const addChildren = useTodosPageStore((s) => s.addChildren)
  const childrenRoot = useTodosPageStore((s) => s.childrenRoot)
  const setChildrenRoot = useTodosPageStore((s) => s.setChildrenRoot)
  const children = useTodosPageStore((s) => s.children)
  const setChildren = useTodosPageStore((s) => s.setChildren)
  const searchParams = useSearchParams()
  const screenSize = useThemeStore((s) => s.screenSize)

  const rootQuery = searchParams.get('children')

  const [selectedStatus, setSelectedStatus] = useState<Todo['status'][]>(
    cookies[COOKIE_CHILDREN_STATUS] ?? []
  )

  const childrenTodos =
    children?.filter(({ status }) => {
      if (selectedStatus.length) return selectedStatus.includes(status)
      else return true
    }) ?? []

  const loadTodo = useCallback(async (): Promise<void> => {
    if (!rootQuery) return

    todosDB.getTodo(rootQuery).then(setChildrenRoot)
    todosDB.getDescendantsFlat(rootQuery).then(setChildren)
  }, [rootQuery, setChildren, setChildrenRoot])

  const toggleStatus = (status: Todo['status']): void => {
    setSelectedStatus((prev) =>
      produce(prev, (draft) => {
        if (!draft.includes(status)) draft.push(status)
        else {
          const findIndex = draft.findIndex((item) => item === status)
          draft.splice(findIndex, 1)
        }
      })
    )
  }

  useEffect(() => {
    setCookie(COOKIE_CHILDREN_STATUS, selectedStatus, {
      maxAge: AGE_1_YEAR,
      path: '/',
      sameSite: 'lax',
    })
  }, [selectedStatus, setCookie])

  useEffect(() => {
    if (isShow) {
      loadTodo()
    } else
      etcUtil.sleep(300).then(() => {
        setChildrenRoot(undefined)
        setChildren(undefined)
      })
  }, [isShow, loadTodo, setChildren, setChildrenRoot])

  return (
    <UIBottomSheet
      containerClass='sm:max-w-[50dvw]'
      header={() => <span>{t('Todo.ChildrenList')}</span>}
      filters={() => (
        <div className='overflow-auto scroll-hidden | p-[6px] | flex gap-[6px] | text-[12px] font-[600]'>
          {FILTER_STATUS.map((status) => (
            <div
              key={status.value}
              className='relative'>
              <button
                className='rounded-full | bg-white | shadow-md'
                onClick={() => toggleStatus(status.value)}>
                <span
                  className='px-[8px] | h-[28px] aspect-square | flex items-center justify-center gap-[4px] | rounded-full | whitespace-nowrap'
                  style={{
                    background:
                      cookies['x-theme'] === 'dark'
                        ? STATUS_COLORS[status.value]?.dark
                        : `${STATUS_COLORS[status.value].white}24`,
                    color:
                      cookies['x-theme'] === 'dark'
                        ? 'white'
                        : `${STATUS_COLORS[status.value].white}`,
                  }}>
                  <Icon
                    name={status.icon}
                    className='text-[14px] tracking-tight'
                  />
                  {t(`General.${status.value}`)}
                </span>
              </button>
              <If condition={selectedStatus.includes(status.value)}>
                <Then>
                  <div className='pointer-events-none absolute inset-0 | flex items-center justify-center | bg-gray-800/20 rounded-full'>
                    <Icon
                      name='check'
                      className='text-white'
                    />
                  </div>
                </Then>
              </If>
            </div>
          ))}
        </div>
      )}
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <div className='flex flex-col gap-[6px] sm:gap-[0] | pt-[12px]'>
          <If condition={childrenRoot != null}>
            <Then>
              <TodoCard
                display={screenSize === 'desktop' ? 'row' : 'grid'}
                todo={childrenRoot!}
                hideChildren
              />
              {childrenTodos?.map((todo) => (
                <TodoCard
                  display={screenSize === 'desktop' ? 'row' : 'grid'}
                  key={todo.id}
                  todo={todo}
                  hideChildren
                />
              ))}
            </Then>
          </If>
        </div>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px] mx-auto | w-full max-w-[320px]'
          onClick={() => {
            const target = children?.at(-1) || childrenRoot
            if (target) addChildren(target).then(({ id }) => router.push(`/app/todos/${id}`))
          }}>
          <p className='text-white text-[15px] font-[700]'>{t('Todo.AddChildren')}</p>
        </button>
      )}
    />
  )
}
