import { TodoWithChildren } from '@/app/models/Todo'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useRef } from 'react'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'
import UISpinner from './UISpinner'

interface Props {
  loadTodos: (page: number) => void
}

export default function TodosTable(props: Props) {
  const isTodosNextLoading = useTodosPageStore((state) => state.isTodosNextLoading)
  const isTodosLoading = useTodosPageStore((state) => state.isTodosLoading)
  const todos = useTodosPageStore((state) => state.todos)
  const page = useTodosPageStore((state) => state.page)
  const setPage = useTodosPageStore((state) => state.setPage)
  const total = useTodosPageStore((state) => state.total)

  const nextLoaderEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isTodosNextLoading && !isTodosLoading) {
        setPage(page + 1, props.loadTodos)
      }
    })
    if (nextLoaderEl.current) observer.observe(nextLoaderEl.current)

    return () => observer.disconnect()
  }, [isTodosLoading, isTodosNextLoading, page, setPage])

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
          {(isTodosLoading || !todos?.length) && (
            <tr>
              <td
                colSpan={6}
                className='text-center'>
                {isTodosLoading && <p className='w-fit | mx-auto py-[80px]'>{<UISpinner />}</p>}
                {!isTodosLoading && !todos?.length && (
                  <p className='w-fit | mx-auto py-[80px] | text-[13px] opacity-70'>
                    데이터가 없습니다.
                  </p>
                )}
              </td>
            </tr>
          )}
          {!isTodosLoading &&
            todos?.map((todo, index) => (
              <Fragment key={todo.id}>
                <TodosTableRow
                  index={index}
                  todo={todo}
                />
                {todo.isExpanded &&
                  todo.children?.map((child) => (
                    <TodosTableRow
                      key={child.id}
                      todo={child}
                      parent={todo}
                    />
                  ))}
              </Fragment>
            ))}
          {!isTodosLoading && todos && (total ?? 0) > todos.length && (
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
  index?: number
}) {
  const searchParams = useSearchParams()
  const expandRow = useTodosPageStore((state) => state.expandRow)
  const updateStatus = useTodosPageStore((state) => state.updateStatus)

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
            onClick={() => expandRow(props.todo)}>
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
          href={{
            pathname: '/todos',
            query: {
              ...Object.fromEntries(searchParams),
              todoTag: props.todo.id,
            },
          }}>
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
            select={(status) => updateStatus(props.todo, status, props.parent?.id)}
          />
        </div>
      </td>
      <th scope='row'>
        <Link
          className='text-left truncate | py-[8px] | block | max-w-[600px]'
          href={{ pathname: `/todos/${props.todo.id}` }}>
          {props.todo.description?.slice(0, 40)?.split(/\n/)[0]}
        </Link>
      </th>
      <td>
        <div className='flex items-center justify-center gap-[8px]'>
          <Link
            className='w-full | py-[8px] | block'
            href={{ pathname: `/todos/${props.todo.id}` }}>
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
