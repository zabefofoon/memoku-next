'use client'

import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { If, Then } from 'react-if'
import { todosDB } from '../lib/todos.db'
import { Todo } from '../models/Todo'
import { useThemeStore } from '../stores/theme.store'
import { TodoCard } from './TodosCard'
import UIBottomSheet from './UIBottomSheet'

interface Props {
  isShow?: boolean
}

export function CalendarTodos({ isShow = false }: Props) {
  const router = useRouter()
  const screenSize = useThemeStore((s) => s.screenSize)
  const searchParams = useSearchParams()

  const [todos, setTodos] = useState<Todo[]>()
  const loadTodos = useCallback(() => {
    todosDB
      .getTodosDateRange(
        dayjs(+searchParams.get('start')!).toDate(),
        dayjs(+searchParams.get('end')!).toDate()
      )
      .then(setTodos)
  }, [searchParams])

  useEffect(() => {
    if (isShow) loadTodos()
  }, [isShow, loadTodos])

  return (
    <UIBottomSheet
      containerClass='sm:max-w-[50dvw]'
      header={() => <span>하위 일 목록</span>}
      open={isShow}
      close={() => router.back()}
      content={() => (
        <div className='flex flex-col gap-[6px] sm:gap-[0] | pt-[12px]'>
          <If condition={todos != null}>
            <Then>
              {todos?.map((todo) => (
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
    />
  )
}
