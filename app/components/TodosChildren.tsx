'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { If, Then } from 'react-if'
import { todosDB } from '../lib/todos.db'
import { Todo } from '../models/Todo'
import etcUtil from '../utils/etc.util'
import { TodoCard } from './TodosCard'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
  close: () => void
}

export function TodosChildren({ isShow, close }: Props) {
  const searchParams = useSearchParams()
  const rootQuery = searchParams.get('children')

  const [todo, setTodo] = useState<Todo | undefined>()
  const [children, setChildren] = useState<Todo[] | undefined>()

  const loadTodo = useCallback(async (): Promise<void> => {
    if (!rootQuery) return

    todosDB.getTodo(rootQuery).then(setTodo)
    todosDB.getDescendantsFlat(rootQuery).then(setChildren)
  }, [rootQuery])

  useEffect(() => {
    if (isShow) {
      loadTodo()
    } else {
      etcUtil.sleep(300).then(() => {
        setTodo(undefined)
        setChildren(undefined)
      })
    }
  }, [isShow, loadTodo])

  return (
    <UIBottomSheet
      header={() => <span>하위 일 목록</span>}
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <div className='flex flex-col gap-[12px] | py-[12px]'>
          <If condition={todo != null}>
            <Then>
              <TodoCard
                todo={todo!}
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
        </div>
      )}
    />
  )
}
