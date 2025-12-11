'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { If, Then } from 'react-if'
import { todosDB } from '../lib/todos.db'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { TodoCard } from './TodosCard'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  close: () => void
}

export function TodosChildren({ isShow, close }: Props) {
  const router = useRouter()
  const addChildren = useTodosPageStore((s) => s.addChildren)
  const childrenRoot = useTodosPageStore((s) => s.childrenRoot)
  const setChildrenRoot = useTodosPageStore((s) => s.setChildrenRoot)
  const children = useTodosPageStore((s) => s.children)
  const setChildren = useTodosPageStore((s) => s.setChildren)
  const searchParams = useSearchParams()
  const rootQuery = searchParams.get('children')

  const loadTodo = useCallback(async (): Promise<void> => {
    if (!rootQuery) return

    todosDB.getTodo(rootQuery).then(setChildrenRoot)
    todosDB.getDescendantsFlat(rootQuery).then(setChildren)
  }, [rootQuery, setChildren, setChildrenRoot])

  useEffect(() => {
    if (isShow) loadTodo()
    else
      etcUtil.sleep(300).then(() => {
        setChildrenRoot(undefined)
        setChildren(undefined)
      })
  }, [isShow, loadTodo, setChildren, setChildrenRoot])

  return (
    <UIBottomSheet
      header={() => <span>하위 일 목록</span>}
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <div className='flex flex-col gap-[12px] | pt-[12px]'>
          <If condition={childrenRoot != null}>
            <Then>
              <TodoCard
                todo={childrenRoot!}
                hideChildren
              />
              {children?.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  hideChildren
                />
              ))}
            </Then>
          </If>

          <button
            className='rounded-md bg-indigo-500 py-[12px]'
            onClick={() => {
              const target = children?.at(-1) || childrenRoot
              if (target) addChildren(target).then(({ id }) => router.push(`/todos/${id}`))
            }}>
            <p className='text-white text-[15px] font-[700]'>하위 일 추가하기</p>
          </button>
        </div>
      )}
    />
  )
}
