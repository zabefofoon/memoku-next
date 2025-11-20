import { TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Dispatch, Fragment, SetStateAction, useEffect, useRef } from 'react'
import { useCookies } from 'react-cookie'
import { TodoWithChildren } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useTodosStore } from '../stores/todos.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import UISpinner from './UISpinner'

export interface Props {
  total?: number
  todos?: TodoWithChildren[]
  setTodos: Dispatch<SetStateAction<TodoWithChildren[] | undefined>>
  isLoading: boolean
  updateStatus: (
    todo: TodoWithChildren,
    status: TodoWithChildren['status'],
    parentId?: string
  ) => void
  setPage: Dispatch<SetStateAction<number>>
  isTodosNextLoading: boolean
}

export default function TodosCards(props: Props) {
  const todosStore = useTodosStore()
  const nextLoaderEl = useRef<HTMLDivElement>(null)

  const expandRow = async (todo: TodoWithChildren): Promise<void> => {
    let children = todo.children
    if (!todo.isExpanded && todo.childId && !todo.children) {
      children = await todosStore.getDescendantsFlat(todo.id)
    }

    props.setTodos((prev) =>
      prev?.map((item) =>
        item.id === todo.id ? { ...item, isExpanded: !todo.isExpanded, children } : item
      )
    )
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !props.isTodosNextLoading && !props.isLoading) {
        props.setPage((prev) => prev + 1)
      }
    })
    if (nextLoaderEl.current) observer.observe(nextLoaderEl.current)

    return () => observer.disconnect()
  }, [props.isTodosNextLoading, props.isLoading, props.setPage])

  return (
    <>
      {(props.isLoading || !props.todos?.length) && (
        <div className='sm:hidden | flex-1 h-full | py-[80px] px-[16px] | text-center'>
          {props.isLoading && <UISpinner />}
          {!props.isLoading && !props.todos?.length && (
            <p className='text-[13px] opacity-70'>데이터가 없습니다.</p>
          )}
        </div>
      )}
      {!props.isLoading && !!props.todos?.length && (
        <div className='flex flex-col gap-[12px] sm:hidden px-[16px]'>
          {props.todos?.map((todo) => (
            <Fragment key={todo.id}>
              <TodoCard
                todo={todo}
                expandRow={expandRow}
                updateStatus={(status, todo) => props.updateStatus(todo, status)}
              />
              {todo.isExpanded &&
                todo.children?.map((child) => (
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
                      updateStatus={(status, todo) => props.updateStatus(todo, status, todo.id)}
                    />
                  </div>
                ))}
            </Fragment>
          ))}

          {!props.isLoading && props.todos && (props.total ?? 0) > props.todos.length && (
            <div
              ref={nextLoaderEl}
              className='text-center | py-[6px]'>
              <UISpinner />
            </div>
          )}
        </div>
      )}
    </>
  )
}

function TodoCard(props: {
  todo: TodoWithChildren
  parent?: TodoWithChildren
  expandRow?: (todo: TodoWithChildren) => Promise<void>
  updateStatus?: (status: TodoWithChildren['status'], todo: TodoWithChildren) => void
}) {
  const [cookies] = useCookies()

  const searchParams = useSearchParams()
  const tagsStore = useTagsStore()

  const isFiltered =
    !!searchParams.get('tags') || !!searchParams.get('status') || !!searchParams.get('searchText')

  const isShowBadge = isFiltered ? true : !props.todo.parentId

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

  const tag = tagsStore.getTagsById(props.todo.tagId)

  return (
    <div
      className={etcUtil.classNames([
        'w-full overflow-hidden | flex flex-col gap-[12px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | py-[12px] px-[8px]',
        bgColor,
      ])}>
      <div className='flex items-center gap-[12px] items-start'>
        {isShowBadge && (
          <Link
            className='relative  | flex justify-center items-center | shrink-0 w-[36px] aspect-square | rounded-full | font-[600] text-[14px] | shadow-sm'
            href={`/todos/?todoTag=${props.todo.id}`}
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
        )}
        <Link
          href={`/todos/${props.todo.id}`}
          className='flex flex-col gap-[0px] | overflow-hidden | w-full'>
          <p className='text-[14px] truncate font-[600] text-gray-600'>
            {props.todo.description?.split(/\n/)[0]}
          </p>
          <p className='text-[13px] line-2 text-gray-400'>
            {props.todo.description?.replace(props.todo.description?.split(/\n/)[0], '')}
          </p>
        </Link>
        <div className='flex items-center gap-[6px]'>
          {props.todo.id && (
            <TodosDropdown
              hideDelete
              todo={props.todo}
              parent={props.parent}
              position={{ x: 'RIGHT' }}
            />
          )}
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
          {!isFiltered && !props.todo.parentId && props.todo.childId && (
            <button
              type='button'
              onClick={() => props.expandRow?.(props.todo)}>
              {props.todo.isExpanded ? (
                <Icon
                  name='chevron-up'
                  className='text-[20px]'
                />
              ) : (
                <Icon
                  name='chevron-down'
                  className='text-[20px]'
                />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
