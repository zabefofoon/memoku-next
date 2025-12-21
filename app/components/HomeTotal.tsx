'use client'

import { todosDB } from '@/app/lib/todos.db'
import { STATUS_MAP } from '@/const'
import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import { useThemeStore } from '../stores/theme.store'

export default function HomeTotal() {
  const [cookies] = useCookies()

  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const [total, setTotal] = useState<number>(0)

  const [data, setData] = useState<{ key: string; name: string; value: number; fill: string }[]>([])

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
          name: STATUS_MAP['created'].label,
          value: createds.length,
          fill: STATUS_MAP['created'].color,
        },
        {
          key: 'inprogress',
          name: STATUS_MAP['inprogress'].label,
          value: inprogresses.length,
          fill: STATUS_MAP['inprogress'].color,
        },
        {
          key: 'done',
          name: STATUS_MAP['done'].label,
          value: dones.length,
          fill: STATUS_MAP['done'].color,
        },
        {
          key: 'hold',
          name: STATUS_MAP['hold'].label,
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
    <div className='emboss-sheet | flex-1 min-w-[300px] shrink-0 | flex flex-col justify-center'>
      <div className='relative'>
        <ResponsiveContainer
          width={'100%'}
          height={'100%'}
          minHeight={'300px'}>
          <RadialBarChart
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
            data={data}
            barSize={10}
            startAngle={90}
            endAngle={-180}
            innerRadius={60}>
            <PolarAngleAxis
              type='number'
              domain={[0, total]}
              tick={false}
            />
            <RadialBar
              background={{
                fill: cookies['x-theme'] ? 'var(--color-zinc-700)' : 'var(--color-gray-200)',
              }}
              dataKey='value'
              cornerRadius={50}
              isAnimationActive={false}
              style={{
                outline: '0',
                filter: isDarkMode
                  ? `drop-shadow(0px 2px 5px var(--color-gray-800))`
                  : `drop-shadow(0px 2px 3px var(--color-gray-400))`,
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className='absolute top-[calc(50%-90px)] left-[calc(50%-40px)] -translate-x-1/2 -translate-y-1/2 | flex flex-col items-end'>
          {data
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.name}
                className='flex items-center gap-[4px]'>
                <p
                  className='w-[8px] aspect-square rounded-full | leading-[100%]'
                  style={{ background: item.fill }}></p>
                <p className='text-[1.2cqh] sm:text-[1.2cqh]'>{item.name}</p>
              </div>
            ))}
        </div>
        <div className='font-[700] | flex flex-col items-center justify-center | absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <p className='text-[16px] | flex gap-[4px]'>
            <span>{data.find(({ key }) => key === 'done')?.value}개</span>/
            <span className='opacity-50'>{total}개</span>
          </p>
        </div>
      </div>
    </div>
  )
}
