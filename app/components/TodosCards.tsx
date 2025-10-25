import Link from 'next/link'
import { Fragment, useState } from 'react'
import { Todo } from '../models/Todo'
import { useTodosStore } from '../stores/todos.store'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'

export interface Props {
  todos?: Todo[]
  updateStatus?: (status: Todo['status'], todoId?: number) => void
}

export default function TodosCards(props: Props) {
  const todosStore = useTodosStore()

  const [childrenMap, setChildrenMap] = useState<Record<number, Todo[]>>({})
  const [isExpandMap, setIsExpandMap] = useState<Record<number, boolean>>({})

  const getDescendantsFlat = async (todoId?: number): Promise<void> => {
    if (todoId == null) return
    if (!isExpandMap[todoId] && childrenMap[todoId] == null) {
      const res = await todosStore.getDescendantsFlat(todoId)
      setChildrenMap((prev) => ({ ...prev, [todoId]: res }))
    }

    setIsExpandMap((prev) => ({ ...prev, [todoId]: !isExpandMap[todoId] }))
  }

  return (
    <div className='flex flex-col gap-[8px] sm:hidden'>
      {props.todos?.map((todo) => (
        <Fragment key={todo.id}>
          <TodoCard
            todo={todo}
            getDescendantsFlat={getDescendantsFlat}
            idExpanded={!!(todo.id && isExpandMap[todo.id])}
          />
          {todo.id &&
            isExpandMap[todo.id] &&
            childrenMap[todo.id]?.map((child) => (
              <div
                key={child.id}
                className='flex items-center gap-[4px]'>
                <Icon
                  name='reply'
                  className='text-[16px]'
                />
                <TodoCard todo={child} />
              </div>
            ))}
        </Fragment>
      ))}
    </div>
  )
}

function TodoCard(props: {
  todo: Todo
  idExpanded?: boolean
  updateStatus?: Props['updateStatus']
  getDescendantsFlat?: (todoId?: number) => Promise<void>
}) {
  return (
    <div className='w-full overflow-hidden | flex flex-col gap-[8px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
      <div className='flex items-center'>
        {(!props.todo.parentId || props.todo.parentId === -1) && <TagBadge id={props.todo.tagId} />}
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
          {(props.todo.parentId == null || props.todo.parentId === -1) && props.todo.childId && (
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
