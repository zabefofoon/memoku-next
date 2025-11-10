import { TodoWithChildren } from '@/app/models/Todo'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Dispatch, Fragment, SetStateAction, useEffect, useRef } from 'react'
import { useTodosStore } from '../stores/todos.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'
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

export default function TodosTable(props: Props) {
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
    <div className='hidden sm:block flex-1 w-full h-full overflow-auto | bg-white dark:bg-zinc-800 shadow-md rounded-xl'>
      <table className='w-full | text-[13px]'>
        <thead>
          <tr>
            <th
              scope='col'
              className='bg-white dark:bg-zinc-800 | sticky left-0 top-0 z-[2]'
              style={{ width: '50px' }}>
              <div className='h-[50px] | flex items-center justify-center | border-b-3 border-gray-200 dark:border-zinc-700'></div>
            </th>
            <th
              scope='col'
              className='bg-white dark:bg-zinc-800 | sticky left-0 top-0 z-[2]'
              style={{ width: '50px' }}>
              <div className='h-[50px] | flex items-center justify-center | border-b-3 border-gray-200 dark:border-zinc-700'>
                태그
              </div>
            </th>
            <th
              scope='col'
              className='bg-white dark:bg-zinc-800 | sticky left-0 top-0 z-[2]'
              style={{ width: '100px' }}>
              <div className='h-[50px] | flex items-center justify-center | border-b-3 border-gray-200 dark:border-zinc-700'>
                진행상태
              </div>
            </th>
            <th
              scope='col'
              className='text-left | bg-white dark:bg-zinc-800 | sticky left-0 top-0 z-[2]'>
              <div className='h-[50px] | flex items-center justify-start | border-b-3 border-gray-200 dark:border-zinc-700'>
                내용
              </div>
            </th>
            <th
              scope='col'
              className='w-[240px] | bg-white dark:bg-zinc-800 | sticky left-0 top-0 z-[2]'>
              <div className='h-[50px] | flex items-center justify-center | border-b-3 border-gray-200 dark:border-zinc-700'>
                일정
              </div>
            </th>
            <th
              scope='col'
              className='bg-white dark:bg-zinc-800 | sticky left-0 top-0 z-[2]'
              style={{ width: '50px' }}>
              <div className='h-[50px] | flex items-center justify-center | border-b-3 border-gray-200 dark:border-zinc-700'>
                <span className='sr-only'>Edit</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {(props.isLoading || !props.todos?.length) && (
            <tr>
              <td
                colSpan={6}
                className='text-center'>
                {props.isLoading && <p className='w-fit | mx-auto py-[80px]'>{<UISpinner />}</p>}
                {!props.isLoading && !props.todos?.length && (
                  <p className='w-fit | mx-auto py-[80px] | text-[13px] opacity-70'>
                    데이터가 없습니다.
                  </p>
                )}
              </td>
            </tr>
          )}
          {!props.isLoading &&
            props.todos?.map((todo, index) => (
              <Fragment key={todo.id}>
                <TodosTableRow
                  index={index}
                  todo={todo}
                  expandRow={expandRow}
                  updateStatus={(status, todo) => props.updateStatus(todo, status)}
                />
                {todo.isExpanded &&
                  todo.children?.map((child) => (
                    <TodosTableRow
                      key={child.id}
                      todo={child}
                      parent={todo}
                      updateStatus={(status) => props.updateStatus(child, status, todo.id)}
                    />
                  ))}
              </Fragment>
            ))}
          {!props.isLoading && props.todos && (props.total ?? 0) > props.todos.length && (
            <tr>
              <td colSpan={6}>
                <div
                  ref={nextLoaderEl}
                  className='text-center | py-[6px]'>
                  <UISpinner />
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function TodosTableRow(props: {
  todo: TodoWithChildren
  parent?: TodoWithChildren
  expandRow?: (todo: TodoWithChildren) => Promise<void>
  updateStatus?: (status: TodoWithChildren['status'], todo: TodoWithChildren) => void
  index?: number
}) {
  const searchParams = useSearchParams()

  const isFiltered =
    !!searchParams.get('tags') || !!searchParams.get('status') || !!searchParams.get('searchText')

  return (
    <tr
      className={etcUtil.classNames([
        'text-center | bg-white dark:bg-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-700/50 dark:border-zinc-700 border-gray-200',
        {
          'border-t first:border-b-0': isFiltered || !props.todo.parentId,
        },
      ])}>
      <td className='pl-[8px]'>
        {!isFiltered && !props.todo.parentId && props.todo.childId && (
          <button
            type='button'
            className='w-full flex justify-center'
            onClick={() => props.expandRow?.(props.todo)}>
            {props.todo?.isExpanded ? (
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
      </td>
      <td
        className={etcUtil.classNames({
          'overflow-hidden': props.index === 0,
        })}>
        <Link
          className='relative py-[8px] flex justify-center'
          href={`/todos/?todoTag=${props.todo.id}`}>
          {!isFiltered && props.todo.parentId && (
            <div className='absolute top-[-30px] | border-l-[2px] border-dotted border-slate-300 dark:border-zinc-600 | h-[40px]'></div>
          )}
          {isFiltered || !props.todo.parentId ? (
            <TagBadge id={props.todo.tagId} />
          ) : (
            <div className='w-[10px] aspect-square | bg-slate-300 dark:bg-zinc-600 rounded-full'></div>
          )}
        </Link>
      </td>
      <td>
        <div className='py-[8px] | flex justify-center'>
          <TodosStatus
            status={props.todo.status}
            select={(status) => props.updateStatus?.(status, props.todo)}
          />
        </div>
      </td>
      <th scope='row'>
        <Link
          className='text-left truncate | py-[8px] | block | max-w-[600px]'
          href={`/todos/${props.todo.id}`}>
          {props.todo.description?.slice(0, 40)?.split(/\n/)[0]}
        </Link>
      </th>
      <td>
        <div className='flex items-center justify-center gap-[8px]'>
          <Link
            className='w-full | py-[8px] | block'
            href={`/todos/${props.todo.id}`}>
            <TodosPeriodText todo={props.todo} />
          </Link>
        </div>
      </td>

      <td className='py-[8px] pr-[8px]'>
        <div className='w-[20px] mx-auto'>
          {props.todo.id && (
            <TodosDropdown
              hideDelete
              todo={props.todo}
              parent={props.parent}
              position={{ x: 'RIGHT' }}
            />
          )}
        </div>
      </td>
    </tr>
  )
}
