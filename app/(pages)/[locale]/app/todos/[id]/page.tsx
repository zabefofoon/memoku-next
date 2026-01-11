import TodosDetailClient from '@/app/components/TodosDetailClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '할일 상세',
}

export default function TodosDetail() {
  return <TodosDetailClient />
}
