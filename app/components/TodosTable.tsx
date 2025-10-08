import { useDateUtil } from '@/app/hooks/useDateUtil'
import { Todo } from '@/app/models/Todo'
import Link from 'next/link'
import TagBadge from './TagBadge'
import TodosDeleteButton from './TodosDeleteButton'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'

export interface Props {
  todos?: Todo[]
}

export default function TodosTable(props: Props) {
  const dateUtil = useDateUtil()

  return (
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | overflow-hidden'>
      <table className='table-fixed | w-full | text-[13px]'>
        <thead className='border-b-3 border-gray-100 dark:border-zinc-700'>
          <tr>
            <th
              scope='col'
              className='py-[12px] w-[80px]'>
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
              className='py-[12px] w-[200px]'>
              기한
            </th>
            <th
              scope='col'
              className='py-[12px] w-[128px]'>
              생성일
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
            <tr
              key={todo.id}
              className='text-center | bg-white dark:bg-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-700/50 border-b last:border-b-0 dark:border-zinc-700 border-gray-200'>
              <td>
                <Link
                  className='py-[12px] flex justify-center'
                  href={`/todos/${todo.id}`}>
                  <TagBadge id={todo.tagId} />
                </Link>
              </td>
              <td>
                <Link
                  className='py-[12px] | flex justify-center'
                  href={`/todos/${todo.id}`}>
                  <TodosStatus />
                </Link>
              </td>
              <th scope='row'>
                <Link
                  className='text-left truncate | py-[12px] | block'
                  href={`/todos/${todo.id}`}>
                  {todo.description?.split(/\n/)[0]}
                </Link>
              </th>
              <td className='opacity-70'>
                {(todo.start && todo.end && (
                  <Link
                    className='py-[12px] | block'
                    href={`/todos/${todo.id}`}>
                    <TodosPeriodText todo={todo} />
                  </Link>
                )) ||
                  '--'}
              </td>
              <td className='opacity-70'>
                <Link
                  className='py-[12px] | block'
                  href={`/todos/${todo.id}`}>
                  {dateUtil.parseDate(todo.created)}
                </Link>
              </td>
              <td className='py-[12px]'>{todo.id && <TodosDeleteButton id={todo.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
