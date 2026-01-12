'use client'

import { todosDB } from '@/app/lib/todos.db'
import { STATUS_MAP } from '@/const'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { useThemeStore } from '../stores/theme.store'

const HomeTotalChart = dynamic(() => import('./HomeTotalChart'), {
  ssr: false,
  loading: () => <div className='min-h-[300px]' />,
})

export default function HomeTotal() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const t = useTranslations('General')

  const [total, setTotal] = useState<number>(0)

  const [data, setData] = useState<{ key: string; value: number; fill: string }[]>([])

  const loadTodos = useCallback(async () => {
    const res = await todosDB.getAllTodos()

    setTotal(res.length)

    const createds = res.filter((todo) => todo.status === 'created')
    const inprogresses = res.filter((todo) => todo.status === 'inprogress')
    const dones = res.filter((todo) => todo.status === 'done')
    const holds = res.filter((todo) => todo.status === 'hold')

    setData(
      [
        {
          key: 'created',
          value: createds.length,
          fill: STATUS_MAP['created'].color,
        },
        {
          key: 'inprogress',
          value: inprogresses.length,
          fill: STATUS_MAP['inprogress'].color,
        },
        {
          key: 'done',
          value: dones.length,
          fill: STATUS_MAP['done'].color,
        },
        {
          key: 'hold',
          value: holds.length,
          fill: STATUS_MAP['hold'].color,
        },
      ]
        .slice()
        .sort((a, b) => b.value - a.value)
    )
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return (
    <div className='emboss-sheet | flex-1 min-w-[260px] aspect-square shrink-0 overflow-hidden | flex flex-col justify-center'>
      <div className='relative'>
        <HomeTotalChart
          data={data}
          total={total}
          isDarkMode={isDarkMode}
        />
        <div className='absolute top-[calc(50%-90px)] left-[calc(50%-40px)] -translate-x-1/2 -translate-y-1/2 | flex flex-col items-end'>
          {data
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.key}
                className='flex items-center gap-[4px]'>
                <p
                  className='w-[8px] aspect-square rounded-full | leading-[100%]'
                  style={{ background: item.fill }}></p>
                <p className='text-[1.2cqh] sm:text-[1.2cqh]'>{t(item.key)}</p>
              </div>
            ))}
        </div>
        <div className='font-[700] | flex flex-col items-center justify-center | absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <p className='text-[16px] | flex gap-[4px]'>
            <span>{t('Unit', { n: data.find(({ key }) => key === 'done')?.value ?? 0 })}</span>/
            <span className='opacity-50'>{t('Unit', { n: total })}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
