import { STATUS_MAP, TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Else, If, Then } from 'react-if'
import { TodoWithChildren } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import { Icon } from './Icon'
import TodoTimeText from './TodoTimeText'
import UIDropdown from './UIDropdown'

export function TodoCard({
  todo,
  hideChildren,
}: {
  todo: TodoWithChildren
  hideChildren?: boolean
}) {
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const router = useRouter()
  const searchParams = useSearchParams()
  const createTodo = useTodosPageStore((s) => s.createTodo)

  const [isOpen, setOpen] = useState(false)

  const tag = getTagsById(todo.tagId)

  return (
    <Link
      className='emboss-sheet !p-[16px] !sm:p-[20px] block'
      href={`/todos/${todo.id}`}
      onClick={(event) => {
        if (todo.childId && !hideChildren) {
          event.preventDefault()
          const urlParams = new URLSearchParams(searchParams.toString())
          router.push(`?${decodeURIComponent(urlParams.toString())}&children=${todo.id}`, {
            scroll: false,
          })
        }
      }}>
      {/* 태그 */}
      <button
        type='button'
        className='expand-hitbox | flex items-center gap-[4px]'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()

          const urlParams = new URLSearchParams(searchParams.toString())
          router.push(`?${decodeURIComponent(urlParams.toString())}&todoTag=${todo.id}`, {
            scroll: false,
          })
        }}>
        <Icon
          name='tag-active'
          className='text-[11px] translate-y-[1px]'
          style={{
            color: tag
              ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-500)'
              : 'var(--color-slate-500)',
          }}
        />

        <p className='text-[11px] text-gray-600 leading-[100%]'>{tag?.label ?? 'MEMO'}</p>
      </button>
      {/* 태그 */}

      {/* 제목, 상태 */}
      <div className='mt-[6px] | flex items-center gap-[6px] justify-between'>
        {/* 제목 */}
        <p className='truncate | text-[15px] font-[600] leading-[130%]'>
          {todo.description?.slice(0, 40)?.split(/\n/)[0]}
        </p>
        {/* 제목 */}

        {/* 상태 */}
        <button
          type='button'
          className='neu-button !gap-[2px] | shrink-0'
          style={{
            color: STATUS_MAP[todo.status ?? 'created']?.color,
          }}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            const urlParams = new URLSearchParams(searchParams.toString())
            router.push(`?${decodeURIComponent(urlParams.toString())}&todoStatus=${todo.id}`, {
              scroll: false,
            })
          }}>
          <Icon name={STATUS_MAP[todo.status ?? 'created']?.icon} />
          <p>{STATUS_MAP[todo.status ?? 'created']?.label}</p>
        </button>
        {/* 상태 */}
      </div>
      {/* 제목, 상태 */}

      <TodoTimeText
        todo={todo}
        timeFormat='YY/MM/DD'
      />

      <If condition={!hideChildren}>
        <Then>
          <div className='flex items-center | mt-[6px]'>
            {/* 하위 일 더 보기 */}
            <If condition={todo.childId}>
              <Then>
                <button
                  type='button'
                  className='flex items-center | mt-[6px]'
                  onClick={(event) => {
                    event.preventDefault()
                    const urlParams = new URLSearchParams(searchParams.toString())
                    router.push(
                      `?${decodeURIComponent(urlParams.toString())}&children=${todo.id}`,
                      {
                        scroll: false,
                      }
                    )
                  }}>
                  <Icon
                    name='chevron-down'
                    className='text-[16px]'
                  />
                  <p className='text-[11px]'>하위 일 더 보기</p>
                </button>
              </Then>
              <Else>
                <button
                  className='flex items-center | text-gray-400'
                  onClick={() => createTodo(todo.id).then(({ id }) => router.push(`/todos/${id}`))}>
                  <Icon
                    name='plus'
                    className='text-[16px]'
                  />
                  <p className='text-[11px]'>하위 일 추가</p>
                </button>
              </Else>
            </If>
            {/* 하위 일 더 보기 */}
            <UIDropdown
              className='ml-auto'
              isOpen={isOpen}
              position={{ x: 'RIGHT' }}
              fitOptionsParent={false}
              onOpenChange={setOpen}
              renderButton={({ toggle }) => (
                <button
                  className='neu-button !p-[2px]'
                  type='button'
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    toggle()
                  }}>
                  <Icon
                    name='overflow'
                    className='expand-hitbox | text-[14px]'
                  />
                </button>
              )}
              renderOptions={({ toggle }) => (
                <div className='py-[3px] | flex flex-col'>
                  <button
                    type='button'
                    className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-50 hover:dark:bg-zinc-600'
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()

                      toggle(false, () => {
                        const urlParams = new URLSearchParams(searchParams.toString())
                        router.push(
                          `?${decodeURIComponent(urlParams.toString())}&todoStatus=${todo.id}`,
                          {
                            scroll: false,
                          }
                        )
                      })
                    }}>
                    <Icon
                      name='run'
                      className='text-[16px]'
                    />
                    <p className='text-[13px]'>상태변경</p>
                  </button>
                  <button
                    type='button'
                    className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-50 hover:dark:bg-zinc-600'
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()

                      toggle(false, () => {
                        const urlParams = new URLSearchParams(searchParams.toString())
                        router.push(
                          `?${decodeURIComponent(urlParams.toString())}&todoTag=${todo.id}`,
                          {
                            scroll: false,
                          }
                        )
                      })
                    }}>
                    <Icon
                      name='tag'
                      className='text-[16px]'
                    />
                    <p className='text-[13px]'>태그변경</p>
                  </button>
                  <button
                    type='button'
                    className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-50 hover:dark:bg-zinc-600'
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()

                      toggle(false, () => {
                        const urlParams = new URLSearchParams(searchParams.toString())
                        router.push(
                          `?${decodeURIComponent(urlParams.toString())}&time=${todo.id}`,
                          {
                            scroll: false,
                          }
                        )
                      })
                    }}>
                    <Icon
                      name='alarm'
                      className='text-[16px]'
                    />
                    <p className='text-[13px]'>일정설정</p>
                  </button>
                  <button
                    type='button'
                    className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-50 hover:dark:bg-zinc-600'
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()

                      toggle(false, () => router.push(`/todos/${todo.id}`, { scroll: false }))
                    }}>
                    <Icon
                      name='edit'
                      className='text-[16px]'
                    />
                    <p className='text-[13px]'>내용수정</p>
                  </button>
                </div>
              )}
            />
          </div>
        </Then>
      </If>
    </Link>
  )
}
