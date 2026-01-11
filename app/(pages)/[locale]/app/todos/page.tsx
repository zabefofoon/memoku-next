import { TodosClient } from '@/app/components/TodosClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '할일',
}

export default function Todos() {
  return <TodosClient />
}
