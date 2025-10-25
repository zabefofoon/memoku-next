'use client'

import { useTodosStore } from '@/app/stores/todos.store'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

export default function HomeTotal() {
  const [cookies] = useCookies()

  const todoStore = useTodosStore()

  const [total, setTotal] = useState<number>(0)
  const [done, setdone] = useState<number>(0)

  const [data, setData] = useState<{ name: string; value: number }[]>([])

  const loadTodos = async () => {
    const res = await todoStore.getTodos()
    setTotal(res.length)

    const dones = res.filter((todo) => todo.status === 'done')
    setdone(dones.length)

    setData([
      { name: 'done', value: dones.length },
      { name: 'total', value: res.length ?? 0 },
    ])
  }

  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div className='relative | flex-1 min-w-[300px] shrink-0 | flex flex-col | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[16px]'>
      <ResponsiveContainer
        width={'100%'}
        height={'100%'}
        minHeight={'300px'}>
        <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient
              id='colorUv'
              x1='1'
              y1='1'
              x2='0'
              y2='0'>
              <stop
                offset='30%'
                stopColor='#6584FF'
                stopOpacity={0.5}
              />
              <stop
                offset='95%'
                stopColor='#FFFFFF'
                stopOpacity={0.5}
              />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            innerRadius={'82%'}
            outerRadius={'92%'}
            dataKey='value'
            isAnimationActive={false}>
            {data?.map((entry, index) => (
              <Cell
                key={entry.name + index}
                fill={
                  entry.name === 'done'
                    ? 'var(--color-indigo-500)'
                    : cookies['x-theme'] === 'dark'
                      ? 'var(--color-zinc-700)'
                      : 'var(--color-gray-200)'
                }
                style={{
                  outline: '0',
                  filter:
                    cookies['x-theme'] === 'dark'
                      ? `drop-shadow(0px 2px 5px var(--color-gray-800))`
                      : `drop-shadow(0px 2px 3px var(--color-gray-400))`,
                }}
                stroke='0'
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className='font-[700] | flex flex-col items-center justify-center | absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <p className='text-[15px]'>전체</p>
        <p className='text-[18px] | flex gap-[4px]'>
          <span>{done}개</span>/<span className='opacity-50'>{total}개</span>
        </p>
      </div>
    </div>
  )
}
