import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Dispatch, Fragment, SetStateAction, useEffect, useRef } from 'react'
import { Todo } from '../models/Todo'
import { useTodosStore } from '../stores/todos.store'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'
import UISpinner from './UISpinner'

export interface Props {
  total?: number
  todos?: Todo[]
  isLoading: boolean
  childrenMap: Record<string, Todo[]>
  isExpandMap: Record<string, boolean>
  updateStatus: (status: Todo['status'], todoId?: string) => void
  setChildrenMap: Dispatch<SetStateAction<Record<string, Todo[]>>>
  setIsExpandMap: Dispatch<SetStateAction<Record<string, boolean>>>
  setPage: Dispatch<SetStateAction<number>>
  isTodosNextLoading: boolean
}

export default function TodosCards(props: Props) {
  const todosStore = useTodosStore()
  const nextLoaderEl = useRef<HTMLDivElement>(null)

  const getDescendantsFlat = async (todoId?: string): Promise<void> => {
    if (todoId == null) return
    if (!props.isExpandMap[todoId] && props.childrenMap[todoId] == null) {
      const res = await todosStore.getDescendantsFlat(todoId)
      props.setChildrenMap((prev) => ({ ...prev, [todoId]: res }))
    }

    props.setIsExpandMap((prev) => ({ ...prev, [todoId]: !props.isExpandMap[todoId] }))
  }
  const updateStatus = (status: Todo['status'], index: number, parentTodoId?: string): void => {
    if (parentTodoId == null) return

    if (props.childrenMap[parentTodoId][index].id)
      todosStore.updateStatus(props.childrenMap[parentTodoId][index].id, status)

    props.setChildrenMap((prev) => {
      prev[parentTodoId][index].status = status
      return { ...prev }
    })
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
                getDescendantsFlat={getDescendantsFlat}
                updateStatus={props.updateStatus}
                idExpanded={!!(todo.id && props.isExpandMap[todo.id])}
              />
              {todo.id &&
                props.isExpandMap[todo.id] &&
                props.childrenMap[todo.id]?.map((child, index) => (
                  <div
                    key={child.id}
                    className='flex items-center gap-[4px]'>
                    <Icon
                      name='reply'
                      className='text-[16px]'
                    />
                    <TodoCard
                      todo={child}
                      updateStatus={(status) => updateStatus(status, index, todo.id)}
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
  todo: Todo
  idExpanded?: boolean
  updateStatus?: Props['updateStatus']
  getDescendantsFlat?: (todoId?: string) => Promise<void>
}) {
  const searchParams = useSearchParams()

  const isFiltered =
    !!searchParams.get('tags') || !!searchParams.get('status') || !!searchParams.get('searchText')

  const isShowBadge = isFiltered ? true : !props.todo.parentId

  return (
    <div className='w-full overflow-hidden | flex flex-col gap-[8px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
      <div className='flex items-center'>
        {isShowBadge && <TagBadge id={props.todo.tagId} />}
        <Link
          href={`/todos/${props.todo.id}`}
          className='block | text-[14px] truncate | w-full | px-[6px]'>
          {props.todo.description?.split(/\n/)[0]}
        </Link>
        <div className='flex items-center gap-[6px]'>
          <TodosStatus
            status={props.todo.status}
            select={(status) => props.updateStatus?.(status, props.todo.id)}
          />
          {props.todo.id && (
            <TodosDropdown
              todo={props.todo}
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
              onClick={() => props.getDescendantsFlat?.(props.todo.id)}>
              {props.idExpanded ? (
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
