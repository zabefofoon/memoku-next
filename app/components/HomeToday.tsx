'use client'

import { STATUS_MAP, TAG_COLORS } from '@/const'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Else, If, Then } from 'react-if'
import { todosDB } from '../lib/todos.db'
import { Todo } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import { Icon } from './Icon'
import { Link } from './Link'
import TodoTimeText from './TodoTimeText'
import UISpinner from './UISpinner'

export default function HomeTody() {
  const router = useRouter()
  const [todos, setTodos] = useState<{ total: number; todos: Todo[] }>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const createTodo = useTodosPageStore((state) => state.createTodo)

  const todo = todos?.todos[0]
  const tag = getTagsById(todo?.tagId)

  const loadTodos = async () => {
    setIsLoading(true)
    const res = await todosDB.getTodayTodos({ page: 0 })
    setTodos(res)
    setIsLoading(false)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div className='emboss-sheet | p-[16px] text-[14px] sm:text-[14px]'>
      <If condition={isLoading}>
        <Then>
          <div className='flex justify-center py-[26px]'>
            <UISpinner />
          </div>
        </Then>
        <Else>
          <h3 className='rounded-full | font-[700]'>오늘 할 일</h3>
          <div className='mt-[6px] | flex flex-col gap-[4px]'>
            <If condition={!todos?.total}>
              <Then>
                <p className='text-gray-600 dark:text-zinc-400'>오늘 할 일을 추가해보세요.</p>
                <button
                  type='button'
                  className='text-gray-600 dark:text-zinc-400 text-[14px] | flex items-center | underline | w-fit | mt-[2px]'
                  onClick={() => createTodo().then((todo) => router.push(`/todos/${todo.id}`))}>
                  추가하기
                  <Icon name='chevron-right' />
                </button>
              </Then>
              <Else>
                <Link href={`/todos/${todo?.id}`}>
                  <div className='flex items-center gap-[16px] | text-gray-600 dark:text-zinc-500'>
                    <p className=''>{todo?.description?.slice(0, 40)?.split(/\n/)[0]}</p>
                  </div>
                  <div className='flex items-center gap-[8px] | mt-[12px] dark:text-zinc-300'>
                    <p className='flex items-center gap-[4px] | text-[12px] leading-[100%]'>
                      <Icon
                        name='tag-active'
                        style={{
                          color: tag
                            ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-500)'
                            : 'var(--color-slate-500)',
                        }}
                      />
                      <span>{tag?.label ?? 'MEMO'}</span>
                    </p>

                    <p className='text-[12px] | flex items-center gap-[2px] leading-[100%]'>
                      <Icon
                        name={STATUS_MAP[todo?.status ?? 'created'].icon}
                        style={{
                          color: STATUS_MAP[todo?.status ?? 'created'].color,
                        }}
                      />
                      {STATUS_MAP[todo?.status ?? 'created'].label}
                    </p>

                    {todo && (
                      <TodoTimeText
                        todo={todo}
                        timeFormat='YY/MM/DD'
                        hideTime
                      />
                    )}
                  </div>
                </Link>
              </Else>
            </If>
          </div>
        </Else>
      </If>
    </div>
  )
}
