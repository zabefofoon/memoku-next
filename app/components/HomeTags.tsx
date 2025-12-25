'use client'

import { todosDB } from '@/app/lib/todos.db'
import { Todo } from '@/app/models/Todo'
import { useTagsStore } from '@/app/stores/tags.store'
import { TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Icon } from './Icon'

interface Group {
  id: string
  totalCount: number
  undoneCount: number
}

export default function HomeTags() {
  const tagsMap = useTagsStore((state) => state.tagsMap)

  const [todos, setTodos] = useState<Todo[]>()

  const data: Group[] = useMemo(() => {
    const map =
      todos?.reduce<Record<string, Group>>((acc, current) => {
        const currentTagId = current.tagId ?? ''
        const id = tagsMap[currentTagId] ? currentTagId : '' // 태그 없으면 그룹핑용 기본값
        if (!acc[id]) acc[id] = { id, totalCount: 0, undoneCount: 0 }
        acc[id].totalCount += 1

        if (current.status !== 'done') acc[id].undoneCount += 1

        return acc
      }, {}) ?? []
    return Object.values(map)
  }, [tagsMap, todos])

  const loadTodos = async () => {
    const res = await todosDB.getAllTodos()
    setTodos(res)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div className='emboss-sheet flex-1 min-w-[300px] shrink-0 | flex flex-col'>
      <div className='flex flex-col | p-[16px]'>
        {data.map((item) => (
          <Link
            key={item.id}
            href={`/todos?tags=${item.id}`}
            className='flex items-center gap-[6px] | border-t border-slate-100 dark:border-zinc-600 last:border-b | py-[4px]'>
            <div className='w-full | flex items-center justify-between'>
              <div className='expand-hitbox | flex items-center gap-[4px]'>
                <Icon
                  name='tag-active'
                  className='text-[11px] translate-y-[1px]'
                  style={{
                    color: item
                      ? TAG_COLORS[tagsMap[item.id]?.color]?.white || 'var(--color-slate-500)'
                      : 'var(--color-slate-500)',
                  }}
                />

                <p className='text-[12px] text-gray-600 dark:text-zinc-200 leading-[100%]'>
                  {tagsMap[item.id]?.label ?? 'MEMO'}
                </p>
              </div>
              <p className='text-[12px] font-[700]'>
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
