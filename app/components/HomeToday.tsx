'use client'

import { Link } from '@/app/components/Link'
import { STATUS_MAP, TAG_COLORS } from '@/const'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Else, If, Then } from 'react-if'
import { todosDB } from '../lib/todos.db'
import { Todo } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import { Icon } from './Icon'

import { useTranslations } from 'next-intl'
import { useTutorialStore } from '../stores/tutorial.store'
import etcUtil from '../utils/etc.util'
import TodoTimeText from './TodoTimeText'
import UISpinner from './UISpinner'
import UITooltip from './UITooltip'

export default function HomeTody() {
  const router = useRouter()
  const tutorialStep = useTutorialStore((s) => s.tutorialStep)
  const setTutorialStep = useTutorialStore((s) => s.setTutorialStep)

  const [todos, setTodos] = useState<{ total: number; todos: Todo[] }>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const t = useTranslations()

  const todo = todos?.todos[0]
  const tag = getTagsById(todo?.tagId)

  const loadTodos = async () => {
    setIsLoading(true)
    const res = await todosDB.getTodayTodos({ page: 0 })
    setTodos(res)
    setIsLoading(false)
  }

  const createTodo = async (): Promise<void> => {
    if (tutorialStep === 0) setTutorialStep(1)

    const todo = await useTodosPageStore.getState().createTodo()
    router.push(`/app/todos/${todo.id}`)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div
      className={etcUtil.classNames([
        { 'tutorial-dim relative z-[100] rounded-lg': tutorialStep === 0 },
      ])}
      role='presentation'
      onClick={tutorialStep === 0 ? createTodo : undefined}>
      <div className='emboss-sheet | p-[16px] text-[14px] sm:text-[14px]'>
        <If condition={isLoading}>
          <Then>
            <div className='flex justify-center py-[26px]'>
              <UISpinner />
            </div>
          </Then>
          <Else>
            <h3 className='rounded-full | font-[700]'>{t('Home.TodayTodoLabel')}</h3>
            <div className='mt-[6px] | flex flex-col gap-[4px]'>
              <If condition={!todos?.total}>
                <Then>
                  <p className='text-gray-600 dark:text-zinc-400'>{t('Home.TodayTodoEmpty')}</p>
                  <button
                    id='home-add-button'
                    type='button'
                    className='text-gray-600 dark:text-zinc-400 text-[14px] | flex items-center | underline | w-fit | mt-[2px]'
                    style={{
                      anchorName: '--home-add-button',
                    }}
                    onClick={createTodo}>
                    {t('Home.TodayTodoAdd')}
                    <Icon name='chevron-right' />
                  </button>
                </Then>
                <Else>
                  <Link href={`/app/todos/${todo?.id}`}>
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
                        {t(`General.${todo?.status ?? 'created'}`)}
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
      <If condition={tutorialStep === 0}>
        <Then>
          <UITooltip
            direction='TOP_LEFT'
            className='absolute bottom-0 left-0 translate-y-[16px] z-[30]'
            style={{
              positionAnchor: '--home-add-button',
              top: 'anchor(--home-add-button bottom)',
              left: 'anchor(--home-add-button left)',
              marginTop: '-8px',
            }}>
            <p className='whitespace-nowrap text-[13px] tracking-tight'>{t('Tutorial.Step1')}</p>
          </UITooltip>
        </Then>
      </If>
    </div>
  )
}
