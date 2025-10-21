import Link from 'next/link'
import { Fragment, useState } from 'react'
import { useDateUtil } from '../hooks/useDateUtil'
import { Todo } from '../models/Todo'
import { useTodosStore } from '../stores/todos.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import TodosDeleteButton from './TodosDeleteButton'
import TodosPeriodText, { BottomTexts } from './TodosPeriodText'
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
  const dateUtil = useDateUtil()

  return (
    <div className='w-full | flex flex-col gap-[8px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
      <div className='flex items-center gap-[6px]'>
        <TagBadge id={props.todo.tagId} />
        <TodosStatus
          status={props.todo.status}
          select={(status) => props.updateStatus?.(status, props.todo.id)}
        />
        <div className='relative'>
          {
            <Link
              href={`?time=${props.todo?.id}`}
              className={etcUtil.classNames(
                'relative | w-[24px] aspect-square | rounded-full | flex items-center justify-center',
                props.todo && props.todo.start && props.todo.end
                  ? 'bg-violet-500 '
                  : 'opacity-70 | bg-slate-100 text-slate-600'
              )}>
              <Icon
                name='alarm'
                className={etcUtil.classNames([
                  'text-[16px]',
                  props.todo && props.todo.start && props.todo.end ? 'text-white' : '',
                ])}
              />
            </Link>
          }
          {props.todo?.start && (
            <Link
              href={`?deleteTime=${props.todo?.id}`}
              onClick={(event) => event.stopPropagation()}>
              <Icon
                name='close'
                className='p-[2px] | rounded-full absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 | bg-slate-100 dark:bg-zinc-600 | text-[12px]'
              />
            </Link>
          )}
        </div>
        <TodosPeriodText
          todo={props.todo}
          hideBottomText
        />
        <div className='ml-auto'>{props.todo.id && <TodosDeleteButton id={props.todo.id} />}</div>
      </div>
      <Link
        href={`/todos/${props.todo.id}`}
        className='block | text-[14px] truncate | w-full | px-[6px]'>
        {props.todo.description}
      </Link>
      <div className='flex items-center | pt-[8px] | border-t border-gray-100 dark:border-zinc-600'>
        <div className='w-full | flex items-center gap-[4px]'>
          {!props.todo.start ? (
            <p className='text-[11px] opacity-70'>
              {dateUtil.parseDate(props.todo.created)} 생성됨
            </p>
          ) : (
            <BottomTexts todo={props.todo} />
          )}
          {(props.todo.parentId == null || props.todo.parentId === -1) && (
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
