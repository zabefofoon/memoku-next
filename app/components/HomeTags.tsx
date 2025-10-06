'use client'

import { Todo } from '@/app/models/Todo'
import { useTagsStore } from '@/app/stores/tags.store'
import { useTodosStore } from '@/app/stores/todos.store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import TagBadge from './TagBadge'

interface Group {
  id: string
  totalCount: number
  undoneCount: number
}

export default function HomeTags() {
  const todoStore = useTodosStore()
  const tagsStore = useTagsStore()

  const [todos, setTodos] = useState<Todo[]>()

  const data: Group[] = useMemo(() => {
    const map =
      todos?.reduce<Record<string, Group>>((acc, current) => {
        const id = current.tagId ?? 'undefined' // 태그 없으면 그룹핑용 기본값
        if (!acc[id]) acc[id] = { id, totalCount: 0, undoneCount: 0 }
        acc[id].totalCount += 1

        const isDone = current.done
        if (!isDone) acc[id].undoneCount += 1

        return acc
      }, {}) ?? []

    return Object.values(map)
  }, [todos])

  const loadTodos = async () => {
    const res = await todoStore.getTodos()
    setTodos(res)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div className='flex-1 min-w-[300px] shrink-0 | flex flex-col | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[16px]'>
      <div className='relative | flex-1'>
        {data.map((item) => (
          <Link
            key={item.id}
            href={`/todos/${item.id}`}
            className='flex items-center gap-[6px] | border-t border-slate-100 dark:border-zinc-600 last:border-b | py-[4px]'>
            <TagBadge todo={{ tagId: item.id }} />

            <div className='w-full | flex items-center justify-between'>
              <p className='font-[700] text-[15px]'>
                {tagsStore.getTagsById(item.id)?.label ?? 'Memo'}
              </p>
              <p className='text-[14px] font-[700]'>
                <span>{item.undoneCount}개</span>/
                <span className='opacity-50'>{item.totalCount}개</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
