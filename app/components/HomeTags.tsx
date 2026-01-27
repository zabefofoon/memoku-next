'use client'

import { Link } from '@/app/components/Link'
import { todosDB } from '@/app/lib/todos.db'
import { Todo } from '@/app/models/Todo'
import { useTagsStore } from '@/app/stores/tags.store'
import { TAG_COLORS } from '@/const'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Else, If, Then } from 'react-if'
import { Icon } from './Icon'

interface Group {
  id: string
  totalCount: number
  undoneCount: number
}

export default function HomeTags() {
  const tagsMap = useTagsStore((state) => state.tagsMap)
  const t = useTranslations()

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
    <div className='emboss-sheet flex-1 min-w-[260px] shrink-0 | flex flex-col'>
      <If condition={data.length}>
        <Then>
          <div className='flex flex-col | p-[16px]'>
            {data.map((item) => (
              <Link
                key={item.id}
                href={`/app/todos?tags=${item.id}`}
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
                    <span>{t('General.Unit', { n: item.undoneCount })}</span>/
                    <span className='opacity-50'>{t('General.Unit', { n: item.totalCount })}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Then>
        <Else>
          <div className='h-full w-full min-h-[180px] | flex flex-col items-center justify-center gap-[6px]'>
            <Icon
              name='tag'
              className='opacity-80'
            />
            <p className='whitespace-pre-line text-[13px] text-center leading-tight opacity-80'>
              {t('Home.HomeTagEmpty')}
            </p>
            <Link
              href='/app/settings'
              replace
              className='text-[13px] bg-indigo-500 text-white | mt-[4px] py-[4px] px-[12px] | rounded-lg'>
              {t('Todo.AddTodo')}
            </Link>
          </div>
        </Else>
      </If>
    </div>
  )
}
