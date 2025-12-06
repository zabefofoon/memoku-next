import { TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useRef } from 'react'
import { useCookies } from 'react-cookie'
import { Else, If, Then } from 'react-if'
import { TodoWithChildren } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import UISpinner from './UISpinner'

interface Props {
  loadTodos: (page: number) => void
}

export default function TodosCards(props: Props) {
  const isTodosNextLoading = useTodosPageStore((state) => state.isTodosNextLoading)
  const isTodosLoading = useTodosPageStore((state) => state.isTodosLoading)
  const page = useTodosPageStore((state) => state.page)
  const setPage = useTodosPageStore((state) => state.setPage)
  const todos = useTodosPageStore((state) => state.todos)
  const total = useTodosPageStore((state) => state.total)

  const nextLoaderEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isLoadable = entry.isIntersecting && !isTodosNextLoading && !isTodosLoading
      if (isLoadable) setPage(page + 1, props.loadTodos)
    })
    if (nextLoaderEl.current) observer.observe(nextLoaderEl.current)

    return () => observer.disconnect()
  }, [isTodosLoading, isTodosNextLoading, page, props.loadTodos, setPage])

  return (
    <>
      <If condition={isTodosLoading}>
        <Then>
          {() => (
            <div className='sm:hidden | flex-1 h-full | py-[80px] px-[16px] | text-center'>
              <UISpinner />
            </div>
          )}
        </Then>
        <Else>
          <If condition={!todos?.length}>
            <Then>
              <div className='sm:hidden | flex-1 h-full | py-[80px] px-[16px] | text-center'>
                <p className='text-[13px] opacity-70'>데이터가 없습니다.</p>
              </div>
            </Then>
            <Else>
              <div className='flex flex-col gap-[12px] sm:hidden px-[16px]'>
                {todos?.map((todo) => (
                  <Fragment key={todo.id}>
                    <TodoCard todo={todo} />
                    <If condition={todo.isExpanded}>
                      <Then>
                        {todo.children?.map((child) => (
                          <div
                            key={child.id}
                            className='flex items-center gap-[4px]'>
                            <Icon
                              name='reply'
                              className='text-[16px]'
                            />
                            <TodoCard
                              todo={child}
                              parent={todo}
                            />
                          </div>
                        ))}
                      </Then>
                    </If>
                  </Fragment>
                ))}
                <If condition={!isTodosLoading && todos && (total ?? 0) > todos.length}>
                  <div
                    ref={nextLoaderEl}
                    className='text-center | py-[6px]'>
                    <UISpinner />
                  </div>
                </If>
              </div>
            </Else>
          </If>
        </Else>
      </If>
    </>
  )
}

function TodoCard(props: { todo: TodoWithChildren; parent?: TodoWithChildren }) {
  const [cookies] = useCookies()
  const searchParams = useSearchParams()

  const expandRow = useTodosPageStore((state) => state.expandRow)
  const getTagsById = useTagsStore((s) => s.getTagsById)

  const isFiltered =
    !!searchParams.get('tags') || !!searchParams.get('status') || !!searchParams.get('searchText')

  const isShowBadge = isFiltered || !props.todo.parentId

  let bgColor = 'shadow-slate-200'
  if (props.todo.status === 'done') bgColor = 'shadow-green-200'
  if (props.todo.status === 'inprogress') bgColor = 'shadow-indigo-200'
  if (props.todo.status === 'hold') bgColor = 'shadow-orange-200'

  let textColor = 'text-slate-500'
  if (props.todo.status === 'done') textColor = 'text-green-500'
  if (props.todo.status === 'inprogress') textColor = 'text-indigo-500'
  if (props.todo.status === 'hold') textColor = 'text-orange-600'

  let text = '생성됨'
  if (props.todo.status === 'done') text = '완료됨'
  if (props.todo.status === 'inprogress') text = '진행중'
  if (props.todo.status === 'hold') text = '중지됨'

  const tag = getTagsById(props.todo.tagId)

  return (
    <div
      className={etcUtil.classNames([
        'w-full overflow-hidden | flex flex-col gap-[12px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | py-[12px] px-[8px]',
        bgColor,
      ])}>
      <div className='flex items-center gap-[12px] items-start'>
        <If condition={isShowBadge}>
          <Then>
            <Link
              className='relative  | flex justify-center items-center | shrink-0 w-[36px] aspect-square | rounded-full | font-[600] text-[14px] | shadow-sm'
              href={{
                pathname: '/todos',
                query: {
                  ...Object.fromEntries(searchParams),
                  todoTag: props.todo.id,
                },
              }}
              style={{
                background:
                  cookies['x-theme'] === 'dark'
                    ? `${tag?.color ? (TAG_COLORS[tag.color]?.dark ?? '#000000') : '#000000'}`
                    : `${tag?.color ? `${TAG_COLORS[tag.color]?.white ?? '#000000'}24` : '#00000024'}`,
                color:
                  cookies['x-theme'] === 'dark'
                    ? 'white'
                    : tag?.color
                      ? (TAG_COLORS[tag?.color]?.white ?? '#000000')
                      : '#000000',
              }}>
              {tag?.label?.slice(0, 1) ?? 'M'}
            </Link>
          </Then>
        </If>

        <Link
          href={{ pathname: `/todos/${props.todo.id}` }}
          className='flex flex-col gap-[0px] | overflow-hidden | w-full'>
          <p className='text-[14px] truncate font-[600] text-gray-600'>
            {props.todo.description?.split(/\n/)[0]}
          </p>
          <p className='text-[13px] line-2 text-gray-400'>
            {props.todo.description?.replace(props.todo.description?.split(/\n/)[0], '')}
          </p>
        </Link>
        <div className='flex items-center gap-[6px]'>
          <If condition={props.todo.id}>
            <Then>
              <TodosDropdown
                hideDelete
                todo={props.todo}
                parent={props.parent}
                position={{ x: 'RIGHT' }}
              />
            </Then>
          </If>
        </div>
      </div>

      <div className='w-full | flex items-center gap-[4px]'>
        <div className='flex items-center gap-[12px]'>
          <p className='w-[36px] | text-[10px] text-center leading-none | text-gray-400'>상태</p>
          <p className={etcUtil.classNames(['text-[12px] leading-none font-[600]', textColor])}>
            {text}
          </p>
        </div>
        <div className='flex items-center gap-[6px] | ml-auto'>
          <TodosPeriodText todo={props.todo} />
          <If condition={!isFiltered && !props.todo.parentId && props.todo.childId}>
            <Then>
              <button
                type='button'
                onClick={() => expandRow(props.todo)}>
                <If condition={props.todo.isExpanded}>
                  <Then>
                    <Icon
                      name='chevron-up'
                      className='text-[20px]'
                    />
                  </Then>
                  <Else>
                    <Icon
                      name='chevron-down'
                      className='text-[20px]'
                    />
                  </Else>
                </If>
              </button>
            </Then>
          </If>
        </div>
      </div>
    </div>
  )
}
