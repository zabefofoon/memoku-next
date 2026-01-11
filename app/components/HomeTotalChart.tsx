import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'

interface Props {
  data: { key: string; name: string; value: number; fill: string }[]
  total: number
  isDarkMode: boolean
}

export default function HomeTotalChart({ data, total, isDarkMode }: Props) {
  return (
    <ResponsiveContainer
      width={'100%'}
      height={'100%'}
      minHeight='300px'>
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
            fill: isDarkMode ? 'var(--color-zinc-700)' : 'var(--color-gray-200)',
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
  )
}
