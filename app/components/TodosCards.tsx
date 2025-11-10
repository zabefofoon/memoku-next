import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Dispatch, Fragment, SetStateAction, useEffect, useRef } from 'react'
import { TodoWithChildren } from '../models/Todo'
import { useTodosStore } from '../stores/todos.store'
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
        <div className='sm:hidden | flex-1 h-full | py-[80px] | text-center'>
          {props.isLoading && <UISpinner />}
          {!props.isLoading && !props.todos?.length && (
            <p className='text-[13px] opacity-70'>데이터가 없습니다.</p>
          )}
        </div>
      )}
      {!props.isLoading && !!props.todos?.length && (
        <div className='flex flex-col gap-[8px] sm:hidden'>
          {props.todos?.map((todo) => (
            <Fragment key={todo.id}>
              <TodoCard
                todo={todo}
                expandRow={expandRow}
                updateStatus={(status, todo) => props.updateStatus(todo, status)}
              />
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
  const searchParams = useSearchParams()

  const isFiltered =
    !!searchParams.get('tags') || !!searchParams.get('status') || !!searchParams.get('searchText')

  const isShowBadge = isFiltered ? true : !props.todo.parentId

  return (
    <div className='w-full overflow-hidden | flex flex-col gap-[8px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
      <div className='flex items-center'>
        {isShowBadge && (
          <Link
            className='relative py-[12px] flex justify-center'
            href={`/todos/?todoTag=${props.todo.id}`}>
            <TagBadge id={props.todo.tagId} />
          </Link>
        )}
        <Link
          href={`/todos/${props.todo.id}`}
          className='block | text-[14px] truncate | w-full | px-[6px]'>
          {props.todo.description?.split(/\n/)[0]}
        </Link>
        <div className='flex items-center gap-[6px]'>
          <TodosStatus
            status={props.todo.status}
            select={(status) => props.updateStatus?.(status, props.todo)}
          />
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

      <div className='flex items-center | pt-[8px] | border-t border-gray-100 dark:border-zinc-600'>
        <div className='w-full | flex items-center gap-[4px]'>
          <TodosPeriodText todo={props.todo} />
          {!isFiltered && !props.todo.parentId && props.todo.childId && (
            <button
              type='button'
              className='ml-auto'
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
