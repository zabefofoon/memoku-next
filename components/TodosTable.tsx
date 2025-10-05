import { useDateUtil } from '@/hooks/useDateUtil'
import { Todo } from '@/models/Todo'
import { useTagsStore } from '@/stores/tags.store'
import Link from 'next/link'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import TodosStatus from './TodosStatus'

export interface Props {
  todos?: Todo[]
}

export default function TodosTable(props: Props) {
  const dateUtil = useDateUtil()
  const tagsStore = useTagsStore()

  return (
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | overflow-hidden'>
      <table className='table-fixed | w-full | text-[13px]'>
        <thead className='border-b-3 border-gray-100 dark:border-zinc-700'>
          <tr>
            <th
              scope='col'
              className='py-[12px] w-[128px]'>
              태그
            </th>
            <th
              scope='col'
              className='py-[12px] w-[128px]'>
              진행상태
            </th>
            <th
              scope='col'
              className='py-[12px] | text-left'>
              내용
            </th>
            <th
              scope='col'
              className='py-[12px] w-[128px]'>
              수정일
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
                  <TagBadge todo={todo} />
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
                <Link
                  className='py-[12px] | block'
                  href={`/todos/${todo.id}`}>
                  {dateUtil.parseDate(todo.modified)}
                </Link>
              </td>
              <td className='opacity-70'>
                <Link
                  className='py-[12px] | block'
                  href={`/todos/${todo.id}`}>
                  {dateUtil.parseDate(todo.created)}
                </Link>
              </td>
              <td className='py-[12px]'>
                <Link
                  href='#'
                  className='w-fit | bg-red-100 dark:bg-transparent dark:border border-red-600 | mx-auto px-[8px] py-[4px] rounded-full | flex items-center justify-center | text-red-500 dark:text-red-600 | hover:underline'>
                  <Icon
                    name='delete'
                    className='text-[20px]'
                  />
                  <span className='font-[700] text-[12px]'>DELETE</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
