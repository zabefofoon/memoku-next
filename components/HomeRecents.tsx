'use client'

import { useDateUtil } from '@/hooks/useDateUtil'
import { useTagsStore } from '@/stores/tags.store'
import { useTodosStore } from '@/stores/todos.store'
import etcUtil from '@/utils/etc.util'
import Link from 'next/link'
import { useEffect } from 'react'

export function HomeRecents() {
  const todoStore = useTodosStore()
  const tagsStore = useTagsStore()

  const dateUtil = useDateUtil()

  useEffect(() => {
    todoStore.loadRecentTodos()
  }, [])

  return (
    <div className='w-full | bg-white dark:bg-zinc-700 shadow-md rounded-xl | py-[16px]'>
      <h3 className='cursor-pointer | rounded-full | font-[700] text-[16px] | px-[16px]'>
        최근 할 일
      </h3>
      <div className='mt-[12px] | flex flex-col gap-[4px] | lg:h-[300px] overflow-auto'>
        {todoStore.recentTodos.map((todo) => (
          <Link
            key={todo.id}
            href={`/todos/${todo.id}`}
            className='border-t border-slate-100 dark:border-zinc-600 last:border-b | py-[4px] px-[8px]'>
            <div className='w-full overflow-hidden | hover:bg-slate-50 dark:hover:bg-zinc-600 | rounded-full | px-[8px] py-[4px]'>
              <p className='flex items-center gap-[4px]'>
                <span
                  className={etcUtil.classNames(['p-[4px] | rounded-full | aspect-square'])}
                  style={{
                    background: tagsStore.getTagsById(todo.tagId)?.color ?? '#000000',
                  }}></span>

                <span className='truncate text-[14px] lg:text-[15px]'>
                  [{tagsStore.getTagsById(todo.tagId)?.label ?? 'Memo'}] {todo.description}
                </span>
              </p>
              <p className='text-[11px] opacity-70 whitespace-nowrap'>
                {dateUtil.parseDate(todo.created)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
