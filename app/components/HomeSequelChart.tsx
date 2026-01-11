import dayjs from 'dayjs'
import { ReactElement } from 'react'
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, XAxis } from 'recharts'
import type { HomeSequelData } from '../models/Chart'

interface Props {
  data?: HomeSequelData[]
}

export default function HomeSequelChart({ data }: Props) {
  return (
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
  )
}
