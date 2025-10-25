import { Todo } from '@/app/models/Todo'
import Link from 'next/link'
import { Fragment, useState } from 'react'
import { useTodosStore } from '../stores/todos.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'

export interface Props {
  todos?: Todo[]
  updateStatus?: (status: Todo['status'], todoId?: number) => void
}

export default function TodosTable(props: Props) {
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
    <div className='hidden sm:block flex-1 w-full h-full overflow-auto | bg-white dark:bg-zinc-800 shadow-md rounded-xl'>
      <table className='table-fixed | w-full | text-[13px]'>
        <thead className='border-b-3 border-gray-100 dark:border-zinc-700'>
          <tr>
            <th
              scope='col'
              className='py-[12px] w-[52px]'></th>
            <th
              scope='col'
              className='py-[12px] w-[52px]'>
              태그
            </th>
            <th
              scope='col'
              className='py-[12px] w-[100px]'>
              진행상태
            </th>
            <th
              scope='col'
              className='py-[12px] | text-left'>
              내용
            </th>
            <th
              scope='col'
              className='py-[12px] w-[260px]'>
              일정
            </th>
            <th
              scope='col'
              className='py-[12px] w-[128px]'>
              <span className='sr-only'>Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {props.todos?.map((todo) => (
            <Fragment key={todo.id}>
              <TodosTableRow
                todo={todo}
                getDescendantsFlat={getDescendantsFlat}
                idExpanded={!!(todo.id && isExpandMap[todo.id])}
                updateStatus={props.updateStatus}
              />
              {todo.id &&
                isExpandMap[todo.id] &&
                childrenMap[todo.id]?.map((child) => (
                  <TodosTableRow
                    key={child.id}
                    todo={child}
                    updateStatus={props.updateStatus}
                  />
                ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TodosTableRow(props: {
  todo: Todo
  idExpanded?: boolean
  updateStatus?: Props['updateStatus']
  getDescendantsFlat?: (todoId?: number) => Promise<void>
}) {
  return (
    <tr
      className={etcUtil.classNames([
        'text-center | bg-white dark:bg-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-700/50 dark:border-zinc-700 border-gray-200',
        {
          'border-t first:border-b-0': props.todo.parentId == null || props.todo.parentId === -1,
        },
      ])}>
      <td>
        {(props.todo.parentId == null || props.todo.parentId === -1) && props.todo.childId && (
          <button
            type='button'
            className='w-full flex justify-center'
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
      </td>
      <td>
        <Link
          className='relative py-[12px] flex justify-center'
          href={`/todos/${props.todo.id}`}>
          {props.todo.parentId && props.todo.parentId !== -1 && (
            <div className='absolute top-[-30px] | border-l-[2px] border-dotted border-slate-300 dark:border-zinc-600 | h-[40px]'></div>
          )}
          {props.todo.parentId == null || props.todo.parentId === -1 ? (
            <TagBadge id={props.todo.tagId} />
          ) : (
            <div className='w-[10px] aspect-square | bg-slate-300 dark:bg-zinc-600 rounded-full'></div>
          )}
        </Link>
      </td>
      <td>
        <div className='py-[12px] | flex justify-center'>
          <TodosStatus
            status={props.todo.status}
            select={(status) => props.updateStatus?.(status, props.todo.id)}
          />
        </div>
      </td>
      <th scope='row'>
        <Link
          className='text-left truncate | py-[12px] | block'
          href={`/todos/${props.todo.id}`}>
          {props.todo.description?.split(/\n/)[0]}
        </Link>
      </th>
      <td>
        <div className='flex items-center justify-center gap-[8px]'>
          <Link
            className='w-full | py-[12px] | block'
            href={`/todos/${props.todo.id}`}>
            <TodosPeriodText todo={props.todo} />
          </Link>
        </div>
      </td>

      <td className='py-[12px]'>
        <div className='w-[20px] mx-auto'>
          {props.todo.id && <TodosDropdown todo={props.todo} />}
        </div>
      </td>
    </tr>
  )
}
