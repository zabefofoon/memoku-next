import { CreatedSeriesPoint, todosDB } from '@/app/lib/todos.db'
import dayjs from 'dayjs'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, XAxis } from 'recharts'

export default function HomeSequel() {
  const [data, setData] = useState<
    (CreatedSeriesPoint & {
      createdMA: number
    })[]
  >()

  const withMovingAverage = (
    data: CreatedSeriesPoint[],
    window = 7
  ): (CreatedSeriesPoint & { createdMA: number })[] => {
    const arr = data.map((d) => d.created)
    const out = data.map((d, i) => {
      const s = Math.max(0, i - window + 1)
      const slice = arr.slice(s, i + 1)
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length
      return { ...d, createdMA: +avg.toFixed(2) }
    })
    return out
  }

  const loadData = useCallback(async (): Promise<void> => {
    const base = await todosDB.getCreatedSeries30d()
    const withMA = withMovingAverage(base, 7)
    setData(withMA)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className='gap-[8px] flex flex-col | shadow-md rounded-xl bg-indigo-500 dark:bg-indigo-600 | p-[16px]'>
      <h3 className='font-[700] text-[16px] | text-white'>주간 활동</h3>
      <ResponsiveContainer
        width='100%'
        height='100%'
        minHeight={200}>
        <ComposedChart
          data={data}
          margin={{ top: 20, left: 12, right: 12, bottom: 20 }}>
          <defs>
            <filter
              id='lineShadow'
              x='-20%'
              y='-20%'
              width='140%'
              height='140%'
              filterUnits='objectBoundingBox'>
              <feDropShadow
                dx='0'
                dy='2'
                stdDeviation='2'
                floodColor='black'
                floodOpacity='0.35'
              />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray='3 3' />
          {/* <YAxis
            allowDecimals={false}
            tick={{ fill: '#fff' }}
          /> */}
          <XAxis
            interval='preserveStartEnd'
            fontSize={11}
            orientation='top'
            ticks={data?.map((d) => d.day).filter((_, i) => i % 5 === 0)}
            tick={{ fill: 'rgba(255,255,255,.7)' }}
            dataKey='day'
            stroke='#ffffff10'
            tickMargin={8}
            tickFormatter={(v) => dayjs(v).format('MM/DD')}
          />

          <Line
            filter='url(#lineShadow)'
            type='monotone'
            dataKey='createdMA'
            name='Created (7d MA)'
            isAnimationActive={false}
            dot={({ cx, cy, index }): ReactElement<SVGElement> => {
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  key={index}
                  r={index % 5 !== 0 ? 0 : 4}
                  fill='#fff'
                />
              )
            }}
            stroke='rgba(255,255,255,1)'
            strokeWidth={2}
            strokeLinecap='round'
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
