'use client'

import { CreatedSeriesPoint, todosDB } from '@/app/lib/todos.db'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import type { HomeSequelData } from '../models/Chart'

const HomeSequelChart = dynamic(() => import('./HomeSequelChart'), {
  ssr: false,
  loading: () => <div className='min-h-[200px]' />,
})

export default function HomeSequel() {
  const [data, setData] = useState<HomeSequelData[]>()
  const t = useTranslations('Home')

  const withMovingAverage = (data: CreatedSeriesPoint[], window = 7): HomeSequelData[] => {
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
      <h3 className='font-[700] text-[16px] | text-white'>{t('HomeSequelLabel')}</h3>
      <HomeSequelChart data={data} />
    </div>
  )
}
