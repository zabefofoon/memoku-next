import { Link } from '@/app/components/Link'
import { STATUS_MAP, TAG_COLORS } from '@/const'
import { useRouter, useSearchParams } from 'next/navigation'
import { MouseEvent, useState } from 'react'
import { Else, If, Then } from 'react-if'
import { TodoWithChildren } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useThemeStore } from '../stores/theme.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import TodoTimeText from './TodoTimeText'
import UIDropdown from './UIDropdown'

export function TodoCard({
  todo,
  hideChildren,
  display = 'grid',
}: {
  className?: string
  display: 'row' | 'grid'
  todo: TodoWithChildren
  hideChildren?: boolean
}) {
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const router = useRouter()
  const searchParams = useSearchParams()
  const addChildren = useTodosPageStore((s) => s.addChildren)
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const [isOpen, setOpen] = useState(false)

  const tag = getTagsById(todo.tagId)

  let bgColor
  switch (todo.status) {
    case 'created':
      bgColor = ''
      break
    case 'inprogress':
      bgColor = 'bg-indigo-500/5'
      break
    case 'hold':
      bgColor = 'bg-orange-600/5'
      break
    case 'done':
      bgColor = 'bg-green-300/5'
      break
  }

  return (
    <Link
      className={etcUtil.classNames([
        `emboss-sheet | w-full | ${bgColor}`,
        { 'flex items-center | px-[24px] py-[8px]': display !== 'grid' },
        { 'flex flex-col p-[16px]': display === 'grid' },
      ])}
      data-prevent={todo.childId && !hideChildren}
      href={`/app/todos/${todo.id}`}
      saveScrollTargets={['bottomsheet-scroll-el']}
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
        className={etcUtil.classNames([
          'expand-hitbox | flex items-center gap-[4px]',
          display !== 'grid' ? 'w-[100px] shrink-0' : 'w-fit',
        ])}
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

        <p className='w-full | tracking-tight text-left text-[11px] text-gray-600 dark:text-zinc-400 leading-[100%]'>
          {tag?.label ?? 'MEMO'}
        </p>
      </button>
      {/* 태그 */}
      {/* 제목, 상태 */}
      <div
        className={etcUtil.classNames([
          'flex items-center gap-[6px] justify-between overflow-hidden',
          display !== 'grid' ? 'ml-[12px] w-full' : 'mt-[6px]',
        ])}>
        {/* 제목 */}
        <div
          className={etcUtil.classNames([
            'flex items-center gap-[4px] | w-full truncate',
            { 'order-1': display === 'row' },
          ])}>
          <If condition={todo.images?.length}>
            <Then>
              <Icon
                name='image'
                className='opacity-60 text-[16px]'
              />
            </Then>
          </If>
          <p
            className={etcUtil.classNames([
              'w-full truncate | text-[14px] font-[600] leading-[130%]',
              { 'order-1': display !== 'grid' },
            ])}>
            {todo.description?.slice(0, 40)?.split(/\n/)[0]}
          </p>
        </div>
        {/* 제목 */}

        {/* 상태 */}
        <div
          className={etcUtil.classNames([
            'm-[2px]',
            display !== 'grid' ? 'w-[120px] shrink-0 | flex' : 'shrink-0',
          ])}>
          <button
            type='button'
            className={etcUtil.classNames([
              'shrink-0',
              {
                'neu-button !gap-[2px]': display !== 'row',
                'flex items-center text-[12px] gap-[4px]': display === 'row',
              },
            ])}
            style={{
              color: isDarkMode
                ? STATUS_MAP[todo.status ?? 'created']?.darkColor
                : STATUS_MAP[todo.status ?? 'created']?.color,
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
        </div>
        {/* 상태 */}
      </div>
      <If condition={display === 'grid'}>
        <Then>
          <p className='min-h-[16px] sm:h-[40px] | line-2 text-[12px] text-gray-400 leading-[160%] | mt-[4px]'>
            {todo.description?.replace(todo.description?.slice(0, 40)?.split(/\n/)[0], '')}
          </p>
        </Then>
      </If>
      {/* 제목, 상태 */}
      <div
        className={etcUtil.classNames([
          display !== 'grid'
            ? `w-[240px] shrink-0 | flex  ${hideChildren ? 'justify-end' : 'justify-center'}`
            : 'mt-[6px]',
        ])}>
        <TodoTimeText
          todo={todo}
          timeFormat='YY/MM/DD'
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()

            const urlParams = new URLSearchParams(searchParams.toString())
            urlParams.append('time', todo.id)
            router.push(`?${decodeURIComponent(urlParams.toString())}`, {
              scroll: false,
            })
          }}
        />
      </div>
      <If condition={!hideChildren}>
        <Then>
          <div
            className={etcUtil.classNames([
              'flex items-center',
              display !== 'grid' ? '' : 'mt-[auto] pt-[6px]',
            ])}>
            {/* 하위 일 더 보기 */}
            <div className={etcUtil.classNames([display !== 'grid' ? 'w-[120px] shrink-0' : ''])}>
              <If condition={todo.childId}>
                <Then>
                  <button
                    type='button'
                    className={etcUtil.classNames([
                      'flex items-center',
                      { 'mt-[6px]': display === 'grid' },
                    ])}
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
                    className='flex items-center | text-gray-400 dark:text-zinc-400'
                    onClick={() =>
                      addChildren(todo).then(({ id }) => router.push(`/app/todos/${id}`))
                    }>
                    <Icon
                      name='plus'
                      className='text-[16px]'
                    />
                    <p className='text-[11px]'>하위 일 추가</p>
                  </button>
                </Else>
              </If>
            </div>

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
                        urlParams.append('time', todo.id)
                        router.push(`?${decodeURIComponent(urlParams.toString())}`, {
                          scroll: false,
                        })
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

                      toggle(false, () => router.push(`/app/todos/${todo.id}`, { scroll: false }))
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
